import { Router } from 'express';
import { addProduct, getAllProducts } from '../controllers/products.controller';

const router = Router();
router.get('/', getAllProducts);
router.post('/add-product', addProduct);

export default router;
