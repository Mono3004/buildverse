const { z } = require("zod");

exports.createCourse = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  level: z.string().optional(),
  summary: z.string().optional(),
  videoUrl: z.string().optional(),
  mentor: z.string().optional(),
});