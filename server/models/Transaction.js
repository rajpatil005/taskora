import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['credit', 'debit', 'escrow_lock', 'escrow_release'],
      required: true
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    paymentId: String,
    paymentMethod: String
  },
  { timestamps: true }
);

export default mongoose.model('Transaction', transactionSchema);
