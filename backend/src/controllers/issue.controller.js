const Issue = require("../models/issue.model");

// GET /api/v1/issues
exports.getIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find().sort({ resolved: 1, createdAt: -1 });
    res.json({ success: true, count: issues.length, data: issues });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/issues
exports.createIssue = async (req, res, next) => {
  try {
    const { title, priority, projectId, status, assignee } = req.body;
    const isDone = status === "done";
    const issue = await Issue.create({
      title,
      priority: priority || "Medium",
      status: status || "todo",
      assignee: assignee || "Elias Thorne",
      projectId: projectId || null,
      resolved: isDone,
      resolvedAt: isDone ? new Date() : null,
      userId: req.user?._id,
    });
    res.status(201).json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/issues/:id
exports.updateIssue = async (req, res, next) => {
  try {
    const patch = { ...req.body };
    if (patch.status === "done") {
      patch.resolved = true;
      patch.resolvedAt = new Date();
    } else if (patch.status && patch.status !== "done") {
      patch.resolved = false;
      patch.resolvedAt = null;
    }

    const issue = await Issue.findByIdAndUpdate(req.params.id, patch, {
      new: true,
      runValidators: true,
    });
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/issues/:id/toggle
exports.toggleIssueResolved = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

    issue.resolved = !issue.resolved;
    issue.status = issue.resolved ? "done" : "todo";
    issue.resolvedAt = issue.resolved ? new Date() : null;
    await issue.save();

    res.json({ success: true, data: issue });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/issues/:id
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });
    res.json({ success: true, message: "Issue deleted successfully" });
  } catch (err) {
    next(err);
  }
};
