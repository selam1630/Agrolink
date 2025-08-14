import { Router } from 'express';
import { addProduct, getAllProducts, getProductById } from '../controllers/products.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.get('/:id', authenticateToken, getProductById);
router.get('/', authenticateToken, getAllProducts);
router.post('/add-with-image', authenticateToken, addProduct);

export default router;
