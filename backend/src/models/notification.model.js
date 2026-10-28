const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, index: true },
    type: {
      type: String,
      enum: [
        "mentor_assigned",
        "chat_message",
        "group_added",
        "review_received",
        "mentor_rating",
        "system",
      ],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = model("Notification", notificationSchema);
