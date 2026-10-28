const jwt = require("jsonwebtoken");
const env = require("../config/env");

module.exports = function auth(required = true) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return required ? res.status(401).json({ message: "Unauthorized" }) : next();
    try {
      req.user = jwt.verify(token, env.JWT_SECRET);
      next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};