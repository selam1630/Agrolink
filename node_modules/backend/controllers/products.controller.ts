import { Request, Response } from 'express';
import prisma from '../prisma/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_JWT_SECRET_FALLBACK';
const getUserIdFromToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded as { userId: string }).userId;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        user: true,
      },
    });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    return res.status(500).json({ error: 'Server error fetching products.' });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  const { phone } = req.body;

  try {
    if (phone) {
      const { name, quantity } = req.body;
      if (!name || quantity === undefined) {
        return res.status(400).json({ error: 'Missing product name or quantity for text-based request.' });
      }
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const product = await prisma.product.create({
        data: {
          name,
          quantity,
          userId: user.id,
        },
      });
      return res.status(201).json({ message: 'Product added via SMS', product });
    } else {
      const userIdFromToken = getUserIdFromToken(req);

      if (!userIdFromToken) {
        return res.status(401).json({ error: 'You must be logged in to post a product.' });
      }

      const { name, quantity, price, description, imageUrl } = req.body;
      if (!name || quantity === undefined || price === undefined || !imageUrl || !description) {
        return res.status(400).json({ error: 'Missing required product fields: name, quantity, price, imageUrl, or description.' });
      }
      const product = await prisma.product.create({
        data: {
          name,
          quantity: parseInt(quantity, 10),
          price: parseFloat(price),
          description,
          imageUrl,
          userId: userIdFromToken,
        },
      });
      return res.status(201).json({ message: 'Product posted with image successfully!', product });
    }
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
