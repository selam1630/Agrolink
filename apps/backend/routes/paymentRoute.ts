import express from 'express';
import { createPayment } from '../controllers/paymentController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticateToken, createPayment);


export default router;
