import express from 'express';
import { addProduct } from '../controllers/products.controller';

const router = express.Router();

router.post('/add-product', addProduct);

export default router;
