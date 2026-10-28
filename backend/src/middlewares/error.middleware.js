const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  if (status >= 500) logger.error(err.message, err);
  res.status(status).json({ success: false, message: err.message || "Internal server error" });
};