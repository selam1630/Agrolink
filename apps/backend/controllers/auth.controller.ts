import prisma from '../prisma/prisma';

import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken';

import { Request, Response } from 'express';



const JWT_SECRET = process.env.JWT_SECRET || 'agromerce_secret';



export const register = async (req: Request, res: Response) => {

  const { name, phone, email, password, role } = req.body;



  if (!name || !phone || !password || !role) {

    return res.status(400).json({ error: 'Missing required fields' });

  }



  try {

    const conditions: any[] = [{ phone }];

    if (email) conditions.push({ email });



    const existingUser = await prisma.user.findFirst({

      where: {

        OR: conditions

      }

    });



    if (existingUser) {

      return res.status(400).json({ error: 'User already exists' });

    }



    const hashedPassword = await bcrypt.hash(password, 10);



    const user = await prisma.user.create({

      data: {

        name,

        phone,

        email,

        password: hashedPassword,

        role,

      },

    });



    res.status(201).json({ message: 'User registered', userId: user.id });

  } catch (error) {

    console.error(error);

    res.status(500).json({ error: 'Registration failed' });

  }

};



export const login = async (req: Request, res: Response) => {

  const { phone, password } = req.body;



  try {

    const user = await prisma.user.findUnique({

      where: { phone }

    });



    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.password) {

      return res.status(401).json({ error: 'Invalid credentials' });

    }



    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });



    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });



    res.status(200).json({ token, role: user.role });

  } catch (error) {

    console.error(error);

    res.status(500).json({ error: 'Login failed' });

  }

};