import Razorpay from "razorpay";
import crypto from "crypto";
import GiftTransaction from "../models/GiftTransaction.js";
import Event from "../models/Event.js";
// import { logger, auditLogger } from "../utils/logger.js";
import {
  appendManualGiftEntryToFile,
  getManualGiftFilePath,
} from "../utils/manualGiftFileStore.js";

// Initialize Razorpay
// Note: In a real app, instantiate inside the function or assure process.env is loaded before
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "YourTestSecretHere",
  });
};

export const createOrder = async (req, res) => {
  try {
    const { eventId, amount } = req.body;

    // Amount in Razorpay is expected in paise (multiply by 100)
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    logger.info(`Order created successfully`, {
      orderId: order.id,
      eventId,
      amount,
    });

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    logger.error(`Error creating order: ${error.message}`, {
      stack: error.stack,
      eventId: req.body.eventId,
      amount: req.body.amount,
    });
    res.status(500).json({ success: false, message: "Could not create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      amount,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "YourTestSecretHere";

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      auditLogger.warn(`Payment verification failed - Invalid signature`, {
        eventId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Save transaction
    const transaction = await GiftTransaction.create({
      userId: req.user._id, // Assume auth middleware sets req.user
      eventId,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "success",
      paymentMethod: "UPI", // Based on user request
      entryType: "online",
    });

    // Update Event Collected Amount
    await Event.findByIdAndUpdate(eventId, {
      $inc: { collectedAmount: amount },
    });

    auditLogger.info(`Payment verified and transaction recorded`, {
      transactionId: transaction._id,
      eventId,
      amount,
      userId: req.user._id,
      paymentId: razorpay_payment_id,
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      transaction,
    });
  } catch (error) {
    logger.error(`Error verifying payment: ${error.message}`, {
      stack: error.stack,
      eventId: req.body.eventId,
    });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createManualGift = async (req, res) => {
  try {
    const { eventId, amount, donorName, note, paymentMethod } = req.body;

    if (!eventId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Event and amount are required" });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be greater than 0" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the event organizer can add manual gift entries",
      });
    }

    const manualOrderId = `manual_${Date.now()}`;
    const transaction = await GiftTransaction.create({
      userId: req.user._id,
      eventId,
      amount: numericAmount,
      orderId: manualOrderId,
      status: "success",
      paymentMethod: paymentMethod || "Cash",
      donorName: donorName?.trim() || "Anonymous",
      note: note?.trim() || "",
      entryType: "manual",
    });

    event.collectedAmount += numericAmount;
    await event.save();

    appendManualGiftEntryToFile({
      transactionId: transaction._id.toString(),
      eventId: event._id.toString(),
      eventTitle: event.title,
      organizerId: req.user._id.toString(),
      donorName: transaction.donorName,
      amount: numericAmount,
      paymentMethod: transaction.paymentMethod,
      note: transaction.note,
      entryType: transaction.entryType,
      createdAt: transaction.createdAt,
    });

    auditLogger.info(`Manual gift entry recorded`, {
      transactionId: transaction._id,
      eventId,
      organizerId: req.user._id,
      amount: numericAmount,
      donorName: transaction.donorName,
    });

    res.status(201).json({
      success: true,
      message: "Manual gift entry added",
      transaction,
      collectedAmount: event.collectedAmount,
      filePath: getManualGiftFilePath(),
    });
  } catch (error) {
    logger.error(`Error creating manual gift entry: ${error.message}`, {
      stack: error.stack,
      eventId: req.body.eventId,
      userId: req.user?._id,
    });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
