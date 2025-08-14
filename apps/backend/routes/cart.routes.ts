import { Router } from 'express';
import { addToCart, getCart } from '../controllers/cart.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const cartRouter = Router();

/**
 * @route 
 * @desc 
 * @access 
 */
cartRouter.post('/add-to-cart', authenticateToken, addToCart);

/**
 * @route 
 * @desc 
 * @access 
 */
cartRouter.get('/', authenticateToken, getCart);

export default cartRouter;
