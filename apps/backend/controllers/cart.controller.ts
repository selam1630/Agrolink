import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const getCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    try {
        const cart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });
        return res.status(200).json(cart); 
    } catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
export const addToCart = async (req: Request, res: Response) => {
    const { productId } = req.body;
    const userId = req.user?.id;

    if (!productId) return res.status(400).json({ error: 'Missing productId.' });
    if (!userId) return res.status(401).json({ error: 'User not authenticated.' });

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        const existingCartItem = await prisma.cartItem.findUnique({
            where: { 
                userId_productId: { 
                    userId: userId, 
                    productId: productId 
                } 
            },
        });
        if (existingCartItem) {
            await prisma.cartItem.update({
                where: { 
                    userId_productId: { 
                        userId: userId, 
                        productId: productId 
                    } 
                },
                data: { quantity: { increment: 1 } },
            });
        } else {
            await prisma.cartItem.create({
                data: { userId, productId, quantity: 1 },
            });
        }

        const updatedCart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        return res.status(200).json(updatedCart); 
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
export const removeFromCart = async (req: Request, res: Response) => {
    const productId = req.params.productId; 
    const userId = req.user?.id;

    if (!productId) return res.status(400).json({ error: 'Missing productId.' });
    if (!userId) return res.status(401).json({ error: 'User not authenticated.' });

    try {
        await prisma.cartItem.delete({
            where: { userId_productId: { userId, productId } },
        });

        const updatedCart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
export const updateCartItem = async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;

    if (!productId || quantity == null) return res.status(400).json({ error: 'Missing productId or quantity.' });
    if (!userId) return res.status(401).json({ error: 'User not authenticated.' });

    try {
        if (quantity <= 0) {
            await prisma.cartItem.delete({
                where: { userId_productId: { userId, productId } },
            });
        } else {
            await prisma.cartItem.update({
                where: { userId_productId: { userId, productId } },
                data: { quantity },
            });
        }

        const updatedCart = await prisma.cartItem.findMany({
            where: { userId },
            include: { product: true },
        });

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};
