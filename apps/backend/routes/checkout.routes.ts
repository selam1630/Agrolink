import { Router } from 'express';
import { initializePayment, handleWebhook } from '../controllers/checkout.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route 
 * @description 
 */
router.post('/initialize', authenticateToken, initializePayment);

/**
 * @route 
 * @description 
 */
router.post('/webhook', handleWebhook);

export default router;
