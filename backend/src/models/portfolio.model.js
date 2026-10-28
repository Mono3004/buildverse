const { Schema, model } = require("mongoose");

const caseStudySchema = new Schema({
  id: { type: String },
  title: { type: String, required: true },
  summary: { type: String, default: "" },
  role: { type: String, default: "Full-Stack Engineer" },
  stack: { type: String, default: "React, Node.js, MongoDB" },
  link: { type: String, default: "" },
  published: { type: Boolean, default: true },
});

const portfolioSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    headline: { type: String, default: "Product engineer & designer" },
    bio: {
      type: String,
      default: "I build fast, considered interfaces and the distributed systems behind them.",
    },
    location: { type: String, default: "Remote" },
    accent: { type: String, default: "#CCFF00" },
    website: { type: String, default: "" },
    github: { type: String, default: "" },
    skills: [{ type: String }],
    caseStudies: [caseStudySchema],
    autoPublish: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = model("Portfolio", portfolioSchema);
