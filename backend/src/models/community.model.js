const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  author: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: "User" },
  authorRole: { type: String, default: "student" },
  avatar: { type: String, default: "" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const communityPostSchema = new Schema(
  {
    author: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    authorRole: { type: String, default: "student" },
    avatar: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tag: {
      type: String,
      enum: ["Showcase", "Feedback", "Question", "Resource", "General"],
      default: "Showcase",
    },
    link: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }], // user emails or ids
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = model("CommunityPost", communityPostSchema);
