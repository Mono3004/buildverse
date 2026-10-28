const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, default: "student" },
    avatarUrl: String,
    bio: { type: String, default: "" },
    company: { type: String, default: "" },
    github: { type: String, default: "" },
    skills: [{ type: String }],
    twoFactorEnabled: { type: Boolean, default: false },
    gitPoints: { type: Number, default: 150 },
    buildverseScore: { type: Number, default: 150 },
    rating: { type: Number, default: 5.0 },
    menteesCount: { type: Number, default: 0 },
    activeProjectsCount: { type: Number, default: 0 },
    buildRateAccuracy: { type: Number, default: 98.4 },
  },
  { timestamps: true },
);

module.exports = model("User", userSchema);