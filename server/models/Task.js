import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: 2000,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "shopping",
        "delivery",
        "cleaning",
        "moving",
        "repair",
        "photography",
        "tutoring",
        "other",
      ],
      required: true,
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    rewardAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: String,
    },
    referencePhoto: String,
    completionPhoto: String,
    cancelReason: String,
    status: {
      type: String,
      enum: ["open", "accepted", "completed", "confirmed", "cancelled"],
      default: "open",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: Date,
    completedAt: Date,
    confirmedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true },
);

// Optional indexes for faster queries
taskSchema.index({ status: 1 });
taskSchema.index({ owner: 1 });
taskSchema.index({ acceptedBy: 1 });

export default mongoose.model("Task", taskSchema);
