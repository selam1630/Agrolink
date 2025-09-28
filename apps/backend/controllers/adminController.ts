import { Request, Response } from "express";
import prisma from "../prisma/prisma";

/**
 * @route POST /api/admin/farmers
 * @description Add a farmer to the registry (admin only)
 */
export const addFarmerToRegistry = async (req: Request, res: Response) => {
  const { name, phone, region } = req.body;
  const adminId = req.user?.id; // coming from JWT middleware

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  try {
    const existingFarmer = await prisma.farmerRegistry.findUnique({
      where: { phone },
    });

    if (existingFarmer) {
      return res
        .status(400)
        .json({ error: "Farmer with this phone already exists" });
    }

    const farmer = await prisma.farmerRegistry.create({
      data: {
        name,
        phone,
        region,
        addedById: adminId!,
      },
    });

    res.status(201).json({ message: "Farmer added to registry", farmer });
  } catch (error) {
    console.error("Error adding farmer:", error);
    res.status(500).json({ error: "Failed to add farmer" });
  }
};

/**
 * @route GET /api/admin/farmers
 * @description List all farmers in registry (admin only)
 */
export const listFarmers = async (req: Request, res: Response) => {
  try {
    const farmers = await prisma.farmerRegistry.findMany({
      include: {
        addedBy: { select: { id: true, name: true, phone: true } },
      },
    });

    res.status(200).json({ farmers });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};
