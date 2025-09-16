import { Router } from 'express';
import {
  register,
  login,
  registerAndSendOtp,
  verifyAndCompleteRegistration,
  loginAndSendOtp, 
  verifyLoginOtp, 
  logout,
  createAdmin
} from '../controllers/auth.controller';
import { superAdminAuth } from '../middlewares/superAdminAuth';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/register-with-otp', registerAndSendOtp);
router.post('/verify-registration-otp', verifyAndCompleteRegistration);
router.post('/login-with-otp', loginAndSendOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/logout', logout);
router.post('/register-admin', superAdminAuth, createAdmin); 
export default router;
