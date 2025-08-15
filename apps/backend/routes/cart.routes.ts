import { Router } from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
} from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticateToken);
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:productId', removeFromCart);

export default router;
