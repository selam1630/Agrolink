import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import smsRoutes from './routes/sms.route';
import productRoutes from './routes/product.route';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/products', productRoutes);
app.listen(5000, () => console.log('Server running on port 5000'));
