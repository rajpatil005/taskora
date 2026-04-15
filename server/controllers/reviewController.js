import Review from "../models/Review.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

export const createReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "confirmed") {
      return res.status(400).json({
        message: "Task must be confirmed before reviewing",
      });
    }

    // Determine reviewer and reviewee
    let reviewee;

    if (task.owner && task.owner.toString() === req.user._id.toString()) {
      // Owner reviewing worker
      if (!task.acceptedBy) {
        return res.status(400).json({ message: "Task has no assigned worker" });
      }
      reviewee = task.acceptedBy;
      if (task.isReviewedByOwner) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this task" });
      }
      task.isReviewedByOwner = true;
    } else if (
      task.acceptedBy &&
      task.acceptedBy.toString() === req.user._id.toString()
    ) {
      // Worker reviewing owner
      reviewee = task.owner;
      if (task.isReviewedByWorker) {
        return res
          .status(400)
          .json({ message: "You have already reviewed this task" });
      }
      task.isReviewedByWorker = true;
    } else {
      return res
        .status(400)
        .json({ message: "Only task participants can review" });
    }

    // Create review
    const review = new Review({
      task: taskId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment,
    });
    await review.save();

    // Update task
    await task.save();

    // Update user rating efficiently
    const user = await User.findById(reviewee);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newTotalRatings = user.totalRatings + 1;

    const newAverage =
      (user.rating * user.totalRatings + rating) / newTotalRatings;

    user.rating = Number(newAverage.toFixed(2));
    user.totalRatings = newTotalRatings;

    await user.save();
    res.status(201).json({
      message: "Review submitted successfully",
      review,
      revieweeUpdatedRating: user.rating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this task",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

export const getTaskReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ task: req.params.id })
      .populate("reviewer", "name profilePhoto rating")
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name profilePhoto")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reviewee: req.params.userId });

    res.json({
      reviews,
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
