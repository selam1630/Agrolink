import { Request, Response } from "express";
import axios from "axios";
import prisma from "../prisma/prisma"; 

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "";
const CHAPA_VERIFY_URL = "https://api.chapa.co/v1/transaction/verify/";

export const createPayment = async (req: Request, res: Response) => {
  const { amount, currency, items } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "User not authenticated." });
  if (!amount || !items) return res.status(400).json({ error: "Missing payment data." });

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.phone) {
      return res.status(400).json({ error: "User phone number not found." });
    }

    const txRef = `order_${Date.now()}`;

    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency,
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

export const verifyPayment = async (req: Request, res: Response) => {
  const { tx_ref } = req.query;

  if (!tx_ref) return res.status(400).json({ error: "Transaction reference missing" });

  try {
    const response = await axios.get(`${CHAPA_VERIFY_URL}${tx_ref}`, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
      },
    });

    console.log("Chapa verification:", response.data);

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Chapa verification error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to verify payment." });
  }
};
