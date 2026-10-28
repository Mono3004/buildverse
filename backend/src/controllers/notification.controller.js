const Notification = require("../models/notification.model");
const User = require("../models/user.model");

// GET /api/v1/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const userEmail = req.query.email || req.user?.email;
    const userId = req.query.userId || req.user?.id;

    const filter = {};
    if (userId) {
      filter.$or = [{ userId }, { userEmail }];
    } else if (userEmail) {
      filter.userEmail = userEmail.toLowerCase().trim();
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ ...filter, read: false });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications.map((n) => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        metadata: n.metadata,
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/notifications
exports.createNotification = async (req, res, next) => {
  try {
    const { userId, userEmail, type, title, message, link, metadata } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    let targetUserId = userId;
    let targetEmail = userEmail;

    if (!targetUserId && targetEmail) {
      const user = await User.findOne({ email: targetEmail.toLowerCase().trim() });
      if (user) targetUserId = user._id;
    }

    const notification = await Notification.create({
      userId: targetUserId,
      userEmail: targetEmail ? targetEmail.toLowerCase().trim() : undefined,
      type: type || "system",
      title: title.trim(),
      message: message.trim(),
      link: link || "",
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userEmail = req.query.email || req.body.email || req.user?.email;
    const userId = req.query.userId || req.body.userId || req.user?.id;

    const filter = {};
    if (userId) {
      filter.$or = [{ userId }, { userEmail }];
    } else if (userEmail) {
      filter.userEmail = userEmail.toLowerCase().trim();
    }

    await Notification.updateMany(filter, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};
