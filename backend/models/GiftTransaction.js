const mongoose = require("mongoose");

const giftTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      default: 'UPI', 
    },
    donorName: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    entryType: {
      type: String,
      enum: ['online', 'manual'],
      default: 'online',
    },
  },
  { timestamps: true }
);

const GiftTransaction = mongoose.model('GiftTransaction', giftTransactionSchema);
module.exports = GiftTransaction;
