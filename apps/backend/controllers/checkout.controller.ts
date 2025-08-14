import { Request, Response } from 'express';
import prisma from '../prisma/prisma';

/**
 * @param req 
 * @param res 
 */
export const checkout = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cannot checkout with an empty cart.' });
    }
    const totalAmount = cartItems.reduce((sum, item) => {
      const price = item.product?.price ?? 0;
      return sum + (price * item.quantity);
    }, 0);
    const paymentSuccessful = true;

    if (paymentSuccessful) {
      console.log(`Payment successful for user ${userId}. Total: ${totalAmount}.`);
      await prisma.cartItem.deleteMany({
        where: { userId },
      });

      return res.status(200).json({
        message: 'Checkout successful. Your order has been placed!',
        totalAmount,
      });
    } else {
      return res.status(400).json({ error: 'Payment failed. Please try again.' });
    }

  } catch (error) {
    console.error('Error during checkout:', error);
    return res.status(500).json({ error: 'Server error during checkout.' });
  }
};
