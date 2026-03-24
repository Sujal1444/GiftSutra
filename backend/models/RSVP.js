import mongoose from 'mongoose';

const rsvpSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['invited', 'accepted', 'declined', 'maybe', 'attended', 'no_show'],
    default: 'invited',
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
    default: null,
  },
  attendedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate RSVPs for same email and event
rsvpSchema.index({ eventId: 1, email: 1 }, { unique: true });

const RSVP = mongoose.model('RSVP', rsvpSchema);

export default RSVP;
