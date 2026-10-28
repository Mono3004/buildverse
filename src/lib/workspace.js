const API_BASE = "http://localhost:5000/api/v1";

const LOCAL_STORAGE_PROJECTS_KEY = "buildverse_custom_projects";
const LOCAL_STORAGE_ISSUES_KEY = "buildverse_custom_issues";
const LOCAL_STORAGE_COURSES_KEY = "buildverse_custom_courses";
const LOCAL_STORAGE_ENROLLED_KEY = "buildverse_enrolled_courses";

// Helper Functions
function getLocalProjects() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProjects(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(list));
  } catch {
    /* fallback */
  }
}

function getLocalIssues() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ISSUES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalIssues(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ISSUES_KEY, JSON.stringify(list));
  } catch {
    /* fallback */
  }
}

function getLocalCourses() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCourses(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_COURSES_KEY, JSON.stringify(list));
  } catch {
    /* fallback */
  }
}

function getEnrolledIds() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ENROLLED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEnrolledIds(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ENROLLED_KEY, JSON.stringify(ids));
  } catch {
    /* fallback */
  }
}

// PROJECTS CRUD (CONNECTED TO MONGODB)
export async function fetchProjects(_userId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/projects`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((p) => ({
          id: p._id || p.id,
          name: p.name,
          description: p.description || "",
          tag: p.tag || "Active",
          progress: p.progress || 0,
          status: p.status || "active",
          created_at: p.createdAt || p.created_at || new Date().toISOString(),
        }));
        saveLocalProjects(mapped);
        return mapped;
      }
    }
  } catch {
    /* Fallback to local storage if API temporarily disconnected */
  }

  return getLocalProjects();
}

export async function createProject(_userId, input) {
  let createdProject = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        createdProject = {
          id: p._id || p.id,
          name: p.name,
          description: p.description,
          tag: p.tag || input.tag || "Active",
          progress: p.progress || input.progress || 0,
          status: p.status || "active",
          created_at: p.createdAt || new Date().toISOString(),
        };
      }
    }
  } catch {
    /* Silent fallback */
  }

  if (!createdProject) {
    createdProject = {
      id: `p_${Date.now()}`,
      name: input.name,
      description: input.description || "New workspace project",
      tag: input.tag || "Active",
      progress: input.progress || 0,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }

  const currentLocal = getLocalProjects();
  const updatedLocal = [createdProject, ...currentLocal.filter((p) => p.id !== createdProject?.id)];
  saveLocalProjects(updatedLocal);

  return createdProject;
}

export async function updateProject(id, patch) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    await fetch(`${API_BASE}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    /* Silent fallback */
  }

  const current = getLocalProjects();
  const updated = current.map((p) => (p.id === id ? { ...p, ...patch } : p));
  saveLocalProjects(updated);
}

export async function deleteProject(id) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    await fetch(`${API_BASE}/projects/${id}`, { method: "DELETE", signal: controller.signal });
    clearTimeout(timeoutId);
  } catch {
    /* Silent fallback */
  }

  const current = getLocalProjects();
  const updated = current.filter((p) => p.id !== id);
  saveLocalProjects(updated);
}

// ISSUES / JIRA TICKETS CRUD (CONNECTED TO MONGODB)
export async function fetchIssues(_userId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/issues`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((i) => ({
          id: i._id || i.id,
          project_id: i.projectId || i.project_id,
          title: i.title,
          priority: i.priority || "Medium",
          status: i.status || (i.resolved ? "done" : "todo"),
          assignee: i.assignee || "Elias Thorne",
          resolved: i.resolved || i.status === "done" || false,
          resolved_at: i.resolvedAt || i.resolved_at,
        }));
        saveLocalIssues(mapped);
        return mapped;
      }
    }
  } catch {
    /* Fallback */
  }

  return getLocalIssues();
}

export async function createIssue(_userId, input) {
  let created = null;
  const isDone = input.status === "done";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        priority: input.priority || "Medium",
        projectId: input.project_id || null,
        status: input.status || "todo",
        assignee: input.assignee || "Elias Thorne",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const i = json.data;
        created = {
          id: i._id || i.id,
          project_id: i.projectId,
          title: i.title,
          priority: i.priority || "Medium",
          status: i.status || "todo",
          assignee: i.assignee || "Elias Thorne",
          resolved: i.resolved || isDone,
          resolved_at: i.resolvedAt,
        };
      }
    }
  } catch {
    /* Silent fallback */
  }

  if (!created) {
    created = {
      id: `i_${Date.now()}`,
      project_id: input.project_id || null,
      title: input.title,
      priority: input.priority || "Medium",
      status: input.status || "todo",
      assignee: input.assignee || "Elias Thorne",
      resolved: isDone,
      resolved_at: isDone ? new Date().toISOString() : null,
    };
  }

  const currentLocal = getLocalIssues();
  saveLocalIssues([created, ...currentLocal]);

  return created;
}

export async function updateIssueStatus(id, nextStatus) {
  const isDone = nextStatus === "done";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    await fetch(`${API_BASE}/issues/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, resolved: isDone }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch {
    /* Silent fallback */
  }

  const current = getLocalIssues();
  const updated = current.map((i) =>
    i.id === id ? { ...i, status: nextStatus, resolved: isDone, resolved_at: isDone ? new Date().toISOString() : null } : i
  );
  saveLocalIssues(updated);
}

