const Portfolio = require("../models/portfolio.model");
const User = require("../models/user.model");

const DEFAULT_CASE_STUDIES = [
  {
    id: "cs_1",
    title: "Lumina WebGPU Engine",
    summary: "High-performance rendering engine built for the modern web using WebGPU and Rust.",
    role: "Lead Systems Engineer",
    stack: "Rust, WebGPU, WGSL",
    link: "https://github.com/buildverse/lumina-engine",
    published: true,
  },
  {
    id: "cs_2",
    title: "MongoDB Express API Engine",
    summary: "Distributed Express + MongoDB backend with real-time WebSocket messaging and token auth.",
    role: "Backend Architect",
    stack: "Node.js, Express, MongoDB",
    link: "https://github.com/buildverse/nexus-api",
    published: true,
  },
  {
    id: "cs_3",
    title: "BuildVerse Mobile App",
    summary: "Cross-platform developer operating system built in React Native & Expo SDK 57.",
    role: "Frontend Engineer",
    stack: "React Native, Expo, Hermes",
    link: "https://buildverse.io",
    published: true,
  },
];

// GET /api/v1/portfolio
exports.getMyPortfolio = async (req, res, next) => {
  try {
    const email = (req.query.email || req.user?.email || "").toLowerCase().trim();
    const userId = req.query.userId || req.user?.id;

    let portfolio = null;
    if (userId) {
      portfolio = await Portfolio.findOne({ userId });
    }
    if (!portfolio && email) {
      portfolio = await Portfolio.findOne({ userEmail: email });
    }

    if (!portfolio) {
      // Find user to seed initial portfolio
      let user = null;
      if (email) user = await User.findOne({ email });
      if (!user && userId) user = await User.findById(userId);
      if (!user) user = await User.findOne({ role: "student" });

      const name = user ? user.name : "Member";
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + (user ? `-${String(user._id).slice(-4)}` : "");

      portfolio = await Portfolio.create({
        userId: user ? user._id : undefined,
        userEmail: user ? user.email : email || "developer@buildverse.io",
        slug,
        headline: "Product engineer & distributed systems designer",
        bio: user?.bio || "I build fast, considered interfaces and the distributed systems behind them.",
        location: "Remote",
        accent: "#CCFF00",
        website: "https://buildverse.io",
        github: user?.github || "https://github.com/buildverse",
        skills: user?.skills && user.skills.length > 0 ? user.skills : ["React", "TypeScript", "Node.js", "MongoDB", "DevOps"],
        caseStudies: DEFAULT_CASE_STUDIES,
        published: true,
      });
    }

    res.json({
      success: true,
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/portfolio/:slugOrId
exports.getPortfolioBySlugOrId = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;

    let portfolio = await Portfolio.findOne({
      $or: [{ slug: slugOrId.toLowerCase() }, { userEmail: slugOrId.toLowerCase() }],
    });

    if (!portfolio && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      portfolio = await Portfolio.findOne({ $or: [{ _id: slugOrId }, { userId: slugOrId }] });
    }

    if (!portfolio) {
      return res.status(404).json({ success: false, message: "Portfolio not found" });
    }

    res.json({ success: true, data: portfolio });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/portfolio
exports.savePortfolio = async (req, res, next) => {
  try {
    const {
      userId,
      userEmail,
      slug,
      headline,
      bio,
      location,
      accent,
      website,
      github,
      skills,
      caseStudies,
      published,
      autoPublish,
    } = req.body;

    const email = (userEmail || req.user?.email || "").toLowerCase().trim();
    let portfolio = null;

    if (userId) {
      portfolio = await Portfolio.findOne({ userId });
    }
    if (!portfolio && email) {
      portfolio = await Portfolio.findOne({ userEmail: email });
    }
    if (!portfolio && slug) {
      portfolio = await Portfolio.findOne({ slug: slug.toLowerCase() });
    }

    if (!portfolio) {
      portfolio = new Portfolio({
        userId,
        userEmail: email,
        slug: slug || `portfolio-${Date.now()}`,
      });
    }

    if (slug) portfolio.slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, "");
    if (headline !== undefined) portfolio.headline = headline.trim();
    if (bio !== undefined) portfolio.bio = bio.trim();
    if (location !== undefined) portfolio.location = location.trim();
    if (accent !== undefined) portfolio.accent = accent.trim();
    if (website !== undefined) portfolio.website = website.trim();
    if (github !== undefined) portfolio.github = github.trim();
    if (Array.isArray(skills)) portfolio.skills = skills;
    if (Array.isArray(caseStudies)) portfolio.caseStudies = caseStudies;
    if (published !== undefined) portfolio.published = Boolean(published);
    if (autoPublish !== undefined) portfolio.autoPublish = Boolean(autoPublish);

    await portfolio.save();

    // Also sync bio/github to User model if user exists
    if (portfolio.userEmail) {
      await User.findOneAndUpdate(
        { email: portfolio.userEmail },
        {
          $set: {
            bio: portfolio.bio,
            github: portfolio.github,
            skills: portfolio.skills,
          },
        }
      );
    }

    res.json({
      success: true,
      message: "Portfolio saved to MongoDB",
      data: portfolio,
    });
  } catch (err) {
    next(err);
  }
};
