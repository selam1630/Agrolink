import express from 'express';
import { receiveSMS, verifyTextBeeSignature } from '../controllers/sms.controller';

const router = express.Router();

router.post('/receive', receiveSMS);


export default router;