export async function setIssueResolved(id, resolved) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    await fetch(`${API_BASE}/issues/${id}/toggle`, { method: "PATCH", signal: controller.signal });
    clearTimeout(timeoutId);
  } catch {
    /* Silent fallback */
  }

  const current = getLocalIssues();
  const updated = current.map((i) =>
    i.id === id
      ? {
          ...i,
          resolved,
          status: resolved ? "done" : "todo",
          resolved_at: resolved ? new Date().toISOString() : null,
        }
      : i
  );
  saveLocalIssues(updated);

  return new Date().toISOString();
}

export async function deleteIssue(id) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    await fetch(`${API_BASE}/issues/${id}`, { method: "DELETE", signal: controller.signal });
    clearTimeout(timeoutId);
  } catch {
    /* Silent fallback */
  }

  const current = getLocalIssues();
  saveLocalIssues(current.filter((i) => i.id !== id));
}

// COURSES CRUD (CONNECTED TO MONGODB)
export async function fetchCourses() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/courses`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);
      if (rawList && rawList.length > 0) {
        const enrolledIds = getEnrolledIds();
        const mapped = rawList.map((c) => ({
          id: c._id || c.id,
          title: c.title,
          slug: c.slug || c.title.toLowerCase().replace(/\s+/g, "-"),
          level: c.level || "Core",
          summary: c.summary || "",
          lessonsCount: c.lessons?.length || 1,
          mentor: c.mentor || "BuildVerse Staff",
          videoUrl: c.videoUrl || "https://www.youtube.com/embed/g2nMKzhkvxA",
          lessons: c.lessons || [],
          certificateEarned: c.certificateEarned || false,
          isEnrolled: enrolledIds.includes(c._id || c.id),
        }));
        saveLocalCourses(mapped);
        return mapped;
      }
    }
  } catch {
    /* Fallback */
  }

  return getLocalCourses();
}

export async function fetchEnrolledCourses() {
  const all = await fetchCourses();
  return all.filter((c) => c.isEnrolled);
}

export async function toggleCourseEnrollment(courseId) {
  const currentEnrolled = getEnrolledIds();
  const exists = currentEnrolled.includes(courseId);
  const updatedEnrolled = exists ? currentEnrolled.filter((id) => id !== courseId) : [...currentEnrolled, courseId];
  saveEnrolledIds(updatedEnrolled);
  return fetchCourses();
}

export async function createCourse(input) {
  let created = null;
  const slug = input.title.toLowerCase().replace(/\s+/g, "-");
  const defaultVideo = input.videoUrl || "https://www.youtube.com/embed/g2nMKzhkvxA";

  const newCourse = {
    title: input.title,
    slug,
    level: input.level || "Core",
    summary: input.summary || "Mastering advanced engineering architecture.",
    lessonsCount: 2,
    mentor: input.mentor || "Elias Thorne",
    videoUrl: defaultVideo,
    lessons: [
      { title: "01. Architecture Overview & Core Setup", duration: "15:00", videoUrl: defaultVideo, completed: false },
      { title: "02. Advanced Implementation & Deployment", duration: "20:00", videoUrl: defaultVideo, completed: false },
    ],
    certificateEarned: false,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${API_BASE}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        created = {
          ...json.data,
          id: json.data._id || json.data.id,
          isEnrolled: true,
        };
      }
    }
  } catch {
    /* Silent fallback */
  }

  if (!created) {
    created = {
      id: `c_${Date.now()}`,
      ...newCourse,
      isEnrolled: true,
    };
  }

  const currentLocal = getLocalCourses();
  saveLocalCourses([created, ...currentLocal]);

  const enrolledIds = getEnrolledIds();
  saveEnrolledIds([...enrolledIds, created.id]);

  return created;
}

export async function toggleLessonCompleted(courseId, lessonId) {
  const current = getLocalCourses();
  let targetCourse = null;
  const updatedCourses = current.map((c) => {
    if (c.id === courseId) {
      const updatedLessons = (c.lessons || []).map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l));
      const allDone = updatedLessons.length > 0 && updatedLessons.every((l) => l.completed);
      targetCourse = {
        ...c,
        lessons: updatedLessons,
        certificateEarned: allDone,
      };
      return targetCourse;
    }
    return c;
  });

  saveLocalCourses(updatedCourses);
  return targetCourse;
}

export async function deleteCourse(id) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    await fetch(`${API_BASE}/courses/${id}`, { method: "DELETE", signal: controller.signal });
    clearTimeout(timeoutId);
  } catch {
    /* Silent fallback */
  }

  const current = getLocalCourses();
  saveLocalCourses(current.filter((c) => c.id !== id));
}

// USERS CRUD (FOR ADMIN CONSOLE)
export async function fetchUsersApi(role = "all") {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const url = role === "all" ? `${API_BASE}/users` : `${API_BASE}/users?role=${role}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    /* Fallback */
  }
  return [];
}

