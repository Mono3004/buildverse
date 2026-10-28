const { Schema, model } = require("mongoose");

const courseSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    level: { type: String, enum: ["core", "advanced", "new", "Core", "Advanced", "New"], default: "core", set: (v) => (v ? v.toLowerCase() : v) },
    summary: String,
    videoUrl: String,
    lessons: [{ title: String, durationMin: Number, videoUrl: String, duration: String, completed: Boolean }],
    mentor: { type: Schema.Types.Mixed },

  },
  { timestamps: true },
);

module.exports = model("Course", courseSchema);