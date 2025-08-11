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

app.use(express.json({ limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/products', productRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));