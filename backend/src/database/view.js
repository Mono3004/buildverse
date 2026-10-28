const mongoose = require("mongoose");
const User = require("../models/user.model");
const Project = require("../models/project.model");
const Issue = require("../models/issue.model");
const Course = require("../models/course.model");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/buildverse";

async function viewDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("\n========================================================");
    console.log(` Connected to MongoDB: ${MONGO_URI}`);
    console.log("========================================================\n");

    const users = await User.find().select("name email role createdAt").lean();
    console.log(`👤 USERS COLLECTION (${users.length} found):`);
    if (users.length === 0) {
      console.log("   (Empty - No registered users)");
    } else {
      console.table(
        users.map((u) => ({
          ID: u._id.toString().slice(-6),
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Created: u.createdAt?.toISOString?.()?.slice(0, 10) || "N/A",
        }))
      );
    }

    const projects = await Project.find().select("name tag progress status").lean();
    console.log(`\n📁 PROJECTS / REPOSITORIES (${projects.length} found):`);
    if (projects.length === 0) {
      console.log("   (Empty - No repositories created yet)");
    } else {
      console.table(
        projects.map((p) => ({
          ID: p._id.toString().slice(-6),
          Name: p.name,
          Tag: p.tag,
          Progress: `${p.progress}%`,
          Status: p.status,
        }))
      );
    }

    const issues = await Issue.find().select("title priority status assignee").lean();
    console.log(`\n📋 ISSUES / SPRINT KANBAN (${issues.length} found):`);
    if (issues.length === 0) {
      console.log("   (Empty - No sprint tickets created yet)");
    } else {
      console.table(
        issues.map((i) => ({
          ID: i._id.toString().slice(-6),
          Title: i.title,
          Priority: i.priority,
          Status: i.status,
          Assignee: i.assignee,
        }))
      );
    }

    const courses = await Course.find().select("title level mentor").lean();
    console.log(`\n🎓 COURSES / CURRICULUM (${courses.length} found):`);
    if (courses.length === 0) {
      console.log("   (Empty - No masterclasses published yet)");
    } else {
      console.table(
        courses.map((c) => ({
          ID: c._id.toString().slice(-6),
          Title: c.title,
          Level: c.level,
          Mentor: c.mentor,
        }))
      );
    }

    console.log("\n========================================================\n");
  } catch (err) {
    console.error("Failed to query MongoDB:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewDatabase();
