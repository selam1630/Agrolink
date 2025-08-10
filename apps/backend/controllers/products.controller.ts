import { Request, Response } from 'express';
import prisma from '../prisma/prisma';

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
    }
    else {
      const { name, quantity, price, description, imageUrl, userId } = req.body;

      if (!name || quantity === undefined || price === undefined || !imageUrl || !userId) {
        return res.status(400).json({ error: 'Missing required product fields: name, quantity, price, imageUrl, or userId.' });
      }

      const product = await prisma.product.create({
        data: {
          name,
          quantity: parseInt(quantity, 10),
          price: parseFloat(price),
          description,
          imageUrl,
          userId,
        },
      });

      return res.status(201).json({ message: 'Product posted with image successfully!', product });
    }

  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
