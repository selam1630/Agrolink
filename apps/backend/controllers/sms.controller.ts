import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';
import axios from 'axios';

const TEXTBEE_SIGNING_SECRET = process.env.TEXTBEE_SIGNING_SECRET || '';
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || '';
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || '';
const BASE_URL = 'https://api.textbee.dev/api/v1';

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

// Added console.log and try/catch block for debugging
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
// Don't return an error here, since the user was still created in the database.
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

const product = await prisma.product.create({
data: {
name,
quantity,
userId: user.id
}
});

// Added console.log and try/catch block for debugging
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
// Don't return an error here, since the product was still created.
}

return res.status(200).json({ message: 'Product added and confirmation sent', product });
}

return res.status(200).json({ message: 'No action needed' });

} catch (error) {
console.error('Error processing SMS:', error);
return res.status(500).json({ error: 'Server error' });
}
};
