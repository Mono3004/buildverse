const User = require("../models/user.model");
const Project = require("../models/project.model");
const Review = require("../models/review.model");

// Initial mock seeds if DB review collection is empty
const INITIAL_REVIEWS = [
  {
    student: "Aarav Patel",
    project: "Distributed Microservices Architecture",
    PR: "PR #14: Implement Kafka Event Bus & Dead-Letter Queue",
    status: "Pending",
    rating: 0,
    gitPoints: 0,
    query: "Need advice on partition rebalancing handling under spike traffic.",
    comments: [
      {
        author: "Aarav Patel",
        text: "I set up the partition consumer group, but need a check on fault tolerance.",
        isMentor: false,
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
    mentor: "Elena Rostova",
  },
  {
    student: "Priya Sharma",
    project: "Fintech Mobile Core",
    PR: "PR #8: Biometric Auth & Offline SQLite Sync",
    status: "Approved",
    rating: 5,
    gitPoints: 100,
    query: "All edge-cases for biometric fallback have been verified on Android/iOS.",
    comments: [
      {
        author: "Elena Rostova",
        text: "Clean architecture! Token encryption is verified with secure keychain storage.",
        isMentor: true,
        createdAt: new Date(Date.now() - 7200000),
      },
    ],
    mentor: "Elena Rostova",
  },
];

// GET /api/v1/mentorship/mentees
exports.getMentees = async (_req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).sort({ createdAt: -1 });
    const projects = await Project.find().sort({ createdAt: -1 });

    const mentees = students.map((s, idx) => {
      // Find project associated with this student or assign one
      const assignedProject = projects.find((p) => String(p.userId) === String(s._id)) ||
        projects[idx % (projects.length || 1)] || null;

      // Project files for Read-Only Inspection
      const sampleFiles = [
        { path: "src/App.jsx", content: "// Main Application Component\nimport React from 'react';\n\nexport default function App() {\n  return (\n    <div className='app-container'>\n      <h1>BuildVerse Engineering Project</h1>\n      <p>Status: Active Deployment</p>\n    </div>\n  );\n}" },
        { path: "src/config/database.js", content: "// Database configuration\nconst mongoose = require('mongoose');\n\nconst connectDB = async () => {\n  try {\n    await mongoose.connect(process.env.MONGO_URI);\n    console.log('MongoDB Connected');\n  } catch (err) {\n    console.error(err.message);\n  }\n};\n\nmodule.exports = connectDB;" },
        { path: "package.json", content: '{\n  "name": "buildverse-mentee-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.3.1",\n    "mongoose": "^8.0.0"\n  }\n}' },
        { path: "README.md", content: "# Project Workspace\n\nBuilt under BuildVerse mentorship guidance.\n- 100% test coverage\n- Monitored microservices" },
      ];

      const files = assignedProject && assignedProject.files && assignedProject.files.length > 0
        ? assignedProject.files
        : sampleFiles;

      const commits = assignedProject && assignedProject.commits && assignedProject.commits.length > 0
        ? assignedProject.commits
        : [
            { hash: "8f4a1c2", author: s.name, message: "feat: initial system architecture setup", timestamp: new Date(Date.now() - 86400000 * 2) },
            { hash: "3e9b0d1", author: s.name, message: "fix: resolve token refresh race condition", timestamp: new Date(Date.now() - 86400000) },
          ];

      const members = [
        { name: s.name, role: "Lead Developer", email: s.email },
        { name: "Elena Rostova", role: "Mentor Advisor", email: "elena@buildverse.io" },
      ];

      return {
        id: s._id,
        name: s.name,
        email: s.email,
        bio: s.bio || "Full-Stack Engineer building distributed architectures.",
        avatar: s.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        gitPoints: s.gitPoints || s.buildverseScore || 150,
        buildverseScore: s.buildverseScore || s.gitPoints || 150,
        project: {
          id: assignedProject ? assignedProject._id : `proj_${s._id}`,
          name: assignedProject ? assignedProject.name : `${s.name}'s Engineering System`,
          description: assignedProject?.description || "High-performance full-stack web and cloud microservices application.",
          progress: assignedProject ? assignedProject.progress : 45,
          branch: assignedProject?.branch || "main",
          status: assignedProject && assignedProject.progress === 100 ? "Completed" : "Active Building",
          files,
          commits,
          members,
        },
      };
    });

    res.json({ success: true, count: mentees.length, data: mentees });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/mentorship/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { userId, studentName, role } = req.query;

    let query = {};

    if (userId) {
      // Find user to get their name for name-based matching
      let studentId = null;
      let namePattern = null;
      try {
        const user = await User.findById(userId);
        if (user) {
          studentId = user._id;
          namePattern = new RegExp(user.name, "i");
        }
      } catch { /* ignore bad id */ }

      if (studentId || namePattern) {
        const conditions = [];
        if (studentId) conditions.push({ studentId });
        if (namePattern) conditions.push({ student: namePattern });
        query = { $or: conditions };
      }
    } else if (studentName) {
      query = { student: new RegExp(studentName, "i") };
    }

    let reviews = await Review.find(query).sort({ createdAt: -1 });

    // Only seed defaults if no userId filter (i.e., admin/mentor view)
    if (reviews.length === 0 && !userId && !studentName) {
      reviews = await Review.insertMany(INITIAL_REVIEWS);
    }

    res.json({
      success: true,
      count: reviews.length,
      data: reviews.map((r) => ({
        id: r._id,
        student: r.student,
        studentId: r.studentId,
        project: r.project,
        projectId: r.projectId,
        PR: r.PR,
        status: r.status,
        query: r.query,
        rating: r.rating || 0,
        gitPoints: r.gitPoints || 0,
        comments: r.comments || [],
        mentor: r.mentor || "Elena Rostova",
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/mentorship/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { student, project, PR, query } = req.body;
    if (!student || !PR) {
      return res.status(400).json({ success: false, message: "Student and PR title are required" });
    }

    // Try finding matching student user
    const studentUser = await User.findOne({
      $or: [{ name: new RegExp(student, "i") }, { email: new RegExp(student, "i") }],
    });

    const newReview = await Review.create({
      student: student.trim(),
      studentId: studentUser ? studentUser._id : undefined,
      project: project?.trim() || "Workspace Project",
      PR: PR.trim(),
      status: "Pending",
      query: query || "",
      rating: 0,
      gitPoints: 0,
      comments: query
        ? [{ author: "Student", text: query, isMentor: false, createdAt: new Date() }]
        : [],
      mentor: "Elena Rostova",
    });

    res.status(201).json({
      success: true,
      data: {
        id: newReview._id,
        student: newReview.student,
        studentId: newReview.studentId,
        project: newReview.project,
        PR: newReview.PR,
        status: newReview.status,
        query: newReview.query,
        rating: newReview.rating,
        gitPoints: newReview.gitPoints,
        comments: newReview.comments,
        mentor: newReview.mentor,
        createdAt: newReview.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/mentorship/reviews/:id/status
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Approved", "Changes Requested", "Under Review"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const prevStatus = review.status;
    review.status = status;

    // If approving for the first time, award +50 GitPoints to student
    let awardedPoints = 0;
    if (status === "Approved" && prevStatus !== "Approved") {
      awardedPoints = 50;
      review.gitPoints = (review.gitPoints || 0) + awardedPoints;

      if (review.studentId) {
        await User.findByIdAndUpdate(review.studentId, {
          $inc: { gitPoints: awardedPoints, buildverseScore: awardedPoints },
        });
      } else {
        // Find by name match
        await User.findOneAndUpdate(
          { name: new RegExp(review.student, "i") },
          { $inc: { gitPoints: awardedPoints, buildverseScore: awardedPoints } }
        );
      }
    }

    await review.save();

    res.json({
      success: true,
      message: `Review status updated to ${status}`,
      data: {
        id: review._id,
        status: review.status,
        gitPoints: review.gitPoints,
        awardedPoints,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/mentorship/reviews/:id/comments
exports.addReviewComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { author, text, isMentor } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const comment = {
      author: author || (isMentor ? "Mentor" : "Student"),
      text: text.trim(),
      isMentor: Boolean(isMentor),
      createdAt: new Date(),
    };

    review.comments.push(comment);

    // Review engagement bonus: +10 GitPoints
    const bonus = 10;
    review.gitPoints = (review.gitPoints || 0) + bonus;

    if (review.studentId) {
      await User.findByIdAndUpdate(review.studentId, {
        $inc: { gitPoints: bonus, buildverseScore: bonus },
      });
    } else {
      await User.findOneAndUpdate(
        { name: new RegExp(review.student, "i") },
        { $inc: { gitPoints: bonus, buildverseScore: bonus } }
      );
    }

    await review.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully (+10 GitPoints awarded)",
      data: {
        id: review._id,
        comments: review.comments,
        gitPoints: review.gitPoints,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/mentorship/reviews/:id/rate
exports.rateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const stars = Number(rating);
    if (isNaN(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const oldRating = review.rating || 0;
    review.rating = stars;

    // GitPoints formula: 20 points per star
    const pointDelta = (stars - oldRating) * 20;
    if (pointDelta > 0) {
      review.gitPoints = (review.gitPoints || 0) + pointDelta;

      if (review.studentId) {
        await User.findByIdAndUpdate(review.studentId, {
          $inc: { gitPoints: pointDelta, buildverseScore: pointDelta },
        });
      } else {
        await User.findOneAndUpdate(
          { name: new RegExp(review.student, "i") },
          { $inc: { gitPoints: pointDelta, buildverseScore: pointDelta } }
        );
      }
    }

    await review.save();

    res.json({
      success: true,
      message: `Rated ${stars} stars! Added ${pointDelta > 0 ? pointDelta : 0} GitPoints to student score.`,
      data: {
        id: review._id,
        rating: review.rating,
        gitPoints: review.gitPoints,
        pointsAwarded: pointDelta > 0 ? pointDelta : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/mentorship/reviews/:id/query
exports.setReviewQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { query } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { query: query ? query.trim() : "" },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Query note updated",
      data: { id: review._id, query: review.query },
    });
  } catch (err) {
    next(err);
  }
};

const Notification = require("../models/notification.model");

// POST /api/v1/mentorship/rate-mentor
exports.rateMentor = async (req, res, next) => {
  try {
    const { mentorId, mentorEmail, rating, feedback, studentName } = req.body;
    const stars = Number(rating);
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    let mentor = null;
    if (mentorId) mentor = await User.findById(mentorId);
    if (!mentor && mentorEmail) mentor = await User.findOne({ email: mentorEmail.toLowerCase().trim() });
    if (!mentor) mentor = await User.findOne({ role: "mentor" });

    if (!mentor) {
      return res.status(404).json({ success: false, message: "Mentor not found" });
    }

    const currentRating = mentor.rating || 5.0;
    const newRating = Number(((currentRating * 4 + stars) / 5).toFixed(2));
    mentor.rating = newRating;
    await mentor.save();

    await Notification.create({
      userId: mentor._id,
      userEmail: mentor.email,
      type: "mentor_rating",
      title: "New Student Rating Received",
      message: `${studentName || "A student"} rated your mentorship ${stars}★: "${feedback || "Great guidance!"}"`,
      link: "/mentor/reviews",
      metadata: { rating: stars, feedback },
    });

    res.json({
      success: true,
      message: `Rated mentor ${mentor.name} ${stars} stars!`,
      data: {
        mentorId: mentor._id,
        mentorName: mentor.name,
        newRating: mentor.rating,
      },
    });
  } catch (err) {
    next(err);
  }
};

