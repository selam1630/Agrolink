import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../prisma/prisma";
import 'dotenv/config';

const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY || "";
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || "";
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || "";

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const OPENCAGE_API_URL = "https://api.opencagedata.com/geocode/v1/json";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

const getLocationName = async (lat: number, lon: number) => {
    try {
        const url = `${OPENCAGE_API_URL}?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`;
        const response = await axios.get(url);
        if (response.data.results.length > 0) return response.data.results[0].formatted;
        return "Unknown Location";
    } catch (error) {
        console.error("Geocoding failed:", error instanceof Error ? error.message : error);
        return "Unknown Location";
    }
};

const sendDisasterAlertsToFarmers = async (alerts: string[]) => {
    try {
        const farmers = await prisma.user.findMany({
            where: { status: "registered", role: "farmer" },
            select: { phone: true },
        });

        if (farmers.length === 0) {
            console.log("No registered farmers to send alerts to.");
            return;
        }

        for (const farmer of farmers) {
            for (const alert of alerts) {
                await axios.post(
                    `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
                    { recipients: [farmer.phone], message: alert },
                    { headers: { "x-api-key": TEXTBEE_API_KEY, "Content-Type": "application/json" } }
                );
            }
        }

        console.log(`Disaster alerts sent to ${farmers.length} farmers.`);
    } catch (error) {
        console.error("Error sending disaster alerts to farmers:", error);
    }
};

const getWeatherAndCropAdvice = async (req: import("express").Request, res: import("express").Response) => {
    const { lat, lon } = req.body;

    if (!lat || !lon) return res.status(400).json({ error: "Missing required parameters: lat and lon." });

    try {
        let locationName = await getLocationName(lat, lon);

        const weatherUrl = `${OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const weatherResponse = await axios.get(weatherUrl);
        const weatherData = weatherResponse.data;

        const prompt = `
            You are an agricultural advisor for Ethiopian farmers.
            Location: ${locationName} (lat: ${lat}, lon: ${lon})
            Weather Data: ${JSON.stringify(weatherData)}

            Provide JSON advice in this format:
            {
                "weatherPrediction": "...",
                "soilAndWaterAdvice": "...",
                "pestAndDiseaseAdvice": "...",
                "recommendedCrops": ["..."],
                "emergencyPreparedness": "...",
                "locationSpecificTips": "..."
            }
        `;

        const geminiResult = await model.generateContent(prompt);
        const geminiText = geminiResult.response.text();
        const formattedOutput = JSON.parse(geminiText.replace(/```json|```/g, "").trim());
        const disasterAlerts = [{ description: "Flood warning: Heavy rains expected this week!" }];
        const alertMessages = disasterAlerts.map(a => a.description);

        if (alertMessages.length > 0) await sendDisasterAlertsToFarmers(alertMessages);

        res.status(200).json({ 
            location: locationName, 
            weatherData, 
            advice: { ...formattedOutput, disasterAlerts } 
        });

    } catch (error) {
        console.error("Error in fetching data:", error);
        let errorMessage = "An unexpected error occurred.";
        if (axios.isAxiosError(error as any) && (error as any).response) {
            errorMessage = `Weather API error: ${(error as any).response.status} - ${(error as any).response.data.message}`;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export { getWeatherAndCropAdvice };