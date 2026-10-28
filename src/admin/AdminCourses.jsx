import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  Trash2,
  BookOpen,
  Video,
  Award,
  RefreshCw,
  UserCheck,
  Play,
  X,
  Sparkles,
  Search,
} from "lucide-react";
import { fetchCourses, createCourse, deleteCourse } from "@/lib/workspace";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // 'all' | 'mentor' | 'official'
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Core");
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mentorName, setMentorName] = useState("Elena Rostova (Lead Mentor)");

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = await fetchCourses();
      setCourses(list);
    } catch {
      /* fallback */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    const interval = setInterval(loadCourses, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const created = await createCourse({
      title: title.trim(),
      level,
      summary: summary.trim() || "Mastering modern engineering principles.",
      videoUrl: videoUrl.trim() || "https://www.youtube.com/embed/g2nMKzhkvxA",
      mentor: mentorName.trim() || "Elena Rostova (Lead Mentor)",
    });

    setCourses([created, ...courses]);
    setTitle("");
    setSummary("");
    setVideoUrl("");
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    await deleteCourse(id);
    setCourses(courses.filter((c) => c.id !== id));
  };

  const isMentorCourse = (c) => {
    const m = typeof c.mentor === "string" ? c.mentor : c.mentor?.name || "";
    return m.toLowerCase().includes("mentor") || m.toLowerCase().includes("elena") || m.toLowerCase().includes("alex");
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof c.mentor === "string" && c.mentor.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === "mentor") return isMentorCourse(c);
    if (filterType === "official") return !isMentorCourse(c);
    return true;
  });

  const mentorCount = courses.filter(isMentorCourse).length;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground font-display">
              Academy Masterclasses & Curriculum ({courses.length})
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary/15 text-primary border border-primary/30">
              MongoDB Synced
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Admin oversight on mentor-submitted masterclasses, HD video curriculums, and verified course catalogs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadCourses}
            className="p-2.5 rounded-2xl bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1.5 text-xs font-bold"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Masterclass</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center p-1 rounded-2xl bg-surface-elevated border border-border text-xs font-bold">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filterType === "all"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Tracks ({courses.length})
          </button>
          <button
            onClick={() => setFilterType("mentor")}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
              filterType === "mentor"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Mentor Masterclasses ({mentorCount})</span>
          </button>
          <button
            onClick={() => setFilterType("official")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filterType === "official"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Official Core Tracks ({courses.length - mentorCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search masterclasses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-surface-elevated border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* COURSES GRID / EMPTY STATE */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-3 shadow-xl">
          <GraduationCap className="w-12 h-12 text-primary/40 mx-auto" />
          <h3 className="text-base font-bold text-foreground font-display">No Masterclasses in this Filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When mentors publish masterclasses from their module, they appear dynamically here in the admin catalog.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Masterclass</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const mentorTitle =
              typeof course.mentor === "string" ? course.mentor : course.mentor?.name || "Elias Thorne";
            const isMentor = isMentorCourse(course);

            return (
              <div
                key={course.id}
                className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-primary/50 transition-all shadow-xl group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-extrabold uppercase">
                        {course.level || "Core"}
                      </span>

                      {isMentor && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-wider">
                          Mentor Contributed
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-foreground font-display group-hover:text-primary transition-colors flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <span>{course.title}</span>
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{course.summary}</p>
                </div>

                <div className="pt-3 border-t border-border/60 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center space-x-1 font-semibold text-foreground">
                      <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{mentorTitle}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <Award className="w-3 h-3" />
                      <span>{course.lessons?.length || 2} Lessons</span>
                    </span>
                  </div>

                  {course.videoUrl && (
                    <button
                      onClick={() => setPreviewVideoUrl(course.videoUrl)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl bg-surface-elevated border border-border text-sky-400 text-xs font-bold hover:bg-sky-500/10 hover:border-sky-500/30 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch & Preview Video</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-primary/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground font-display flex items-center space-x-2">
                <Video className="w-4 h-4 text-primary" />
                <span>Admin Masterclass Video Player</span>
              </h3>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-border">
              <iframe
                src={previewVideoUrl}
                title="Masterclass Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* CREATE MASTERCLASS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground font-display">Publish New Masterclass</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Systems 2.0 & Token Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Assigned Mentor</label>
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova (Lead Mentor)"
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">HD Video Embed URL</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/embed/g2nMKzhkvxA"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Summary</label>
                <textarea
                  rows={3}
                  placeholder="Brief course overview and curriculum topics..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-11 px-4 rounded-2xl bg-surface-elevated border border-input text-xs text-foreground focus:border-primary outline-none"
                >
                  <option value="Core">Core</option>
                  <option value="Advanced">Advanced</option>
                  <option value="New">New</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-2xl border border-border text-xs font-bold text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-black shadow-lg shadow-primary/20"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
