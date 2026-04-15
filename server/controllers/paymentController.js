import crypto from "crypto";
import Razorpay from "razorpay";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const initiatePayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${req.user._id}_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      message: "Payment order created",
      orderId: order._id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, amount } = req.body;

    // Verify signature
    const signatureBody = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = new Wallet({ user: req.user._id });
    }

    // Update wallet
    wallet.balance += amount;
    wallet.totalEarned += amount;
    await wallet.save();

    // Record transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      amount,
      type: "credit",
      description: "Fund added via Razorpay",
      paymentId,
      paymentMethod: "razorpay",
      status: "completed",
    });
    await transaction.save();

    res.json({
      message: "Payment verified successfully",
      wallet: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const body = req.rawBody || JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === "payment.authorized") {
      console.log("Payment authorized:", payload);
    } else if (event === "payment.failed") {
      console.log("Payment failed:", payload);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};
