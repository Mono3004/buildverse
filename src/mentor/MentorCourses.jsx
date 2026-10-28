import React, { useEffect, useState } from "react";
import { GraduationCap, Plus, BookOpen, Award, Trash2, RefreshCw, Play } from "lucide-react";
import { fetchCourses, createCourse, deleteCourse } from "@/lib/workspace";

export default function MentorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Core");
  const [summary, setSummary] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const loadCourses = async () => {
    try {
      const data = await fetchCourses();
      setCourses(data);
    } catch (e) {
      console.log("Mentor courses load note:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    const interval = setInterval(loadCourses, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const created = await createCourse({
      title: title.trim(),
      level,
      summary: summary.trim() || "Mastering advanced engineering architecture.",
      videoUrl: videoUrl.trim() || undefined,
      mentor: "Elena Rostova (Lead Mentor)",
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-foreground tracking-tight font-display">
              Mentor Academy Course Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
              {courses.length} Live
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create video masterclasses, configure curriculum lessons, and issue student completion diplomas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Masterclass</span>
          </button>

          <button
            onClick={loadCourses}
            className="p-2 rounded-xl bg-[#0E1015] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Courses"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-[#0E1015] border border-white/[0.08] flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/25">
                  {c.level || "Core"}
                </span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-xs font-bold text-foreground mt-2 font-display leading-snug">{c.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{c.summary}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 text-primary" />
                  <span>{c.lessonsCount || (c.lessons?.length || 2)} Video Lessons</span>
                </span>
                <span className="flex items-center space-x-1 text-primary">
                  <Award className="w-3 h-3" />
                  <span>Certificate Enabled</span>
                </span>
              </div>

              {c.videoUrl && (
                <div className="p-1.5 rounded-lg bg-[#141720] border border-white/[0.06] flex items-center space-x-1.5 text-[10px] text-muted-foreground font-mono truncate">
                  <Play className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{c.videoUrl}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD MASTERCLASS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleAddCourse}
            className="bg-[#0E1015] border border-white/[0.08] rounded-2xl p-5 w-full max-w-md space-y-3 shadow-2xl"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground border-b border-white/[0.06] pb-2 font-display">
              Create New Masterclass Course
            </h3>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Full-Stack WebGPU Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Level Tag</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground focus:outline-none focus:border-primary font-bold"
              >
                <option value="Core">Core</option>
                <option value="Advanced">Advanced</option>
                <option value="Mastery">Mastery</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Video Embed URL (YouTube/MP4)</label>
              <input
                type="url"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-muted-foreground mb-1 block">Course Summary</label>
              <textarea
                rows={2}
                placeholder="Key takeaways and curriculum topics..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-xs text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-1.5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-1.5 rounded-xl bg-[#141720] border border-white/[0.08] text-muted-foreground text-xs font-semibold hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-xl bg-primary text-[#08090A] text-xs font-black shadow-sm shadow-primary/20 hover:opacity-90"
              >
                Publish Masterclass →
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
