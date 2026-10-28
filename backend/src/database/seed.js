const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const Project = require("../models/project.model");
const Issue = require("../models/issue.model");
const logger = require("../utils/logger");

module.exports = async function autoSeedDatabase() {
  try {
    // 1. SEED INITIAL ADMIN USER ONLY IF USERS COLLECTION IS COMPLETELY EMPTY
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "Elias Thorne",
        email: "admin@buildverse.io",
        passwordHash,
        role: "admin",
      });
      logger.info("MongoDB: Initial Root Admin (admin@buildverse.io) initialized successfully");
    }

    // Ensure all demo projects and demo issues are removed for a pure dynamic state
    const demoProjectNames = ["Mobile App Redesign", "MongoDB Express API", "Design System 2.0"];
    const removedProjects = await Project.deleteMany({ name: { $in: demoProjectNames } });
    if (removedProjects.deletedCount > 0) {
      logger.info(`MongoDB: Purged ${removedProjects.deletedCount} legacy demo projects`);
    }

    const demoIssueTitles = [
      "Connect Mongoose schemas to React Native App",
      "Add offline data caching with AsyncStorage",
      "Optimize MongoDB query indexing",
      "Publish npm package v2.4",
      "Setup MongoDB Indexing & Mongoose Schemas",
    ];
    const removedIssues = await Issue.deleteMany({ title: { $in: demoIssueTitles } });
    if (removedIssues.deletedCount > 0) {
      logger.info(`MongoDB: Purged ${removedIssues.deletedCount} legacy demo issues`);
    }
  } catch (err) {
    logger.warn("MongoDB Auto-seed Notice: " + err.message);
  }
};
