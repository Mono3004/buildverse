export const SKILLS = [
  { title: "Design Systems", description: "Tokens, components, and the discipline to build scalable design systems." },
  { title: "Web & Mobile Design", description: "Layout, typography, and visual rhythm that feels effortless across devices." },
  { title: "Product Thinking", description: "Frame problems, validate user flows, and shape high-impact product features." },
  { title: "Motion & Micro-interactions", description: "Timing curves and smooth physics animations that convey high craft." },
  { title: "Brand Identity", description: "Visual language, marks, and voice that survive real-world product scaling." },
  { title: "AI Native Workflows", description: "Ship faster using AI tools without sacrificing design quality." },
];

export const MENTORS = [
  { name: "Dan Mall", role: "Design Systems Lead", company: "SuperFriendly", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { name: "Grace Walker", role: "Principal Designer", company: "Studio Craft", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { name: "Femi Manuel", role: "Brand Architect", company: "Vanguard", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { name: "Molly Hellmuth", role: "Figma Specialist", company: "Design System University", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
];

export const TESTIMONIALS = [
  { text: "The live critiques alone paid for the year. I ship twice as fast now.", author: "Ana R., Product Designer" },
  { text: "Best design community on the internet, and it's not even close.", author: "Kyle B., Founder" },
  { text: "I stopped guessing at type and spacing. It's all systems now.", author: "Marco T., Design Lead" },
];

export const PRICING = {
  name: "Pro Membership",
  price: "$49",
  period: "/month",
  features: [
    "Full access to 30+ lessons & video courses",
    "Weekly live workshops & Q&A sessions",
    "10,000+ designer community access",
    "Portfolio & component code reviews",
    "Exclusive design system templates",
  ],
};

export const skills = SKILLS;
export const stats = [
  ["30+", "Lessons"],
  ["26+", "Workshops"],
  ["10k+", "Members"],
  ["9+", "Challenges"],
];
export const mentors = MENTORS;
export const quotes = TESTIMONIALS;
export const plans = [
  { name: "Free", price: "$0", featured: false, perks: ["3 starter lessons", "Community read access"] },
  { name: "Pro", price: "$49", featured: true, perks: PRICING.features },
];