const ChatMessage = require("../models/chat.model");

const SEED_MESSAGES = [
  { sender: "Elena Rostova", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", text: "Hey team! Welcome to the #general channel 🚀", channel: "general" },
  { sender: "Alex Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "MongoDB backend API is live & connected seamlessly!", channel: "general" },
  { sender: "Molly Hellmuth", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", text: "Check out the new design system tokens in Figma! ✨", channel: "design" },
  { sender: "Sarah Connor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", text: "React Native Expo navigation is completely crash-free now.", channel: "engineering" },
  { sender: "David Hoang", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", text: "Just shipped our team's AI native design workflow showcase! 🎉", channel: "showcase" },
];

// GET /api/v1/chat?channel=general
exports.getChatMessages = async (req, res, next) => {
  try {
    const channel = req.query.channel || "general";
    
    // Seed initial messages if collection is empty
    const count = await ChatMessage.countDocuments({ channel });
    if (count === 0) {
      const channelSeeds = SEED_MESSAGES.filter((m) => m.channel === channel);
      if (channelSeeds.length > 0) {
        await ChatMessage.insertMany(channelSeeds);
      }
    }

    const messages = await ChatMessage.find({ channel }).sort({ createdAt: 1 }).limit(100);
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/chat
exports.sendChatMessage = async (req, res, next) => {
  try {
    const { sender, avatar, text, channel } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required" });
    }

    const message = await ChatMessage.create({
      sender: sender || "You",
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      text: text.trim(),
      channel: channel || "general",
      userId: req.user?._id,
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};
