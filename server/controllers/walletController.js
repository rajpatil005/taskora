import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";

export const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({
      wallet: {
        balance: wallet.balance,
        lockedEscrow: wallet.lockedEscrow,
        totalEarned: wallet.totalEarned,
        totalSpent: wallet.totalSpent,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWalletHistory = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

    const transactions = await Transaction.find({ wallet: wallet._id })
      .populate("reference", "title")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments({ wallet: wallet._id });

    res.json({
      transactions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addFunds = async (req, res) => {
  try {
    const { amount, paymentId, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    wallet.balance += amount;
    wallet.totalEarned += amount;
    await wallet.save();

    const transaction = new Transaction({
      wallet: wallet._id,
      amount,
      type: "credit",
      description: "Fund added",
      paymentId,
      paymentMethod,
    });
    await transaction.save();

    res.json({ message: "Funds added successfully", wallet });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
