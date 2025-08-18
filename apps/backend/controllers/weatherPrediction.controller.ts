import { Request, Response } from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || "";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

async function processGeminiResponse(apiResponse: string) {
  try {
    const cleaned = apiResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { message: apiResponse }; // fallback if not JSON
  }
}

export const getWeatherAndCropAdvice = async (req: Request, res: Response) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing required parameters: lat and lon." });
  }

  try {
    const weatherUrl = `${OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      throw new Error(`OpenWeather API Error: ${weatherResponse.status} - ${errorText}`);
    }

    const weatherData = await weatherResponse.json();

    const prompt = `
      You are an expert agricultural climate forecaster and advisor for farmers in Ethiopia.
      I have the following weather data:
      ${JSON.stringify(weatherData)}

      Please return ONLY valid JSON in the following format:
      {
        "weatherPrediction": "Likely weather for next month...",
        "soilType": "Predicted soil type...",
        "recommendedCrops": ["Crop1", "Crop2", "Crop3"]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const geminiResult = await model.generateContent(prompt);
    const geminiResponse = geminiResult.response;
    const geminiText = geminiResponse.text();

    const formattedOutput = await processGeminiResponse(geminiText);

    res.status(200).json({
      weatherForecast: weatherData,
      cropAdvice: formattedOutput,
    });
  } catch (error) {
    console.error("Error in fetching data:", error);
    res.status(500).json({ message: "Internal server error. Try again later." });
  }
};
