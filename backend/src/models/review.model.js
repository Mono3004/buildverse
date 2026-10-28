const { Schema, model } = require("mongoose");

const reviewCommentSchema = new Schema({
  author: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  isMentor: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const reviewSchema = new Schema(
  {
    student: { type: String, required: true, trim: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: String, required: true, trim: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    PR: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Changes Requested", "Under Review"],
      default: "Pending",
    },
    query: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    gitPoints: { type: Number, default: 0 },
    comments: [reviewCommentSchema],
    mentor: { type: String, default: "Elena Rostova" },
    mentorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = model("Review", reviewSchema);
