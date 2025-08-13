import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';
import axios from 'axios';
const TEXTBEE_SIGNING_SECRET = process.env.TEXTBEE_SIGNING_SECRET || '';
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || '';
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || '';
const BASE_URL = 'https://api.textbee.dev/api/v1';
const generateProductImage = async (prompt: string) => {
  const fullPrompt = `A photorealistic image of a product, specifically: "${prompt}".`;
  const apiKey = "";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: fullPrompt }]
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE']
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error('API Error: Failed to generate image.', await response.text());
      return null;
    }

    const result: any = await response.json();
    const base64Data = result?.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData: { data: string; mimeType: string; } }) => p.inlineData
    )?.inlineData?.data;

    if (base64Data) {
      console.log('Image generation successful!');
      return `data:image/png;base64,${base64Data}`;
    }
    
    console.error('API Error: Response did not contain base64 image data.');
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
};

export const verifyTextBeeSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.header('X-Signature');
  if (!signature) {
    return res.status(401).send('Missing signature');
  }

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac('sha256', TEXTBEE_SIGNING_SECRET);
  hmac.update(payload);
  const digest = `sha256=${hmac.digest('hex')}`;

  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }

  next();
};

const amharicToArabic = (text: string) => {
  const map: Record<string, string> = {
    '፩': '1', '፪': '2', '፫': '3', '፬': '4', '፭': '5',
    '፮': '6', '፯': '7', '፰': '8', '፱': '9', '፲': '10'
  };
  return text.replace(/[፩-፲]/g, (char) => map[char] || char);
};

const amharicToEnglish: { [key: string]: string } = {
  'ጤፍ': 'Teff',
  'ስንዴ': 'Wheat',
  'ሽንኩርት': 'Onion',
  'ቲማቲም': 'Tomato',
  'ድንች': 'Potato',
  'ማር': 'Honey',
  'ቡና': 'Coffee',
  'በቆሎ': 'Corn',
  'ምስር': 'Lentils',
  'ዳቦ': 'Bread',
  'ነጭ ሽንኩርት': 'Garlic',
  'ባቄላ': 'Beans'
};

export const receiveSMS = async (req: Request, res: Response) => {
  console.log('Incoming SMS webhook payload:', req.body);
  const from = req.body.sender;
  const rawText = req.body.message?.trim();

  if (!from || !rawText) {
    return res.status(400).json({ error: 'Missing sender or text' });
  }

  const text = amharicToArabic(rawText);
  const amharicHa = 'ሀ';

  try {
    if (text.includes(amharicHa)) {
      let user = await prisma.user.findUnique({
        where: { phone: from }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            phone: from,
            name: 'New User',
            role: 'Farmer',
            email: null
          }
        });

        try {
          console.log('Attempting to send welcome SMS to new user...');
          await axios.post(
            `${BASE_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
            {
              recipients: [from],
              message: 'እንኳን ወደ አግሮLink በሰላም መጡ! የአገልግሎቶቻችን ተጠቃሚ ለመሆን ያሎትን ምርቶች ዝርዝር አይነት፣ ብዛት እና ዋጋ ይላኩ። እኛን ስለመረጡ እናመሰግናለን።'
            },
            {
              headers: { 
                'x-api-key': TEXTBEE_API_KEY,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Welcome SMS sent successfully.');
        } catch (smsError) {
          if (axios.isAxiosError(smsError)) {
            console.error('Error sending welcome SMS:', smsError.response ? smsError.response.data : smsError.message);
          } else {
            console.error('Error sending welcome SMS:', smsError);
          }
        }
      }
      return res.status(200).json({ message: 'User added or exists', userId: user.id });
    }

    const explicitEnglish = text.match(/product:\s*(.+?),\s*qty:\s*(\d+)/i);
    const explicitAmharic = text.match(/ምርት[:：]?\s*(.+?),\s*ብዛት[:：]?\s*(\d+)/i);
    const looseMatch = text.match(/^(?:(\d+)\s*([\p{L}\p{M}\s]+)|([\p{L}\p{M}\s]+)\s*(\d+))$/u);

    let name: string | undefined;
    let quantity: number | undefined;

    if (explicitEnglish || explicitAmharic) {
      const [, n, q] = (explicitEnglish || explicitAmharic)!;
      name = n.trim();
      quantity = parseInt(q, 10);
    } else if (looseMatch) {
      if (looseMatch[1] && looseMatch[2]) {
        quantity = parseInt(looseMatch[1], 10);
        name = looseMatch[2].trim();
      } else {
        name = looseMatch[3].trim();
        quantity = parseInt(looseMatch[4], 10);
      }
    }

    if (name && quantity) {
      const user = await prisma.user.findUnique({ where: { phone: from } });
      if (!user) {
        return res.status(404).json({ error: 'Farmer not registered' });
      }

      const englishName = amharicToEnglish[name] || name;
      const imageUrl = await generateProductImage(englishName);

      const product = await prisma.product.create({
        data: {
          name,
          quantity,
          imageUrl, // Save the generated image URL
          userId: user.id
        }
      });

      try {
        console.log('Attempting to send product confirmation SMS...');
        await axios.post(
          `${BASE_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
          {
            recipients: [from], 
            message: `ምርት "${product.name}" (ብዛት: ${product.quantity}) በትክክል ተመዝግቧል።`
          },
          {
            headers: { 
              'x-api-key': TEXTBEE_API_KEY,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('Product confirmation SMS sent successfully.');
      } catch (smsError) {
        if (axios.isAxiosError(smsError)) {
          console.error('Error sending product confirmation SMS:', smsError.response ? smsError.response.data : smsError.message);
        } else {
          console.error('Error sending product confirmation SMS:', smsError);
        }
      }

      return res.status(200).json({ message: 'Product added and confirmation sent', product });
    }

    return res.status(200).json({ message: 'No action needed' });

  } catch (error) {
    console.error('Error processing SMS:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