export async function createUserApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function updateUserRoleApi(id, role) {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function deleteUserApi(id) {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchMentorMentees() {
  try {
    const res = await fetch(`${API_BASE}/mentorship/mentees`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    }
  } catch {
    /* Fallback */
  }
  return [];
}

export async function fetchMentorReviews(userId) {
  try {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const token = typeof window !== "undefined" ? localStorage.getItem("nexus_auth_token") : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_BASE}/mentorship/reviews${params}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    }
  } catch {
    /* Fallback */
  }
  return [];
}

export async function createMentorReview(payload) {
  try {
    const res = await fetch(`${API_BASE}/mentorship/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function approveMentorReview(id) {
  try {
    const res = await fetch(`${API_BASE}/mentorship/reviews/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Approved" }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function updateMentorReviewStatus(id, status) {
  try {
    const res = await fetch(`${API_BASE}/mentorship/reviews/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function setMentorReviewQuery(id, query) {
  try {
    const res = await fetch(`${API_BASE}/mentorship/reviews/${id}/query`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function addMentorReviewComment(id, { author, text, isMentor = true }) {
  try {
    const res = await fetch(`${API_BASE}/mentorship/reviews/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, text, isMentor }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function rateMentorReview(id, rating) {
  try {
    const res = await fetch(`${API_BASE}/mentorship/reviews/${id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

// USER PROFILE & LEADERBOARD (MONGODB)
export async function fetchUserProfile(emailOrId) {
  try {
    const query = emailOrId ? `?email=${encodeURIComponent(emailOrId)}` : "";
    const res = await fetch(`${API_BASE}/users/profile${query}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function updateUserProfile(payload) {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch {
    /* Fallback */
  }
  return null;
}

export async function changeUserPassword(payload) {
  try {
    const res = await fetch(`${API_BASE}/users/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/users/leaderboard`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) return json.data;
    }
  } catch {
    /* Fallback */
  }
  return [];
}


// GROUP MEMBERSHIPS (MongoDB-backed with localStorage fallback)
const LOCAL_STORAGE_MEMBERSHIPS_KEY = "buildverse_group_memberships";

function getLocalMemberships(userId) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_MEMBERSHIPS_KEY}_${userId || "guest"}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMemberships(userId, list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_MEMBERSHIPS_KEY}_${userId || "guest"}`, JSON.stringify(list));
  } catch {
    /* fallback */
  }
}

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("nexus_auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchMemberships(userId) {
  try {
    const res = await fetch(`${API_BASE}/groups/${userId}/memberships`, {
      headers: getAuthHeader(),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        saveLocalMemberships(userId, json.data);
        return json.data;
      }
    }
  } catch {
    /* Fallback */
  }
  return getLocalMemberships(userId);
}

export async function joinGroup(userId, groupKey, groupName) {
  const entry = {
    group_key: groupKey,
    group_name: groupName,
    joined_at: new Date().toISOString(),
  };
  // Optimistic local update
  const current = getLocalMemberships(userId);
  if (!current.some((m) => m.group_key === groupKey)) {
    saveLocalMemberships(userId, [...current, entry]);
  }
  try {
    const res = await fetch(`${API_BASE}/groups/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ userId, groupKey, groupName }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch {
    /* Fallback to local */
  }
  return entry;
}

export async function leaveGroup(userId, groupKey) {
  const current = getLocalMemberships(userId);
  const updated = current.filter((m) => m.group_key !== groupKey && m.group_name !== groupKey);
  saveLocalMemberships(userId, updated);
  try {
    await fetch(`${API_BASE}/groups/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ userId, groupKey }),
    });
  } catch {
    /* Silent */
  }
  return true;
}

const LOCAL_STORAGE_CHANNELS_KEY = "buildverse_custom_channels";

export function getCustomChannels() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHANNELS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomChannels(list) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CHANNELS_KEY, JSON.stringify(list));
  } catch {}
}

export function createCustomChannel(name) {
  const clean = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
  if (!clean) return null;
  const list = getCustomChannels();
  if (!list.includes(clean)) {
    const updated = [...list, clean];
    saveCustomChannels(updated);
    return clean;
  }
  return clean;
}

export async function fetchWorkspaceUsers() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE}/users`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch {
    /* fallback */
  }
  return [];
}

