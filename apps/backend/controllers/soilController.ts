import { Request, Response } from "express";
import prisma from "../prisma/prisma";
import axios from "axios";

const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || "";
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || "";
const SEND_SMS = process.env.SEND_SMS === "true";

function recommendFertilizer(reading: any) {
  const recommendations: { name: string; reason: string }[] = [];

  if (reading.pH < 6) recommendations.push({ name: "Lime", reason: "Raise soil pH" });
  else if (reading.pH > 7.5) recommendations.push({ name: "Sulfur", reason: "Lower soil pH" });

  if (reading.nitrogen < 20) recommendations.push({ name: "Urea", reason: "Increase N" });
  else if (reading.nitrogen > 50) recommendations.push({ name: "Reduce N fertilizer", reason: "High N levels" });

  if (reading.phosphorus < 15) recommendations.push({ name: "DAP", reason: "Increase P" });
  if (reading.potassium < 50) recommendations.push({ name: "Muriate of Potash", reason: "Increase K" });

  return recommendations;
}

async function sendSMS(recipients: string[], message: string) {
  if (!SEND_SMS) return console.log("SMS sending is disabled (SEND_SMS=false).");

  try {
    await axios.post(
      `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
      { recipients, message },
      { headers: { "x-api-key": TEXTBEE_API_KEY, "Content-Type": "application/json" } }
    );
    console.log("✅ SMS sent to farmers");
  } catch (error) {
    console.error("❌ Failed to send SMS:", error);
  }
}

export const createSoilReading = async (req: Request, res: Response) => {
  const { farmerId, region, lat, lon, pH, nitrogen, phosphorus, potassium, moisture, temperature } = req.body;

  if (pH === undefined || nitrogen === undefined || phosphorus === undefined || potassium === undefined) {
    return res.status(400).json({ error: "pH, nitrogen, phosphorus, and potassium are required" });
  }

  try {
    const reading = await prisma.soilReading.create({
      data: { farmerId, region, lat, lon, pH, nitrogen, phosphorus, potassium, moisture, temperature },
    });

    const recommendationData = recommendFertilizer(reading);

    const recommendation = await prisma.fertilizerRecommendation.create({
      data: {
        soilReadingId: reading.id,
        farmerId: farmerId || null,
        recommendedFertilizers: recommendationData,
        explanation: "Automated recommendation based on soil parameters",
      },
    });

    const allFarmers = await prisma.farmerRegistry.findMany({ select: { phone: true } });
    const recipients = allFarmers.map(f => f.phone);

    if (recipients.length > 0) {
      const message = `🌱 Soil Reading: pH:${reading.pH}, N:${reading.nitrogen}, P:${reading.phosphorus}, K:${reading.potassium}\nRecommended: ${recommendationData.map(r => r.name).join(", ")}`;
      await sendSMS(recipients, message);
    }

    res.status(201).json({ reading, recommendation });
  } catch (error) {
    console.error("❌ Error creating soil reading:", error);
    res.status(500).json({ error: "Failed to create soil reading" });
  }
};

export const getAllSoilReadings = async (req: Request, res: Response) => {
  try {
    const readings = await prisma.soilReading.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(readings);
  } catch (error) {
    console.error("❌ Error fetching soil readings:", error);
    res.status(500).json({ error: "Failed to fetch soil readings" });
  }
};

export const getMySoilReadings = async (req: Request, res: Response) => {
  try {
    const farmerId = req.user?.id;
    const readings = await prisma.soilReading.findMany({
      where: { farmerId },
      orderBy: { createdAt: "desc" },
    });
    res.json(readings);
  } catch (error) {
    console.error("❌ Error fetching my soil readings:", error);
    res.status(500).json({ error: "Failed to fetch soil readings" });
  }
};
