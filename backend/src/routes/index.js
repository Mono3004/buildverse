const router = require("express").Router();
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const mentorshipRoutes = require("./mentorship.routes");
const courseRoutes = require("./course.routes");
const projectRoutes = require("./project.routes");
const issueRoutes = require("./issue.routes");
const chatRoutes = require("./chat.routes");
const systemRoutes = require("./system.routes");
const notificationRoutes = require("./notification.routes");
const groupRoutes = require("./group.routes");
const portfolioRoutes = require("./portfolio.routes");
const communityRoutes = require("./community.routes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/mentorship", mentorshipRoutes);
router.use("/courses", courseRoutes);
router.use("/projects", projectRoutes);
router.use("/issues", issueRoutes);
router.use("/chat", chatRoutes);
router.use("/system", systemRoutes);
router.use("/notifications", notificationRoutes);
router.use("/groups", groupRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/community", communityRoutes);
router.get("/health", (_req, res) => res.json({ success: true, status: "healthy", timestamp: new Date() }));

module.exports = router;