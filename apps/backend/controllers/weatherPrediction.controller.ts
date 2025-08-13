import { Request, Response } from "express";

import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY as string);

export const getWeatherAndCropAdvice = async (req: Request, res: Response) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: "Missing required parameters: lat and lon." });
  }

  try {
    const weatherUrl = `${OPENWEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.log(`****************ErrorText:  ${errorText}`);
      throw new Error(
        `OpenWeatherMap API Error: ${weatherResponse.status} - ${errorText}`
      );
    }

    const weatherData = await weatherResponse.json();
    console.log(`****************WeatherData: ${weatherData}`);

    const prompt = `
            You are an expert agricultural climate forecaster and advisor for farmers in Ethiopia.
            I have the following weather data for a specific location for the next few days.
            Based on this data, please:
            1. Predict the likely weather conditions for the next month, focusing on rainfall patterns, average temperatures, and potential extreme weather events.
            2. Suggest specific crops that would be beneficial to plant within the next month, considering the long-term weather prediction and the agricultural context of Ethiopia.
            3. The suggestions should be practical, actionable, and suitable for the Ethiopian climate.
            
            Here is the raw weather data in JSON format:
            ${JSON.stringify(weatherData.daily, null, 2)}
        `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const geminiResult = await model.generateContent(prompt);
    const geminiResponse = await geminiResult.response;
    const geminiText = geminiResponse.text();

    res.status(200).json({
      weatherForecast: weatherData,
      // weatherForecast: weatherData.daily,
      cropAdvice: geminiText,
    });
  } catch (error) {
    console.error("Error in fetching data:", error);
    res.status(500).json({
      message:
        "An internal server error occurred while processing your request. Please try again later.",
    });
  }
};
