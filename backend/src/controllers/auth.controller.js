const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const SystemSettings = require("../models/system.model");
const env = require("../config/env");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    // Check maintenance mode for registration (except admin)
    const settings = await SystemSettings.findOne({ key: "global_settings" });
    if (settings && settings.maintenanceMode && req.body.role !== "admin") {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: settings.maintenanceMessage || "New updates are coming or email us on buildverse123@gmail.com",
        contactEmail: settings.contactEmail || "buildverse123@gmail.com",
      });
    }

    // 1. Zod Validation
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, password, role } = validationResult.data;

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Create user in MongoDB
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "student",
    });

    // 5. Generate token & return
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validationResult.data;

    // 2. Find user & select passwordHash
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Check maintenance mode (if active, only admin role is permitted)
    const settings = await SystemSettings.findOne({ key: "global_settings" });
    if (settings && settings.maintenanceMode && user.role !== "admin") {
      return res.status(503).json({
        success: false,
        maintenance: true,
        message: settings.maintenanceMessage || "New updates are coming or email us on buildverse123@gmail.com",
        contactEmail: settings.contactEmail || "buildverse123@gmail.com",
      });
    }

    // 4. Compare password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 5. Check Two-Factor Authentication
    if (user.twoFactorEnabled) {
      return res.json({
        success: true,
        requires2FA: true,
        message: "Two-Factor Authentication Code Required",
        email: user.email,
        role: user.role,
      });
    }

    // 6. Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: "Signed in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/2fa/verify
exports.verify2FA = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and 2FA code are required" });
    }

    const cleanCode = String(code).trim();
    if (cleanCode.length < 4 || cleanCode.length > 8) {
      return res.status(400).json({ success: false, message: "Please enter a valid 6-digit security code" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate token upon successful verification
    const token = generateToken(user);

    res.json({
      success: true,
      message: "Two-factor authentication verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/2fa/toggle
exports.toggle2FA = async (req, res, next) => {
  try {
    const { email, enabled } = req.body;
    const userEmail = email || req.user?.email;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "User email required" });
    }

    const user = await User.findOne({ email: userEmail.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.twoFactorEnabled = enabled !== undefined ? Boolean(enabled) : !user.twoFactorEnabled;
    await user.save();

    res.json({
      success: true,
      message: `Two-Factor Authentication ${user.twoFactorEnabled ? "ENABLED" : "DISABLED"}`,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/update-password
exports.updatePassword = async (req, res, next) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userEmail = email || req.user?.email;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: userEmail.toLowerCase().trim() }).select("+passwordHash");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (currentPassword && user.passwordHash) {
      const match = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!match) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully in MongoDB",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: Boolean(user.twoFactorEnabled),
        avatarUrl: user.avatarUrl || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
