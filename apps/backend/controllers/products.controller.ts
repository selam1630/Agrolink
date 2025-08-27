import { Request, Response } from 'express';
import prisma from '../prisma/prisma';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const generateProductImage = async (prompt: string) => {
  const fullPrompt = `A photorealistic image of a product, specifically: "${prompt}".`;
  console.log(`Attempting to generate image for prompt: ${fullPrompt}`);
  
  const payload = { instances: { prompt: fullPrompt }, parameters: { "sampleCount": 1 } };
  const apiKey = "AIzaSyA7Q8nlGg4vbDghYGJzXB5O_LvL0kG5iNg";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error: Failed to generate image.', errorText);
      return null;
    }

    const result = await response.json();
    if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
      console.log('Image generation successful!');
      const base64Data = result.predictions[0].bytesBase64Encoded;
      return `data:image/png;base64,${base64Data}`;
    }
    
    console.error('API Error: Response did not contain base64 image data.');
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
};

const getUserIdFromToken = (req: Request): string => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header is missing or malformed. Expected format: "Bearer [token]".');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return (decoded as { userId: string }).userId;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid token: ${error.message}`);
    }
    throw error;
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

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }
    const product = await prisma.product.findUnique({
      where: {
        id: String(id), 
      },
      include: {
        user: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({ error: 'Server error fetching product.' });
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
      const imageUrl = await generateProductImage(name);
      
      const product = await prisma.product.create({
        data: {
          name,
          quantity,
          imageUrl, 
          userId: user.id,
        },
      });
      console.log('Product added to database with imageUrl:', imageUrl);
      return res.status(201).json({ message: 'Product added via SMS', product });
    }
    else {
      let userIdFromToken: string;
      try {
        userIdFromToken = getUserIdFromToken(req);
      } catch (authError) {
        if (authError instanceof Error) {
          return res.status(401).json({ error: authError.message });
        }
        return res.status(401).json({ error: 'Authentication failed.' });
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
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, quantity, price, description } = req.body;

  try {
    const userId = getUserIdFromToken(req);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this product.' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name,
        quantity: quantity !== undefined ? parseInt(quantity, 10) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        description: description,
      },
    });

    return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    if (error instanceof Error && error.message.includes('token')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to update product' });
  }
};
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userId = getUserIdFromToken(req);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (product.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this product.' });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error instanceof Error && error.message.includes('token')) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to delete product' });
  }
};