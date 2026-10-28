const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").trim(),
  email: z.string().email("Invalid email address format").trim().transform((val) => val.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["student", "mentor", "admin"]).optional().default("student"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address format").trim().transform((val) => val.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
