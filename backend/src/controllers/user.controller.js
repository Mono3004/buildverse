const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

// GET /api/v1/users
exports.getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role && req.query.role !== "all") {
      filter.role = req.query.role;
    }
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        bio: u.bio || "",
        company: u.company || "",
        github: u.github || "",
        skills: u.skills || [],
        twoFactorEnabled: Boolean(u.twoFactorEnabled),
        gitPoints: u.gitPoints || 150,
        buildverseScore: u.buildverseScore || 150,
        rating: u.rating || 5.0,
        avatar: u.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        status: "Active",
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const email = req.query.email || req.user?.email;
    let user = null;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else if (req.query.id) {
      user = await User.findById(req.query.id);
    }

    if (!user) {
      // Find default mentor or student
      user = (await User.findOne({ role: "mentor" })) || (await User.findOne());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio || "Senior Distributed Systems Mentor & Full-Stack Architect.",
        company: user.company || "BuildVerse Labs",
        github: user.github || "https://github.com/buildverse",
        skills: user.skills && user.skills.length > 0 ? user.skills : ["Architecture", "React", "Node.js", "MongoDB", "DevOps"],
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        gitPoints: user.gitPoints || 150,
        buildverseScore: user.buildverseScore || 150,
        rating: user.rating || 4.95,
        menteesCount: user.menteesCount || 12,
        activeProjectsCount: user.activeProjectsCount || 8,
        buildRateAccuracy: user.buildRateAccuracy || 98.4,
        avatar: user.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { id, email, name, bio, company, github, avatarUrl, skills, twoFactorEnabled } = req.body;
    let user = null;

    if (id) {
      user = await User.findById(id);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      user = (await User.findOne({ role: "mentor" })) || (await User.findOne());
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (company !== undefined) user.company = company.trim();
    if (github !== undefined) user.github = github.trim();
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl.trim();
    if (Array.isArray(skills)) user.skills = skills;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = Boolean(twoFactorEnabled);

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        company: user.company,
        github: user.github,
        skills: user.skills,
        twoFactorEnabled: user.twoFactorEnabled,
        avatar: user.avatarUrl,
        rating: user.rating,
        buildRateAccuracy: user.buildRateAccuracy,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/users/password
exports.changePassword = async (req, res, next) => {
  try {
    const { id, email, currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    let user = null;
    if (id) {
      user = await User.findById(id).select("+passwordHash");
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    } else {
      user = (await User.findOne({ role: "mentor" }).select("+passwordHash")) || (await User.findOne().select("+passwordHash"));
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (currentPassword && user.passwordHash) {
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ success: false, message: "Incorrect current password" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/users/leaderboard
exports.getLeaderboard = async (_req, res, next) => {
  try {
    const topStudents = await User.find({ role: "student" })
      .sort({ buildverseScore: -1, gitPoints: -1 })
      .limit(10);

    const leaderboard = topStudents.map((s, idx) => ({
      rank: idx + 1,
      id: s._id,
      name: s.name,
      email: s.email,
      avatar: s.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      score: s.buildverseScore || s.gitPoints || 150,
      gitPoints: s.gitPoints || 150,
      rating: s.rating || 5.0,
      badge: idx === 0 ? "Grandmaster" : idx < 3 ? "Lead Architect" : "Senior Builder",
    }));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, bio, company, github, avatarUrl } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || "password123", salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || "student",
      bio: bio || "",
      company: company || "",
      github: github || "",
      avatarUrl: avatarUrl || "",
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        status: "Active",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, avatarUrl, bio, company, github, skills } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (role) update.role = role;
    if (avatarUrl) update.avatarUrl = avatarUrl;
    if (bio !== undefined) update.bio = bio;
    if (company !== undefined) update.company = company;
    if (github !== undefined) update.github = github;
    if (Array.isArray(skills)) update.skills = skills;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        status: "Active",
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User removed successfully" });
  } catch (err) {
    next(err);
  }
};
