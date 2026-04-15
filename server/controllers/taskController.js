import Task from "../models/Task.js";
import Wallet from "../models/Wallet.js";
import Transaction from "../models/Transaction.js";
import { calculateDistance } from "../utils/distance.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      itemName,
      category,
      estimatedPrice,
      rewardAmount,
      location,
      referencePhoto,
    } = req.body;

    // Validate input
    if (
      !title ||
      !description ||
      !itemName ||
      !category ||
      !estimatedPrice ||
      !rewardAmount ||
      !location
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user has sufficient balance
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < rewardAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create task
    const task = new Task({
      title,
      description,
      itemName,
      category,
      estimatedPrice,
      rewardAmount,
      location,
      referencePhoto,
      owner: req.user._id,
    });

    await task.save();

    // Lock reward amount in escrow
    wallet.balance -= rewardAmount;
    wallet.lockedEscrow += rewardAmount;
    wallet.totalSpent += rewardAmount;
    await wallet.save();

    // Record transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      amount: rewardAmount,
      type: "escrow_lock",
      description: `Task posted: ${title}`,
      reference: task._id,
    });
    await transaction.save();

    res.status(201).json({
      message: "Task created successfully",
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        location: task.location,
        rewardAmount: task.rewardAmount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyTasks = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10,
      category,
      minReward,
      maxReward,
    } = req.query;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude required" });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    // Build filter
    let filter = {
      status: "open",
      owner: { $ne: req.user._id }, // Exclude user's own tasks
    };

    if (category) {
      filter.category = category;
    }

    // Get all open tasks
    let tasks = await Task.find(filter)
      .populate("owner", "name rating completedTasks profilePhoto")
      .sort({ createdAt: -1 });

    // Filter by distance
    tasks = tasks.filter((task) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        task.location.latitude,
        task.location.longitude,
      );
      return distance <= radiusKm;
    });

    // Add distance to each task
    tasks = tasks.map((task) => ({
      ...task.toObject(),
      distance: calculateDistance(
        userLat,
        userLon,
        task.location.latitude,
        task.location.longitude,
      ),
    }));

    // Sort by distance
    tasks.sort((a, b) => a.distance - b.distance);

    // Filter by reward if provided
    const min = minReward ? parseFloat(minReward) : null;
    const max = maxReward ? parseFloat(maxReward) : null;

    if (min !== null || max !== null) {
      tasks = tasks.filter((task) => {
        if (min !== null && task.rewardAmount < min) return false;
        if (max !== null && task.rewardAmount > max) return false;
        return true;
      });
    }

    res.json({ tasks, count: tasks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskDetails = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("owner", "name email phone rating completedTasks profilePhoto")
      .populate(
        "acceptedBy",
        "name email phone rating completedTasks profilePhoto",
      );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Calculate distance if user location provided
    let distance = null;
    if (req.query.latitude && req.query.longitude) {
      distance = calculateDistance(
        parseFloat(req.query.latitude),
        parseFloat(req.query.longitude),
        task.location.latitude,
        task.location.longitude,
      );
    }

    res.json({ task: { ...task.toObject(), distance } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "open") {
      return res.status(400).json({ message: "Task is no longer available" });
    }

    if (task.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot accept your own task" });
    }

    // Update task
    task.status = "accepted";
    task.acceptedBy = req.user._id;
    task.acceptedAt = new Date();
    await task.save();

    res.json({ message: "Task accepted successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { completionPhoto } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Task must be accepted before completion" });
    }

    if (
      !task.acceptedBy ||
      task.acceptedBy.toString() !== req.user._id.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Only task acceptor can complete" });
    }

    // Update task
    task.status = "completed";
    task.completionPhoto = completionPhoto;
    task.completedAt = new Date();
    await task.save();

    res.json({ message: "Task completed successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmCompletion = async (req, res) => {
  try {
    console.log("CONFIRM TASK ID:", req.params.id);
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "confirmed") {
      return res.status(400).json({ message: "Task already confirmed" });
    }

    if (task.status !== "completed") {
      return res.status(400).json({ message: "Task must be completed first" });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Only task owner can confirm completion" });
    }

    const workerWallet = await Wallet.findOne({
      user: task.acceptedBy.toString(),
    });

    const ownerWallet = await Wallet.findOne({
      user: task.owner.toString(),
    });

    if (!workerWallet || !ownerWallet) {
      return res.status(400).json({ message: "Wallet not found" });
    }

    const reward = task.rewardAmount;

    // transfer reward to worker
    workerWallet.balance += reward;
    workerWallet.totalEarned += reward;
    await workerWallet.save();

    // release escrow
    ownerWallet.lockedEscrow = Math.max(0, ownerWallet.lockedEscrow - reward);
    await ownerWallet.save();

    // transactions
    await Transaction.create({
      wallet: workerWallet._id,
      amount: reward,
      type: "credit",
      description: `Task completed: ${task.title}`,
      reference: task._id,
    });

    await Transaction.create({
      wallet: ownerWallet._id,
      amount: reward,
      type: "escrow_release",
      description: `Task confirmed: ${task.title}`,
      reference: task._id,
    });

    task.status = "confirmed";
    task.confirmedAt = new Date();
    await task.save();

    res.json({ message: "Task completion confirmed", task });
  } catch (error) {
    console.error("CONFIRM ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const { role = "owner" } = req.query;

    let filter = {};
    if (role === "owner") {
      filter.owner = req.user._id;
    } else if (role === "worker") {
      filter.acceptedBy = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate("owner", "name rating profilePhoto")
      .populate("acceptedBy", "name rating profilePhoto")
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelTask = async (req, res) => {
  try {
    const { reason } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Only task owner can cancel" });
    }

    if (task.status !== "open") {
      return res.status(400).json({ message: "Can only cancel open tasks" });
    }

    // Return funds to owner
    const wallet = await Wallet.findOne({ user: task.owner });
    wallet.balance += task.rewardAmount;
    wallet.lockedEscrow -= task.rewardAmount;
    await wallet.save();

    // Record transaction
    const transaction = new Transaction({
      wallet: wallet._id,
      amount: task.rewardAmount,
      type: "escrow_release",
      description: `Task cancelled: ${task.title}`,
      reference: task._id,
    });
    await transaction.save();

    // Update task
    task.status = "cancelled";
    task.cancelledAt = new Date();
    task.cancelReason = reason;
    await task.save();

    res.json({ message: "Task cancelled successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only owner can update
    if (task.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Cannot update completed/confirmed tasks
    if (["completed", "confirmed", "cancelled"].includes(task.status)) {
      return res
        .status(400)
        .json({ message: `Cannot update a ${task.status} task` });
    }

    // Update allowed fields
    const allowedFields = [
      "title",
      "description",
      "itemName",
      "category",
      "estimatedPrice",
      "rewardAmount",
      "location",
      "referencePhoto",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();

    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only owner can delete
    if (task.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    // Only open tasks can be deleted (no funds/acceptor issues)
    if (task.status !== "open") {
      return res
        .status(400)
        .json({ message: "Only open tasks can be deleted" });
    }

    // Return funds to owner
    const wallet = await Wallet.findOne({ user: task.owner });
    if (wallet) {
      wallet.balance += task.rewardAmount;
      wallet.lockedEscrow = Math.max(
        0,
        wallet.lockedEscrow - task.rewardAmount,
      );
      await wallet.save();

      await Transaction.create({
        wallet: wallet._id,
        amount: task.rewardAmount,
        type: "escrow_release",
        description: `Task deleted: ${task.title}`,
        reference: task._id,
      });
    }

    // delete task
    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
