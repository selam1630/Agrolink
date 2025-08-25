import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../prisma/prisma";
import fs from "fs/promises";
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
    }
  }
}
export const diseaseDetection = async (req: Request, res: Response) => {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    console.log("Attempting to use API Key:", API_KEY ? 'Key found' : 'Key not found');

    if (!API_KEY) {
      console.error("GEMINI_API_KEY is not set in the environment variables.");
      return res.status(500).json({ error: "Server configuration error: API key missing." });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    console.log("Uploaded image path:", filePath);
    const fileBuffer = await fs.readFile(filePath);
    const base64String = fileBuffer.toString("base64");

    const prompt = `
      You are an expert in plant pathology. Analyze this image of a plant leaf or seed.
      Identify any diseases present.
      What is the likely name of the disease?
      What are the primary causes of this disease?
      Provide practical, actionable advice on how to prevent and treat this disease, suitable for a farmer.

      Strictly format your entire response as a single, valid JSON object with the following keys:
      {
        "diseaseName": "The disease name",
        "causes": "Description of the causes",
        "treatment": "A numbered list of practical advice for treatment and prevention."
      }
      Do not include any extra text, markdown formatting, or code fences outside of the JSON object.
      The output MUST start with an open curly brace '{' and end with a closed curly brace '}'.
    `;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64String } },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            diseaseName: { type: "STRING" },
            causes: { type: "STRING" },
            treatment: { type: "STRING" },
          },
        },
      },
    };

    const result = await model.generateContent(payload as any);
    const response = await result.response;
    let text = response.text();

    if (!text || text.length === 0) {
      console.error("API response was empty or null.");
      return res.status(500).json({ error: "API returned an empty response." });
    }

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      console.log("Direct JSON parse failed. Attempting fallback extraction.");
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch && jsonMatch[0]) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log("Successfully extracted and parsed JSON from malformed response.");
        } catch (innerParseError) {
          console.error("Failed to extract or parse JSON from the response text:", innerParseError);
          console.error("Response text was:", text);
          return res.status(500).json({ error: "The API returned malformed data that could not be parsed." });
        }
      } else {
        console.error("Could not find a JSON object in the API response text.");
        console.error("Response text was:", text);
        return res.status(500).json({ error: "The API returned a non-JSON response." });
      }
    }

    const diseaseName = parsedData.diseaseName ?? "Unknown Disease";
    const causes = parsedData.causes ?? "Information not available.";
    const treatment = parsedData.treatment ?? "Information not available.";

    const savedAdvice = await prisma.diseaseAdvice.create({
      data: {
        image: filePath,
        diseaseName: diseaseName,
        causes: causes,
        treatment: treatment,
      },
    });

    return res.status(200).json({ analysis: savedAdvice });
  } catch (error) {
    console.error("Error during disease detection:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
};