import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getMyEvents,
  getMyGifts,
  sendInvitation,
  respondToInvitation,
  markAttendance,
  getAttendanceList,
  getMyRSVP
} from '../controllers/eventController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.get('/myevents', protect, getMyEvents);
router.get('/mygifts', protect, getMyGifts);

// Invitation & RSVP routes
router.post('/:id/invite', protect, sendInvitation);
router.post('/:id/rsvp', optionalAuth, respondToInvitation);
router.get('/:id/rsvp', getMyRSVP);
router.get('/:id/attendance', protect, getAttendanceList);
router.post('/:id/attendance', protect, markAttendance);

router.get('/:id', optionalAuth, getEventById);

export default router;
