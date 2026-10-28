const { Schema, model } = require("mongoose");

const systemSettingsSchema = new Schema(
  {
    key: { type: String, default: "global_settings", unique: true },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      default: "New updates are coming or email us on buildverse123@gmail.com",
    },
    contactEmail: { type: String, default: "buildverse123@gmail.com" },
    allowedRoles: [{ type: String, default: "admin" }],
    updatedBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = model("SystemSettings", systemSettingsSchema);
