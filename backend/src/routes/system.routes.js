const router = require("express").Router();
const { getMaintenanceStatus, updateMaintenanceStatus } = require("../controllers/system.controller");

router.get("/maintenance", getMaintenanceStatus);
router.post("/maintenance", updateMaintenanceStatus);

module.exports = router;
