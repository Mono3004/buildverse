const router = require("express").Router();
const {
  getGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  getUserMemberships,
  joinGroupByKey,
  leaveGroupByKey,
} = require("../controllers/group.controller");

router.get("/", getGroups);
router.get("/:userId/memberships", getUserMemberships);
// Legacy routes
router.post("/:id/join", joinGroup);
router.post("/:id/leave", leaveGroup);
// New flat routes used by frontend workspace.js
router.post("/join", joinGroupByKey);
router.post("/leave", leaveGroupByKey);
router.post("/", createGroup);

module.exports = router;
