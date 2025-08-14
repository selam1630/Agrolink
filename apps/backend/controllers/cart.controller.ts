import { Request, Response } from 'express';
import prisma from '../prisma/prisma';

// This is a global type declaration. It is assumed to be in a separate
// file like `src/types/express.d.ts` and allows the `authenticateToken`
// middleware to attach a `user` object to the request.

/**
 * Controller to handle "Add to Cart" requests.
 * It adds a product to a user's cart or updates the quantity if the item is already there.
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const addToCart = async (req: Request, res: Response) => {
  const { productId } = req.body;
  
  // We can now safely access req.user because of the authenticateToken middleware
  // and the global type declaration in auth.middleware.ts.
  const userId = req.user?.id;

  // This is the line that is causing the 400 Bad Request error.
  // It means that either 'userId' from the token or 'productId' from the request body
  // is missing or undefined.
  if (!userId || !productId) {
    return res.status(400).json({ error: 'User ID and Product ID are required.' });
  }

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if the product already exists in the cart for this user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingCartItem) {
      // If the product exists, increment the quantity
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: { increment: 1 } },
      });
      return res.status(200).json({ message: 'Product quantity updated in cart.', cartItem: updatedCartItem });
    } else {
      // If the product doesn't exist, create a new cart item
      const newCartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: 1,
        },
      });
      return res.status(201).json({ message: 'Product added to cart.', cartItem: newCartItem });
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
    return res.status(500).json({ error: 'Server error while adding to cart.' });
  }
};

/**
 * @param req The Express request object.
 * @param res The Express response object.
 */
export const getCart = async (req: Request, res: Response) => {
  // We can now safely access req.user because of the authenticateToken middleware
  // and the global type declaration in auth.middleware.ts.
  const userId = req.user?.id;

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
      return res.status(404).json({ message: 'Cart is empty for this user.' });
    }

    return res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ error: 'Server error while fetching cart.' });
  }
};
