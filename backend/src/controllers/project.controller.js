const Project = require("../models/project.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

// GET /api/v1/projects
exports.getProjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/projects
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, tag, progress, status, userId, userEmail } = req.body;

    let targetUserId = userId || req.user?._id;
    if (!targetUserId && userEmail) {
      const u = await User.findOne({ email: userEmail.toLowerCase().trim() });
      if (u) targetUserId = u._id;
    }

    const project = await Project.create({
      name: name?.trim() || "New Project",
      description: description?.trim() || "",
      tag: tag || "Active",
      progress: progress || 0,
      status: status || "active",
      userId: targetUserId,
    });

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/projects/:id/assign-mentor
exports.assignMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mentorId, mentorName, mentorEmail } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    let resolvedMentor = null;
    if (mentorId) {
      resolvedMentor = await User.findById(mentorId);
    } else if (mentorEmail) {
      resolvedMentor = await User.findOne({ email: mentorEmail.toLowerCase().trim() });
    }

    project.mentorId = resolvedMentor ? resolvedMentor._id : mentorId;
    project.mentorName = resolvedMentor ? resolvedMentor.name : mentorName || "Assigned Mentor";
    project.mentorEmail = resolvedMentor ? resolvedMentor.email : mentorEmail || "";

    await project.save();

    // 1. Notify Student
    if (project.userId) {
      await Notification.create({
        userId: project.userId,
        type: "mentor_assigned",
        title: "Mentor Assigned to Your Project",
        message: `Admin assigned mentor ${project.mentorName} to your repository "${project.name}".`,
        link: "/dashboard",
        metadata: { projectId: project._id, mentorName: project.mentorName },
      });
    }

    // 2. Notify Mentor
    if (resolvedMentor) {
      await Notification.create({
        userId: resolvedMentor._id,
        userEmail: resolvedMentor.email,
        type: "mentor_assigned",
        title: "New Mentee Project Assigned",
        message: `You were assigned as lead mentor for project "${project.name}".`,
        link: "/mentor/mentees",
        metadata: { projectId: project._id, studentId: project.userId },
      });

      await User.findByIdAndUpdate(resolvedMentor._id, { $inc: { activeProjectsCount: 1 } });
    }

    res.json({
      success: true,
      message: `Mentor ${project.mentorName} assigned to ${project.name}`,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};
