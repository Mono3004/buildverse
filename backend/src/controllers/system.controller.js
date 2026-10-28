const SystemSettings = require("../models/system.model");

// GET /api/v1/system/maintenance
exports.getMaintenanceStatus = async (_req, res, next) => {
  try {
    let settings = await SystemSettings.findOne({ key: "global_settings" });
    if (!settings) {
      settings = await SystemSettings.create({
        key: "global_settings",
        maintenanceMode: false,
        maintenanceMessage: "New updates are coming or email us on buildverse123@gmail.com",
        contactEmail: "buildverse123@gmail.com",
      });
    }

    res.json({
      success: true,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      contactEmail: settings.contactEmail,
      updatedAt: settings.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/system/maintenance
exports.updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { maintenanceMode, maintenanceMessage, contactEmail } = req.body;

    let settings = await SystemSettings.findOne({ key: "global_settings" });
    if (!settings) {
      settings = new SystemSettings({ key: "global_settings" });
    }

    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = Boolean(maintenanceMode);
    }
    if (maintenanceMessage) {
      settings.maintenanceMessage = maintenanceMessage.trim();
    }
    if (contactEmail) {
      settings.contactEmail = contactEmail.trim();
    }
    settings.updatedBy = req.user?.name || "Admin";

    await settings.save();

    res.json({
      success: true,
      message: `Maintenance mode ${settings.maintenanceMode ? "ENABLED" : "DISABLED"}`,
      data: {
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        contactEmail: settings.contactEmail,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
