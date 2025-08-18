import { Request, Response } from 'express';
import prisma from '../prisma/prisma';

// Extend the Request interface to include the user property from the middleware.
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

/**
 * @route GET /api/profile/:id OR /api/profile/current
 * @description Get a farmer's profile, either by a public ID or the authenticated user's own profile.
 * This function handles two types of requests on a single endpoint, using a different
 * logic flow based on the request URL.
 */
export const getFarmerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let userIdToFetch: string | undefined;

    // First, check if the request is for the currently authenticated user's profile.
    if (id === 'current') {
      // The `req.user` object is populated by your authentication middleware.
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication failed. No user token provided.' });
      }
      userIdToFetch = req.user.id;
    } else {
      // The request is for a public profile, so we use the ID from the URL.
      // This ID must be a valid MongoDB ObjectID string.
      userIdToFetch = id;
    }

    // Now, we can safely proceed with the Prisma query.
    // We validate that userIdToFetch has a value before making the query.
    // This prevents the "User ID is missing" error.
    if (!userIdToFetch) {
        return res.status(400).json({ error: 'User ID is missing from the request.' });
    }

    const farmer = await prisma.user.findUnique({
      where: {
        id: userIdToFetch,
        role: "FARMER", // Ensure we are only fetching a user with the 'FARMER' role.
      },
      include: {
        products: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!farmer) {
      return res.status(404).json({ error: 'Farmer profile not found or user is not a farmer.' });
    }

    // Return the farmer's public information and products.
    // Be careful not to expose sensitive information like the password or OTP.
    const { password, otp, otpExpiresAt, ...publicFarmerData } = farmer;

    res.status(200).json({ farmer: publicFarmerData });

  } catch (error) {
    console.error("Error fetching farmer profile:", error);
    // Log the full error to the console for debugging.
    if (error instanceof Error) {
      return res.status(500).json({ error: "Error fetching farmer profile: " + error.message });
    }
    res.status(500).json({ error: "An unexpected error occurred." });
  }
};
