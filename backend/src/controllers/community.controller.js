const CommunityPost = require("../models/community.model");
const Notification = require("../models/notification.model");

const INITIAL_POSTS = [
  {
    author: "Shah moksh",
    authorRole: "student",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    title: "Shipped Lumina WebGPU Engine v1.0 🚀",
    content:
      "Just finished benchmark tests with Rust & WGSL canvas pipelines. 120 FPS stable across all browsers with zero memory leaks.",
    tag: "Showcase",
    link: "https://github.com/buildverse/lumina-engine",
    likes: 24,
    comments: [
      {
        author: "Elena Rostova",
        authorRole: "mentor",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        text: "Outstanding architecture! The pipeline re-use logic avoids GPU buffer reallocation beautifully.",
        createdAt: new Date(Date.now() - 3600000),
      },
    ],
  },
  {
    author: "Elena Rostova",
    authorRole: "mentor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "Masterclass: High-Scale Kafka & Microservices Architecture",
    content:
      "New video lessons published in the BuildVerse Academy. We cover partition dead-letter queues, exactly-once semantics, and telemetry.",
    tag: "Resource",
    link: "https://buildverse.io/courses",
    likes: 48,
    comments: [],
  },
];

// GET /api/v1/community
exports.getPosts = async (_req, res, next) => {
  try {
    let posts = await CommunityPost.find().sort({ createdAt: -1 });

    if (posts.length === 0) {
      posts = await CommunityPost.insertMany(INITIAL_POSTS);
    }

    res.json({
      success: true,
      count: posts.length,
      data: posts.map((p) => ({
        id: p._id,
        author: p.author,
        authorId: p.authorId,
        authorRole: p.authorRole,
        avatar: p.avatar,
        title: p.title,
        content: p.content,
        tag: p.tag,
        link: p.link,
        likes: p.likes || 0,
        likedBy: p.likedBy || [],
        comments: p.comments || [],
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/community
exports.createPost = async (req, res, next) => {
  try {
    const { author, authorRole, avatar, title, content, tag, link } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    const post = await CommunityPost.create({
      author: author || req.user?.name || "Developer",
      authorId: req.user?.id,
      authorRole: authorRole || req.user?.role || "student",
      avatar: avatar || req.user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      title: title.trim(),
      content: content.trim(),
      tag: tag || "Showcase",
      link: link || "",
      likes: 0,
      likedBy: [],
      comments: [],
    });

    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/community/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.body.userEmail || req.user?.email || "guest";

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const liked = post.likedBy.includes(userIdentifier);
    if (liked) {
      post.likedBy = post.likedBy.filter((u) => u !== userIdentifier);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userIdentifier);
      post.likes = (post.likes || 0) + 1;
    }

    await post.save();

    res.json({
      success: true,
      liked: !liked,
      likes: post.likes,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/community/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { author, authorRole, avatar, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = {
      author: author || req.user?.name || "Member",
      authorId: req.user?.id,
      authorRole: authorRole || req.user?.role || "student",
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // Create notification for the post author if someone commented
    if (post.authorId && String(post.authorId) !== String(req.user?.id)) {
      await Notification.create({
        userId: post.authorId,
        type: "review_received",
        title: "New Community Comment",
        message: `${comment.author} commented on your post: "${post.title.slice(0, 30)}..."`,
        link: "/community",
        metadata: { postId: post._id },
      });
    }

    res.status(201).json({
      success: true,
      data: comment,
      commentsCount: post.comments.length,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/community/:id
exports.deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    await CommunityPost.findByIdAndDelete(id);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    next(err);
  }
};
