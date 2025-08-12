import { Router } from 'express';
import {
  register,
  login,
  registerAndSendOtp, 
  verifyAndCompleteRegistration 
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/register-with-otp', registerAndSendOtp);
router.post('/verify-registration-otp', verifyAndCompleteRegistration);


export default router;
