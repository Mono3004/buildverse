const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user.model");
const Project = require("./models/project.model");
const Issue = require("./models/issue.model");
const ChatMessage = require("./models/chat.model");
const Course = require("./models/course.model");
const env = require("./config/env");

async function seedAllDatabaseData() {
  try {
    console.log("Connecting to MongoDB:", env.MONGO_URI);
    await mongoose.connect(env.MONGO_URI);

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash("password123", salt);

    // 1. SEED ALL USERS
    await User.deleteMany({});
    const createdUsers = await User.create([
      { name: "Elias Thorne", email: "elias.thorne@buildverse.io", passwordHash: defaultPasswordHash, role: "admin", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" },
      { name: "Sarah Chen", email: "sarah@buildverse.io", passwordHash: defaultPasswordHash, role: "student", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300" },
      { name: "Alex Chen", email: "alex@buildverse.io", passwordHash: defaultPasswordHash, role: "student", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300" },
      { name: "Elena Rostova", email: "elena@buildverse.io", passwordHash: defaultPasswordHash, role: "mentor", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300" },
      { name: "Erik Solberg", email: "erik@buildverse.io", passwordHash: defaultPasswordHash, role: "mentor", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300" },
      { name: "Astrid Lind", email: "astrid@buildverse.io", passwordHash: defaultPasswordHash, role: "student", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300" },
      { name: "Marcus Thorne", email: "marcus@buildverse.io", passwordHash: defaultPasswordHash, role: "student", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300" },
    ]);
    console.log(`✅ Seeded ${createdUsers.length} Users into MongoDB buildverse DB!`);

    // 2. SEED ALL PROJECTS
    await Project.deleteMany({});
    const createdProjects = await Project.create([
      {
        name: "Mobile App Redesign",
        description: "Ultra smooth React Native mobile UI with MongoDB backend.",
        tag: "Active",
        progress: 85,
        status: "active",
        userId: createdUsers[0]._id,
      },
      {
        name: "MongoDB Express API",
        description: "Express.js Mongoose models & controllers for live data sync.",
        tag: "In Progress",
        progress: 60,
        status: "active",
        userId: createdUsers[0]._id,
      },
      {
        name: "Design System 2.0",
        description: "Component library with dark mode tokens and animation primitives.",
        tag: "Completed",
        progress: 100,
        status: "Completed",
        userId: createdUsers[1]._id,
      },
      {
        name: "Project Phoenix",
        description: "Next-generation serverless architecture for automated infrastructure provisioning.",
        tag: "Active",
        progress: 74,
        status: "active",
        userId: createdUsers[0]._id,
      },
      {
        name: "Lumina WebGPU Engine",
        description: "High-performance rendering engine built for the web using WebGPU & Rust.",
        tag: "Active",
        progress: 90,
        status: "active",
        userId: createdUsers[2]._id,
      },
      {
        name: "Synapse Microservices CLI",
        description: "Command-line interface for managing distributed microservices.",
        tag: "In Progress",
        progress: 45,
        status: "active",
        userId: createdUsers[3]._id,
      },
    ]);
    console.log(`✅ Seeded ${createdProjects.length} Projects into MongoDB buildverse DB!`);

    // 3. SEED ALL ISSUES
    await Issue.deleteMany({});
    const createdIssues = await Issue.create([
      { projectId: createdProjects[0]._id, title: "PHX-102: Database Migration", priority: "High", status: "In Progress", resolved: false },
      { projectId: createdProjects[0]._id, title: "PHX-103: Edge Function Refactor", priority: "Medium", status: "In Progress", resolved: false },
      { projectId: createdProjects[0]._id, title: "PHX-098: API Documentation", priority: "Low", status: "Completed", resolved: true, resolvedAt: new Date() },
      { projectId: createdProjects[0]._id, title: "PHX-105: JWT Auth Cookie Refresh", priority: "High", status: "In Progress", resolved: false },
      { projectId: createdProjects[1]._id, title: "Connect Mongoose schemas to React Native App", priority: "High", status: "In Progress", resolved: false },
      { projectId: createdProjects[1]._id, title: "Add offline data caching with AsyncStorage", priority: "Medium", status: "Completed", resolved: true, resolvedAt: new Date() },
      { projectId: createdProjects[2]._id, title: "Optimize MongoDB query indexing", priority: "High", status: "In Progress", resolved: false },
      { projectId: createdProjects[2]._id, title: "Publish npm package v2.4", priority: "Low", status: "Completed", resolved: true, resolvedAt: new Date() },
    ]);
    console.log(`✅ Seeded ${createdIssues.length} Issues into MongoDB buildverse DB!`);

    // 4. SEED ALL CHAT MESSAGES
    await ChatMessage.deleteMany({});
    const createdChats = await ChatMessage.create([
      { sender: "Elena Rostova", text: "Hey team! Welcome to the #general discussion 🚀", channel: "general", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
      { sender: "Alex Chen", text: "MongoDB backend is connected and running live in buildverse DB!", channel: "general", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
      { sender: "Sarah Chen", text: "Design system 2.0 component specs are finalized.", channel: "general", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
      { sender: "Elias Thorne", text: "Mobile UI responsive layout performance is 100%!", channel: "general", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    ]);
    console.log(`✅ Seeded ${createdChats.length} Chat Messages into MongoDB buildverse DB!`);

    // 5. SEED ALL COURSES / MODULES
    await Course.deleteMany({});
    const createdCourses = await Course.create([
      {
        title: "Design Systems 2.0",
        slug: "design-systems-2.0",
        level: "core",
        summary: "Tokens, components, and the discipline to build scalable design systems.",
        lessons: [{ title: "Atomic Tokens", durationMin: 12 }, { title: "Component Specs", durationMin: 12 }],
        mentor: createdUsers[0]._id,
      },
      {
        title: "Web & Mobile Design Architecture",
        slug: "web-mobile-design-architecture",
        level: "advanced",
        summary: "Layout, typography, and visual rhythm that feels effortless across devices.",
        lessons: [{ title: "Fluid 12-Column Grids", durationMin: 12 }, { title: "Touch Thresholds", durationMin: 12 }],
        mentor: createdUsers[0]._id,
      },
      {
        title: "Rust & WebGPU High Performance Rendering",
        slug: "rust-webgpu-high-performance-rendering",
        level: "new",
        summary: "Build high-throughput 3D rendering engines for the browser.",
        lessons: [{ title: "WebGPU Pipeline Setup", durationMin: 20 }, { title: "Shaders & Memory Buffers", durationMin: 20 }],
        mentor: createdUsers[4]._id,
      },
    ]);
    console.log(`✅ Seeded ${createdCourses.length} Courses into MongoDB buildverse DB!`);

    console.log("\n🎉 ALL DEFAULT DATA SUCCESSFULLY SEEDED INTO MONGODB BUILDVERSE DB!");
    process.exit(0);
  } catch (err) {
    console.error("❌ MongoDB Seeding Error:", err);
    process.exit(1);
  }
}

seedAllDatabaseData();
