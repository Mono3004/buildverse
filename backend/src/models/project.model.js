const { Schema, model } = require("mongoose");

const commitSchema = new Schema({
  hash: { type: String, required: true },
  author: { type: String, default: "Developer" },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const fileSchema = new Schema({
  path: { type: String, required: true },
  content: { type: String, default: "" },
});

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tag: { type: String, default: "Active" },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, default: "active" },
    branch: { type: String, default: "main" },
    commits: [commitSchema],
    files: [fileSchema],
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    mentorName: { type: String, default: "" },
    mentorEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = model("Project", projectSchema);
