import Message from "../models/Message.js";
import Task from "../models/Task.js";
import mongoose from "mongoose";

export const getTaskMessages = async (req, res) => {
  try {
    const { taskId } = req.params;

    // ✅ FIX 1: validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid taskId" });
    }

    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;

    const messages = await Message.find({ task: taskId })
      .populate("sender", "name profilePhoto")
      .populate("receiver", "name profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "name",
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ task: taskId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ getTaskMessages ERROR:", error); // ✅ ADD THIS
    res.status(500).json({ message: error.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { task, text, replyTo } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Message text required" });
    }

    const taskDoc = await Task.findById(task);

    if (!taskDoc) {
      return res.status(404).json({ message: "Task not found" });
    }

    let receiver;

    if (taskDoc.owner.toString() === req.user._id.toString()) {
      receiver = taskDoc.acceptedBy;
    } else {
      receiver = taskDoc.owner;
    }

    if (!receiver) {
      return res
        .status(400)
        .json({ message: "Task must have accepted worker to chat" });
    }

    const message = await Message.create({
      task,
      sender: req.user._id,
      receiver,
      text,
      replyTo: replyTo || null, // ✅ ADD THIS
    });

    const io = req.app.get("io"); // ✅ ONLY ONCE

    // ✅ MESSAGE → send ONLY socket event (no DB notification)
    io.to(receiver.toString()).emit("messageNotification", {
      type: "message",
      message: text,
      actor: {
        _id: req.user._id,
        name: req.user.name,
        profilePhoto: req.user.profilePhoto,
      },
      taskId: task,
    });

    const populated = await Message.findById(message._id)
      .populate("sender", "name profilePhoto")
      .populate("receiver", "name profilePhoto")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "name",
        },
      });
    // chat room update
    io.to(task.toString()).emit("newMessage", populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },

      // 🔥 VERY IMPORTANT: normalize participants
      {
        $addFields: {
          participants: {
            $cond: [
              { $lt: ["$sender", "$receiver"] },
              ["$sender", "$receiver"],
              ["$receiver", "$sender"],
            ],
          },
        },
      },

      // 🔥 sort BEFORE grouping
      {
        $sort: { createdAt: -1 },
      },

      // 🔥 group by task + participants
      {
        $group: {
          _id: {
            task: "$task",
            participants: "$participants",
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },

      {
        $replaceRoot: { newRoot: "$lastMessage" },
      },

      // 🔥 populate task
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "task",
        },
      },
      { $unwind: "$task" },

      // 🔥 populate sender
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },

      // 🔥 populate receiver
      {
        $lookup: {
          from: "users",
          localField: "receiver",
          foreignField: "_id",
          as: "receiver",
        },
      },
      { $unwind: "$receiver" },

      // 🔥 final shape
      {
        $project: {
          text: 1,
          createdAt: 1,
          "task._id": 1,
          "task.title": 1,
          "sender._id": 1,
          "sender.name": 1,
          "sender.profilePhoto": 1,
          "receiver._id": 1,
          "receiver.name": 1,
          "receiver.profilePhoto": 1,
        },
      },
    ]);

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { taskId } = req.params;

    await Message.updateMany(
      {
        task: taskId,
        receiver: req.user._id,
        read: false,
      },
      {
        $set: { read: true },
      },
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
