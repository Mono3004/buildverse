const router = require("express").Router();
const {
  register,
  login,
  getMe,
  verify2FA,
  toggle2FA,
  updatePassword,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/2fa/verify", verify2FA);
router.post("/2fa/toggle", toggle2FA);
router.post("/update-password", updatePassword);
router.get("/me", authMiddleware(true), getMe);

module.exports = router;
