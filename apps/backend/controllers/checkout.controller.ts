import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import prisma from '../prisma/prisma';
// CHAPA_SECRET_KEY="YOUR_CHAPA_SECRET_KEY"
// CHAPA_WEBHOOK_SECRET="YOUR_CHAPA_WEBHOOK_SECRET"

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY as string;
const CHAPA_WEBHOOK_SECRET = process.env.CHAPA_WEBHOOK_SECRET as string;
const YOUR_DOMAIN = 'https://your-domain.com'; 
export const initializePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { amount, email, productName, quantity, txRef, orderId } = req.body;
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
        }
        
        const userId = req.user.id;

        if (!amount || !email || !productName || !quantity || !txRef || !orderId || !userId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const chapaInitializeUrl = 'https://api.chapa.co/v1/transaction/initialize';
        const headers = {
            'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            amount,
            currency: 'ETB',
            email,
            tx_ref: txRef,
            callback_url: `${YOUR_DOMAIN}/api/chapa/webhook`, 
            return_url: `${YOUR_DOMAIN}/success?tx_ref=${txRef}`, 
            customization: {
                title: 'Payment for your AgroLink products',
                description: `Payment for ${quantity} x ${productName}`
            }
        };

        const response = await axios.post(chapaInitializeUrl, payload, { headers });

        if (response.data && response.data.status === 'success') {
            await prisma.transaction.create({
                data: {
                    txRef,
                    amount,
                    status: 'pending',
                    orderId,
                    userId,
                }
            });

            res.json({
                status: 'success',
                message: 'Payment initialized successfully.',
                checkout_url: response.data.data.checkout_url
            });
        } else {
            res.status(500).json({ error: 'Failed to initialize payment with Chapa.', details: response.data });
        }

    } catch (error) {
        console.error('Error initializing Chapa payment:', error);
        next(error); 
    }
};
export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
    const chapaSignature = req.headers['x-chapa-signature'] as string;
    const body = JSON.stringify(req.body);

    const hmac = crypto.createHmac('sha256', CHAPA_WEBHOOK_SECRET);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== chapaSignature) {
        console.warn('Webhook signature mismatch. Possible security threat!');
        return res.status(401).end();
    }
    const event = req.body;
    const txRef = event.data.tx_ref;

    if (txRef) {
        try {
            await verifyTransaction(txRef);
        } catch (verificationError) {
            console.error('Error during webhook transaction verification:', verificationError);
        }
    }
    res.status(200).end();
};
export const verifyTransaction = async (txRef: string) => {
    try {
        const chapaVerifyUrl = `https://api.chapa.co/v1/transaction/verify/${txRef}`;
        const headers = {
            'Authorization': `Bearer ${CHAPA_SECRET_KEY}`
        };

        const response = await axios.get(chapaVerifyUrl, { headers });

        if (response.data && response.data.status === 'success') {
            const transaction = response.data.data;
            const savedTransaction = await prisma.transaction.findUnique({ where: { txRef: transaction.tx_ref } });

            if (savedTransaction && savedTransaction.status === 'pending') {
                if (transaction.amount === savedTransaction.amount) {
                    await prisma.transaction.update({
                        where: { txRef: transaction.tx_ref },
                        data: { status: 'completed' }
                    });
                    console.log(`Order ${transaction.tx_ref} successfully verified and updated.`);
                } else {
                    console.warn(`Amount mismatch for transaction ${transaction.tx_ref}. Possible fraud!`);
                }
            }
        } else {
            console.error(`Transaction verification failed for ${txRef}:`, response.data.message);
        }
    } catch (error) {
        console.error('Error verifying transaction:', error);
    }
};
