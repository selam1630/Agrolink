import { Request, Response } from "express";
import axios from "axios";
import prisma from "../prisma/prisma";
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "";
const CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify/";
const CHAPA_INITIATE_URL = "https://api.chapa.co/v1/transaction/initialize";
export const createPayment = async (req: Request, res: Response) => {
  const { amount, currency } = req.body;
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated." });
  }
  if (!amount) {
    return res.status(400).json({ error: "Missing payment amount." });
  }
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      include: { product: true },
    });
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.phone) {
      return res.status(400).json({ error: "User phone number not found." });
    }
    const txRef = `order_${Date.now()}`;
    await prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          userId: userId,
          status: "pending",
          txRef: txRef,
          orderItems: {
            createMany: {
              data: cartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                priceAtTime: item.product.price || 0,
              })),
            },
          },
        },
      });
      await prisma.transaction.create({
        data: {
          txRef: txRef,
          amount: parseFloat(amount),
          userId: userId,
          orderId: newOrder.id, 
          status: "pending",
        },
      });
      await prisma.cartItem.deleteMany({
        where: { userId: userId },
      });
    });
    
    const response = await axios.post(
      CHAPA_INITIATE_URL,
      {
        amount: amount,
        currency: currency,
        phone_number: user.phone,
        first_name: user.name?.split(" ")[0] || "Customer",
        last_name: user.name?.split(" ")[1] || "",
        tx_ref: txRef, 
        callback_url: "http://localhost:5000/api/payment/verify",
        return_url: "http://localhost:5173/payment-success",
        customizations: {
          title: "Your Store Name",
          description: "Payment for your shopping cart",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Chapa payment error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to initiate payment." });
  }
};
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isSold: false,
      },
    });
    return res.status(200).json(products);
  } catch (err: any) {
    console.error("Error fetching products:", err.message);
    return res.status(500).json({ error: "Failed to fetch products." });
  }
};
export const verifyPayment = async (req: Request, res: Response) => {
  const { tx_ref } = req.query;

  console.log("Verify payment endpoint hit for tx_ref:", tx_ref);

  if (!tx_ref) {
    console.error("Transaction reference missing in query.");
    return res.status(400).json({ error: "Transaction reference missing" });
  }

  try {
    const response = await axios.get(`${CHAPA_VERIFY_URL}${tx_ref}`, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    });

    const paymentStatus = response.data.data.status;
    console.log("Chapa payment status:", paymentStatus);

    const transaction = await prisma.transaction.findUnique({
      where: { txRef: tx_ref as string },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
      },
    });

    if (!transaction || !transaction.order) {
      console.error("Transaction or associated order not found:", tx_ref);
      return res.status(404).json({ error: "Transaction or order not found." });
    }

    console.log("Current database transaction status:", transaction.status);

    if (paymentStatus === "success" && transaction.status === "pending") {
      const productIds = transaction.order.orderItems.map((item) => item.productId);

      await prisma.$transaction([
        prisma.transaction.update({
          where: { txRef: tx_ref as string },
          data: { status: "successful" },
        }),
        prisma.order.update({
          where: { id: transaction.orderId as string },
          data: { status: "completed" },
        }),
        prisma.product.updateMany({
          where: {
            id: { in: productIds },
          },
          data: {
            isSold: true,
          },
        }),
      ]);
      console.log("Successfully updated transaction, order, and products to isSold: true.");
    } else {
      console.log("Conditions for updating not met. Status was not 'success' or was not 'pending'.");
    }
    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Chapa verification error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to verify payment." });
  }
};
