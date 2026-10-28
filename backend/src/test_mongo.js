const mongoose = require("mongoose");
const User = require("./models/user.model");
const Project = require("./models/project.model");
const env = require("./config/env");

async function testInsert() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("Connected to MongoDB:", env.MONGO_URI);

    const testUser = await User.create({
      name: "Sunny Patel Test",
      email: `sunny.patel.${Date.now()}@buildverse.io`,
      passwordHash: "hashed_password_123",
      role: "STUDENT",
    });

    console.log("Successfully created User in MongoDB BuildVerse DB:", testUser);

    const allUsersCount = await User.countDocuments();
    console.log("Total users in MongoDB BuildVerse DB:", allUsersCount);

    process.exit(0);
  } catch (err) {
    console.error("MongoDB Test Insert Error:", err);
    process.exit(1);
  }
}

testInsert();
