import { Request, Response } from 'express';
import prisma from '../prisma/prisma';

export const addProduct = async (req: Request, res: Response) => {
  const { phone, name, quantity } = req.body;

  if (!phone || !name || quantity === undefined) {
    return res.status(400).json({ error: 'Missing phone, product name or quantity' });
  }

  try {
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

    return res.status(201).json({ message: 'Product added', product });
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
