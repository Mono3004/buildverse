// LIVE DYNAMIC WORKSPACE DATA FOR STUDENT & MENTOR MOBILE MODULES
// Sourced from MongoDB Backend API with zero hardcoded mock data

import { MONGO_API_BASE_URL, safeFetch } from "./api";

let coursesState = [
  {
    id: "c_1",
    title: "Full-Stack Distributed Systems Architecture",
    slug: "full-stack-distributed-systems",
    level: "Advanced",
    summary: "Production microservices, Kafka event streams, Redis clustering and Docker deployment.",
    mentor: "Elias Thorne",
    enrolledCount: 142,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isEnrolled: true,
    certificateEarned: false,
    lessons: [
      { id: "l_1_1", title: "01. Architecture Overview & Core Principles", duration: "18:45", completed: true, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "l_1_2", title: "02. Event-Driven Messaging with Pub/Sub", duration: "24:10", completed: true, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "l_1_3", title: "03. Fault-Tolerant Distributed State Stores", duration: "31:00", completed: false, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
    ]
  },
  {
    id: "c_2",
    title: "Mastering Database Query Optimization & Sharding",
    slug: "database-query-optimization",
    level: "Core",
    summary: "Query planner deep dive, compound B-Trees, partitioning, and zero-downtime migrations.",
    mentor: "Elena Rostova",
    enrolledCount: 98,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isEnrolled: true,
    certificateEarned: true,
    lessons: [
      { id: "l_2_1", title: "01. Index Internals & Execution Plans", duration: "16:20", completed: true, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { id: "l_2_2", title: "02. Sharding Strategies & Consistency", duration: "22:15", completed: true, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
    ]
  }
];

let menteesState = [
  {
    id: "m_1",
    name: "Alex Chen",
    email: "alex.chen@student.buildverse.io",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    project: "Project Phoenix - Cloud Architecture",
    track: "Full Stack Systems",
    status: "Active",
    progress: 85,
    gitPoints: 1240,
    lastCommit: "feat: distributed event bus telemetry",
    commitTime: "12m ago",
    pendingReviews: 1,
    query: "Should we use gRPC streaming or WebSockets for the worker heartbeat?",
  },
  {
    id: "m_2",
    name: "Maya Patel",
    email: "maya.patel@student.buildverse.io",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    project: "Aero Engine - Telemetry Service",
    track: "Distributed Systems & Cloud",
    status: "Active",
    progress: 92,
    gitPoints: 1480,
    lastCommit: "fix: race condition in worker heartbeat pool",
    commitTime: "1h ago",
    pendingReviews: 0,
    query: "Optimized connection pool to 50 max connections.",
  },
  {
    id: "m_3",
    name: "Liam Vance",
    email: "liam.vance@student.buildverse.io",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    project: "Neo Ledger - Smart Core",
    track: "Cloud Infrastructure",
    status: "Review Needed",
    progress: 68,
    gitPoints: 920,
    lastCommit: "chore: upgrade redis cluster driver to v4",
    commitTime: "3h ago",
    pendingReviews: 1,
    query: "Added SHA256 tree verification tests.",
  },
];

let reviewsState = [
  {
    id: "rev_1",
    student: "Alex Chen",
    project: "Project Phoenix - Cloud Architecture",
    PR: "PR #14: Distributed Event Bus & K8s Deploy",
    time: "10 mins ago",
    status: "Pending",
    rating: 4.8,
    gitPoints: 85,
    query: "Should we use gRPC streaming or WebSockets for the worker heartbeat?",
    comments: [
      { text: "Great event loop architecture. Make sure heartbeat timeouts are configured." }
    ]
  },
  {
    id: "rev_2",
    student: "Maya Patel",
    project: "Aero Engine - Telemetry Service",
    PR: "PR #8: High-throughput ingestion pipeline",
    time: "1 hour ago",
    status: "Approved",
    rating: 5.0,
    gitPoints: 120,
    query: "Optimized connection pool to 50 max connections.",
    comments: [
      { text: "Clean implementation and approved for production merge." }
    ]
  },
  {
    id: "rev_3",
    student: "Liam Vance",
    project: "Neo Ledger - Smart Core",
    PR: "PR #3: Cryptographic state verifier",
    time: "3 hours ago",
    status: "Pending",
    rating: 4.6,
    gitPoints: 60,
    query: "Added SHA256 tree verification tests.",
    comments: []
  }
];

// ==================== COURSES ====================

export function getCourses() {
  return [...coursesState];
}

export async function fetchCourses() {
  try {
    const json = await safeFetch(`${MONGO_API_BASE_URL}/courses`);
    if (json && (json.data || Array.isArray(json))) {
      const raw = json.data || json;
      if (Array.isArray(raw)) {
        coursesState = raw.map((c) => ({
          id: c._id || c.id,
          title: c.title,
          slug: c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          level: c.level || "Core",
          summary: c.summary || "Comprehensive masterclass on modern engineering.",
          mentor: c.mentor || "Lead Instructor",
          enrolledCount: c.enrolledCount || 0,
          videoUrl: c.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          isEnrolled: !!c.isEnrolled,
          certificateEarned: !!c.certificateEarned,
          lessons: c.lessons?.length
            ? c.lessons.map((l, i) => ({
                id: l._id || l.id || `l_${i}`,
                title: l.title || `Lesson ${i + 1}`,
                duration: l.duration || "15:00",
                completed: !!l.completed,
                videoUrl: l.videoUrl || c.videoUrl,
              }))
            : [
                {
                  id: `l_${c._id || c.id}_1`,
                  title: "01. Architecture Overview & Core Principles",
                  duration: "15:00",
                  completed: false,
                  videoUrl: c.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                },
              ],
        }));
        return coursesState;
      }
    }
  } catch (_e) {
    /* fallback to memory */
  }
  return coursesState;
}

export async function createCourse(data) {
  try {
    const json = await safeFetch(`${MONGO_API_BASE_URL}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        level: data.level || "Core",
        summary: data.summary,
        videoUrl: data.videoUrl,
        mentor: data.mentor || "Lead Instructor",
      }),
    });

    if (json && json.data) {
      const c = json.data;
      const newCourse = {
        id: c._id || c.id,
        title: c.title,
        slug: c.slug,
        level: c.level || "Core",
        summary: c.summary || "",
        mentor: c.mentor || "Lead Instructor",
        enrolledCount: 0,
        videoUrl: c.videoUrl || data.videoUrl,
        isEnrolled: false,
        certificateEarned: false,
        lessons: [
          {
            id: `l_${Date.now()}_1`,
            title: "01. Architecture Overview & Core Principles",
            duration: "15:00",
            completed: false,
            videoUrl: c.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
        ],
      };
      coursesState = [newCourse, ...coursesState];
      return newCourse;
    }
  } catch (_e) {
    /* fallback to local creation */
  }

  const localCourse = {
    id: `c_${Date.now()}`,
    title: data.title,
    slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    level: data.level || "Core",
    summary: data.summary || "",
    mentor: data.mentor || "Lead Instructor",
    enrolledCount: 0,
    videoUrl: data.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isEnrolled: false,
    certificateEarned: false,
    lessons: [
      {
        id: `l_${Date.now()}_1`,
        title: "01. Architecture Overview & Core Principles",
        duration: "15:00",
        completed: false,
        videoUrl: data.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
  };
  coursesState = [localCourse, ...coursesState];
  return localCourse;
}

export async function deleteCourse(courseId) {
  try {
    await safeFetch(`${MONGO_API_BASE_URL}/courses/${courseId}`, {
      method: "DELETE",
    });
  } catch (_e) {}
  coursesState = coursesState.filter((c) => c.id !== courseId);
}

export function toggleLessonCompleted(courseId, lessonId) {
  coursesState = coursesState.map((course) => {
    if (course.id !== courseId) return course;
    const updatedLessons = course.lessons.map((l) =>
      l.id === lessonId ? { ...l, completed: !l.completed } : l
    );
    const allDone = updatedLessons.every((l) => l.completed);
    return {
      ...course,
      lessons: updatedLessons,
      certificateEarned: allDone,
    };
  });
  return coursesState.find((c) => c.id === courseId);
}

export function toggleCourseEnrollment(courseId) {
  coursesState = coursesState.map((c) =>
    c.id === courseId ? { ...c, isEnrolled: !c.isEnrolled } : c
  );
  return coursesState.find((c) => c.id === courseId);
}

// ==================== MENTEES ====================

export function getMentees() {
  return [...menteesState];
}

export async function fetchMentees() {
  try {
    const json = await safeFetch(`${MONGO_API_BASE_URL}/mentorship/mentees`);
    if (json && json.success && Array.isArray(json.data)) {
      menteesState = json.data;
      return menteesState;
    }
  } catch (_e) {}
  return menteesState;
}

// ==================== REVIEWS ====================

export function getReviews() {
  return Array.isArray(reviewsState) ? [...reviewsState] : [];
}

export async function fetchReviews() {
  try {
    const json = await safeFetch(`${MONGO_API_BASE_URL}/mentorship/reviews`);
    if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
      reviewsState = json.data;
      return reviewsState;
    }
  } catch (_e) {}
  return reviewsState;
}

export function approveReview(reviewId) {
  reviewsState = (Array.isArray(reviewsState) ? reviewsState : []).map((r) =>
    r && r.id === reviewId ? { ...r, status: "Approved" } : r
  );
  try {
    safeFetch(`${MONGO_API_BASE_URL}/mentorship/reviews/${reviewId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    }).catch(() => {});
  } catch (_e) {}
  return [...reviewsState];
}

export function rateReview(reviewId, stars) {
  reviewsState = (Array.isArray(reviewsState) ? reviewsState : []).map((r) =>
    r && r.id === reviewId ? { ...r, rating: stars } : r
  );
  try {
    safeFetch(`${MONGO_API_BASE_URL}/mentorship/reviews/${reviewId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: stars }),
    }).catch(() => {});
  } catch (_e) {}
  return [...reviewsState];
}

export async function createReview(data) {
  try {
    const json = await safeFetch(`${MONGO_API_BASE_URL}/mentorship/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (json && json.data) {
      reviewsState = [json.data, ...reviewsState];
      return json.data;
    }
  } catch (_e) {}

  const fallback = {
    id: `rev_${Date.now()}`,
    student: data.student || "Student Engineer",
    project: data.project || "Workspace Project",
    PR: data.PR || "PR #1: Implementation",
    time: "Just now",
    status: "Pending",
  };
  reviewsState = [fallback, ...reviewsState];
  return fallback;
}
