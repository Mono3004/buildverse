const router = require("express").Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  changePassword,
  getLeaderboard,
} = require("../controllers/user.controller");

router.route("/").get(getUsers).post(createUser);
router.route("/profile").get(getProfile).put(updateProfile);
router.route("/password").put(changePassword);
router.route("/leaderboard").get(getLeaderboard);
router.route("/:id").put(updateUser).patch(updateUser).delete(deleteUser);
router.route("/:id/role").put(updateUser).patch(updateUser);

module.exports = router;
