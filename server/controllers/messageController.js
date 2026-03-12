import Message from '../models/Message.js';

export const getTaskMessages = async (req, res) => {
  try {
    const { taskId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;

    const messages = await Message.find({ task: taskId })
      .populate('sender', 'name profilePhoto')
      .populate('receiver', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ task: taskId });

    res.json({
      messages: messages.reverse(),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req, res) => {
  try {
    // Get unique tasks where user has messages
    const conversations = await Message.distinct('task', {
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    // Get latest message for each task
    const tasks = [];
    for (const taskId of conversations) {
      const latestMessage = await Message.findOne({ task: taskId })
        .sort({ createdAt: -1 })
        .populate('task', 'title')
        .populate('sender', 'name profilePhoto')
        .populate('receiver', 'name profilePhoto');

      if (latestMessage) {
        tasks.push(latestMessage);
      }
    }

    res.json({ conversations: tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
