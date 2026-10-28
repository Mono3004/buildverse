const Group = require("../models/group.model");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const DEFAULT_GROUPS = [
  {
    name: "React & WebGPU Guild",
    slug: "react-webgpu-guild",
    topic: "Mobile UI, high-throughput animations & shaders",
    category: "Frontend",
    description: "Deep-dive into React 19 architecture, Hermes engine, and WebGPU canvas shaders.",
    isPrivate: false,
    memberCount: 42,
  },
  {
    name: "Distributed Systems & Cloud",
    slug: "distributed-systems-cloud",
    topic: "Microservices, Kafka, Redis & MongoDB Sharding",
    category: "Backend",
    description: "Designing high-scale, resilient fault-tolerant distributed backends.",
    isPrivate: false,
    memberCount: 68,
  },
  {
    name: "Security & AI Engineering",
    slug: "security-ai-engineering",
    topic: "LLM guardrails, pentesting & Zero-Trust IAM",
    category: "Security",
    description: "Mastering OWASP security and building autonomous intelligent agents.",
    isPrivate: false,
    memberCount: 35,
  },
];

// GET /api/v1/groups
exports.getGroups = async (req, res, next) => {
  try {
    let groups = await Group.find().sort({ createdAt: -1 });

    if (groups.length === 0) {
      groups = await Group.insertMany(DEFAULT_GROUPS);
    }

    const userEmail = req.query.email || req.user?.email;

    res.json({
      success: true,
      count: groups.length,
      data: groups.map((g) => ({
        id: g._id,
        name: g.name,
        slug: g.slug,
        topic: g.topic,
        category: g.category,
        description: g.description,
        isPrivate: g.isPrivate,
        creatorName: g.creatorName,
        memberCount: g.memberCount || (g.members?.length || 1),
        isMember: userEmail ? g.memberEmails?.includes(userEmail.toLowerCase().trim()) : false,
        createdAt: g.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/groups
exports.createGroup = async (req, res, next) => {
  try {
    const { name, topic, description, category, isPrivate, creatorName, userEmail } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Group name is required" });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const existing = await Group.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: "A squad with this name already exists" });
    }

    const email = (userEmail || req.user?.email || "").toLowerCase().trim();

    const group = await Group.create({
      name: cleanName,
      slug,
      topic: topic?.trim() || "General Engineering",
      description: description?.trim() || "Collaborative engineering guild.",
      category: category || "Engineering",
      isPrivate: Boolean(isPrivate),
      creatorName: creatorName || req.user?.name || "Member",
      creatorId: req.user?.id,
      memberEmails: email ? [email] : [],
      memberCount: 1,
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/groups/:id/join
exports.joinGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userEmail, userName } = req.body;
    const email = (userEmail || req.user?.email || "").toLowerCase().trim();

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.memberEmails.includes(email)) {
      group.memberEmails.push(email);
      group.memberCount = (group.memberCount || 0) + 1;
      await group.save();

      // Create notification
      await Notification.create({
        userEmail: email,
        type: "group_added",
        title: "Welcome to Squad",
        message: `You have successfully joined ${group.name}. Open #chat to start collaborating!`,
        link: "/chat",
        metadata: { groupId: group._id, groupSlug: group.slug },
      });
    }

    res.json({
      success: true,
      message: `Joined ${group.name}`,
      data: {
        id: group._id,
        name: group.name,
        slug: group.slug,
        memberCount: group.memberCount,
        isMember: true,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/groups/:id/leave
exports.leaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userEmail } = req.body;
    const email = (userEmail || req.user?.email || "").toLowerCase().trim();

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    group.memberEmails = group.memberEmails.filter((e) => e !== email);
    group.memberCount = Math.max(1, (group.memberCount || 1) - 1);
    await group.save();

    res.json({
      success: true,
      message: `Left ${group.name}`,
      data: {
        id: group._id,
        name: group.name,
        slug: group.slug,
        memberCount: group.memberCount,
        isMember: false,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/groups/:userId/memberships
exports.getUserMemberships = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const User = require("../models/user.model");
    let email = null;
    try {
      const user = await User.findById(userId);
      email = user?.email?.toLowerCase().trim();
    } catch { /* ignore */ }

    let groups = [];
    if (email) {
      groups = await Group.find({ memberEmails: email });
    }

    res.json({
      success: true,
      data: groups.map((g) => ({
        id: g._id,
        group_key: g.slug,
        group_name: g.name,
        topic: g.topic,
        joined_at: g.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/groups/join  (by groupKey/slug)
exports.joinGroupByKey = async (req, res, next) => {
  try {
    const { userId, groupKey, groupName } = req.body;
    if (!groupKey) {
      return res.status(400).json({ success: false, message: "groupKey is required" });
    }

    const User = require("../models/user.model");
    let email = null;
    try {
      const user = await User.findById(userId);
      email = user?.email?.toLowerCase().trim();
    } catch { /* ignore */ }

    let group = await Group.findOne({ slug: groupKey });
    if (!group && groupName) {
      group = await Group.create({
        name: groupName,
        slug: groupKey,
        topic: "Engineering",
        category: "Engineering",
        isPrivate: false,
        memberEmails: email ? [email] : [],
        memberCount: 1,
      });
    } else if (group && email && !group.memberEmails.includes(email)) {
      group.memberEmails.push(email);
      group.memberCount = (group.memberCount || 0) + 1;
      await group.save();

      await Notification.create({
        userEmail: email,
        type: "group_added",
        title: "Welcome to Squad",
        message: `You joined ${group.name}. Open #chat to start collaborating!`,
        link: "/chat",
        metadata: { groupId: group._id, groupSlug: group.slug },
      }).catch(() => {});
    }

    res.json({
      success: true,
      data: {
        id: group?._id,
        group_key: groupKey,
        group_name: groupName || group?.name,
        joined_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/groups/leave  (by groupKey/slug)
exports.leaveGroupByKey = async (req, res, next) => {
  try {
    const { userId, groupKey } = req.body;
    if (!groupKey) {
      return res.status(400).json({ success: false, message: "groupKey is required" });
    }

    const User = require("../models/user.model");
    let email = null;
    try {
      const user = await User.findById(userId);
      email = user?.email?.toLowerCase().trim();
    } catch { /* ignore */ }

    if (email) {
      await Group.updateOne(
        { slug: groupKey },
        { $pull: { memberEmails: email }, $inc: { memberCount: -1 } }
      );
    }

    res.json({ success: true, message: "Left group", data: { groupKey } });
  } catch (err) {
    next(err);
  }
};
