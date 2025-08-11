"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveSMS = exports.verifyTextBeeSignature = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../prisma/prisma"));
const axios_1 = __importDefault(require("axios"));
const TEXTBEE_SIGNING_SECRET = process.env.TEXTBEE_SIGNING_SECRET || '';
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || '';
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || '';
const BASE_URL = 'https://api.textbee.dev/api/v1';
const verifyTextBeeSignature = (req, res, next) => {
    const signature = req.header('X-Signature');
    if (!signature) {
        return res.status(401).send('Missing signature');
    }
    const payload = JSON.stringify(req.body);
    const hmac = crypto_1.default.createHmac('sha256', TEXTBEE_SIGNING_SECRET);
    hmac.update(payload);
    const digest = `sha256=${hmac.digest('hex')}`;
    if (signature !== digest) {
        return res.status(401).send('Invalid signature');
    }
    next();
};
exports.verifyTextBeeSignature = verifyTextBeeSignature;
const amharicToArabic = (text) => {
    const map = {
        '፩': '1', '፪': '2', '፫': '3', '፬': '4', '፭': '5',
        '፮': '6', '፯': '7', '፰': '8', '፱': '9', '፲': '10'
    };
    return text.replace(/[፩-፲]/g, (char) => map[char] || char);
};
const receiveSMS = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('Incoming SMS webhook payload:', req.body);
    const from = req.body.sender;
    const rawText = (_a = req.body.message) === null || _a === void 0 ? void 0 : _a.trim();
    if (!from || !rawText) {
        return res.status(400).json({ error: 'Missing sender or text' });
    }
    const text = amharicToArabic(rawText);
    const amharicHa = 'ሀ';
    try {
        if (text.includes(amharicHa)) {
            let user = yield prisma_1.default.user.findUnique({
                where: { phone: from }
            });
            if (!user) {
                user = yield prisma_1.default.user.create({
                    data: {
                        phone: from,
                        name: 'New User',
                        role: 'Farmer',
                        email: null
                    }
                });
                yield axios_1.default.post(`${BASE_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`, {
                    recipients: [from],
                    message: 'እንኳን ወደ አግሮLink በሰላም መጡ! የአገልግሎቶቻችን ተጠቃሚ ለመሆን ያሎትን ምርቶች ዝርዝር አይነት፣ ብዛት እና ዋጋ ይላኩ። እኛን ስለመረጡ እናመሰግናለን።'
                }, {
                    headers: {
                        'x-api-key': TEXTBEE_API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
            }
            return res.status(200).json({ message: 'User added or exists', userId: user.id });
        }
        const explicitEnglish = text.match(/product:\s*(.+?),\s*qty:\s*(\d+)/i);
        const explicitAmharic = text.match(/ምርት[:：]?\s*(.+?),\s*ብዛት[:：]?\s*(\d+)/i);
        const looseMatch = text.match(/^(?:(\d+)\s*([\p{L}\p{M}\s]+)|([\p{L}\p{M}\s]+)\s*(\d+))$/u);
        let name;
        let quantity;
        if (explicitEnglish || explicitAmharic) {
            const [, n, q] = (explicitEnglish || explicitAmharic);
            name = n.trim();
            quantity = parseInt(q, 10);
        }
        else if (looseMatch) {
            if (looseMatch[1] && looseMatch[2]) {
                quantity = parseInt(looseMatch[1], 10);
                name = looseMatch[2].trim();
            }
            else {
                name = looseMatch[3].trim();
                quantity = parseInt(looseMatch[4], 10);
            }
        }
        if (name && quantity) {
            const user = yield prisma_1.default.user.findUnique({ where: { phone: from } });
            if (!user) {
                return res.status(404).json({ error: 'Farmer not registered' });
            }
            const product = yield prisma_1.default.product.create({
                data: {
                    name,
                    quantity,
                    userId: user.id
                }
            });
            yield axios_1.default.post(`${BASE_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`, {
                recipients: [from],
                message: `ምርት "${product.name}" (ብዛት: ${product.quantity}) በትክክል ተመዝግቧል።`
            }, {
                headers: {
                    'x-api-key': TEXTBEE_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            return res.status(200).json({ message: 'Product added and confirmation sent', product });
        }
        return res.status(200).json({ message: 'No action needed' });
    }
    catch (error) {
        console.error('Error processing SMS:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.receiveSMS = receiveSMS;
