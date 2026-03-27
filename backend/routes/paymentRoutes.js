import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createManualGift, createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/manual', protect, createManualGift);

export default router;
