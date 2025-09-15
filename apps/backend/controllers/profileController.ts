import { Request, Response } from "express";
import prisma from "../prisma/prisma";
export const getFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const farmer = await prisma.user.findFirst({
      where: { id, role: "farmer" },
      include: {
        products: true,
        orders: {
          include: {
            orderItems: {
              include: { product: true },
            },
          },
        },
        transactions: true,
      },
    });

    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }

    const postedProducts = farmer.products
      .filter((p) => !p.isSold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        isSold: p.isSold,
        image: p.imageUrl,
      }));

    const soldProducts = farmer.products
      .filter((p) => p.isSold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        isSold: p.isSold,
        image: p.imageUrl,
      }));

    return res.status(200).json({
      farmer: {
        id: farmer.id,
        name: farmer.name,
        phone: farmer.phone,
        email: farmer.email,
      },
      postedProducts,
      soldProducts,
    });
  } catch (error) {
    console.error("Error fetching farmer profile:", error);
    return res
      .status(500)
      .json({ error: "Server error fetching farmer profile" });
  }
};
export const updateFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ error: "Name, phone, and email are required" });
    }

    const updatedFarmer = await prisma.user.update({
      where: { id },
      data: { name, phone, email },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      farmer: {
        id: updatedFarmer.id,
        name: updatedFarmer.name,
        phone: updatedFarmer.phone,
        email: updatedFarmer.email,
      },
    });
  } catch (error) {
    console.error("Error updating farmer profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};