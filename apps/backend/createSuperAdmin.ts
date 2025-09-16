// File: createSuperAdmin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const prisma = new PrismaClient();

async function createSuperAdmin() {
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    const phone = process.env.SUPER_ADMIN_PHONE;
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!phone || !password) {
        console.error('Environment variables SUPER_ADMIN_PHONE and SUPER_ADMIN_PASSWORD must be set.');
        process.exit(1);
    }

    try {
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'super_admin' },
        });

        if (existingSuperAdmin) {
            console.log('A super admin user already exists. No new user created.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const superAdmin = await prisma.user.create({
            data: {
                name,
                phone,
                email,
                password: hashedPassword,
                role: 'super_admin',
                status: 'registered',
            },
        });

        console.log(`Successfully created super admin with ID: ${superAdmin.id}`);

    } catch (e) {
        console.error('Error creating super admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createSuperAdmin();