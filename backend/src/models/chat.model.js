const { Schema, model } = require("mongoose");

const chatMessageSchema = new Schema(
  {
    sender: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    text: { type: String, required: true, trim: true },
    channel: { type: String, default: "general", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = model("ChatMessage", chatMessageSchema);
