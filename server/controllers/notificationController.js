import Notification from "../models/Notification.js";

// GET notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE notification (helper function)
export const createNotification = async (
  userId,
  message,
  type = "system",
  req,
  actor = null,
  taskId = null,
) => {
  try {
    const notification = await Notification.create({
      userId,
      message,
      type,
      taskId,
      actor: actor
        ? {
            _id: String(actor._id),
            name: actor.name,
            profilePhoto: actor.profilePhoto || null,
            avatarSeed: actor.avatarSeed || actor._id,
          }
        : type === "system"
          ? {
              _id: "system",
              name: "System",
              profilePhoto: "/app_icons/pfp.png",
              avatarSeed: "system",
            }
          : undefined,
    });

    const io = req?.app?.get("io");

    if (io) {
      io.to(userId.toString()).emit("notification", {
        _id: notification._id,
        userId,
        message,
        type,
        isRead: false,
        createdAt: notification.createdAt,
        actor: notification.actor || null,
        taskId,
      });
    }

    return notification;
  } catch (error) {
    console.log("Notification Error:", error.message);
  }
};

// MARK AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
