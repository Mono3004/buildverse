const { Schema, model } = require("mongoose");

const groupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    topic: { type: String, default: "" },
    category: { type: String, default: "Engineering" },
    isPrivate: { type: Boolean, default: false },
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
    creatorName: { type: String, default: "Admin" },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    memberEmails: [{ type: String }],
    memberCount: { type: Number, default: 1 },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = model("Group", groupSchema);
