import { Router } from 'express';
import { getFarmerProfile } from '../controllers/profile.controller';
import { authenticateToken } from '../middlewares/auth.middleware'; // Import your middleware

const router = Router();

// This route is for a public profile (e.g., /api/profile/123).
// It does NOT require a token, so no middleware is applied.
router.get('/:id', getFarmerProfile);

// This route is for the currently logged-in user's profile (e.g., /api/profile/current).
// It IS protected, so we apply the authenticateToken middleware.
router.get('/current', authenticateToken, getFarmerProfile);

export default router;