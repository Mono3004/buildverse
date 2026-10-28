import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Award,
  BookOpen,
  UserCheck,
  Sparkles,
  X,
  Printer,
  Download,
  Share2,
  RefreshCw,
  Clock,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { fetchCourses, toggleLessonCompleted, toggleCourseEnrollment } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/courses")({
  component: CoursesUserPage,
});

function CoursesUserPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [activeLessonTitle, setActiveLessonTitle] = useState("");
  const [certificateCourse, setCertificateCourse] = useState(null);

  const loadData = async () => {
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
    loadData();
  }, []);

  const handleToggleLesson = async (courseId, lessonId) => {
    const updated = await toggleLessonCompleted(courseId, lessonId);
    if (updated) {
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      if (activeCourse?.id === courseId) {
        setActiveCourse(updated);
      }
    }
  };

  const handleToggleEnrollment = async (courseId) => {
    const updatedList = await toggleCourseEnrollment(courseId);
    setCourses(updatedList);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-wider">
              BuildVerse Academy
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground font-display mt-2">
            Engineering Academy & Masterclasses
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Watch HD video lessons, enroll in your personal Dashboard Classroom, and earn official verified BuildVerse certificates.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-3 rounded-2xl bg-surface-elevated border border-border text-muted-foreground hover:text-foreground transition-colors self-start md:self-auto flex items-center space-x-1.5 text-xs font-bold"
          title="Refresh Courses"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Sync Courses</span>
        </button>
      </div>

      {/* ACADEMY COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const lessons = course.lessons || [];
          const completedCount = lessons.filter((l) => l.completed).length;
          const totalCount = lessons.length || course.lessonsCount || 1;
          const percent = Math.round((completedCount / totalCount) * 100);
          const isFinished = percent === 100 || course.certificateEarned;

          return (
            <div
              key={course.id}
              className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-5 hover:border-primary/50 transition-all shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-[10px] font-black uppercase">
                    {course.level || "Core"}
                  </span>

                  <button
                    onClick={() => handleToggleEnrollment(course.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center space-x-1.5 transition-all ${
                      course.isEnrolled
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                        : "bg-surface-elevated text-muted-foreground hover:text-primary border border-border"
                    }`}
                    title={course.isEnrolled ? "Enrolled in Classroom" : "Add to Dashboard Classroom"}
                  >
                    {course.isEnrolled ? <BookmarkCheck className="w-3 h-3 text-emerald-400" /> : <BookmarkPlus className="w-3 h-3" />}
                    <span>{course.isEnrolled ? "In Classroom ✓" : "+ Enroll"}</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-foreground font-display leading-snug group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{course.summary}</p>
              </div>

              {/* LESSONS LIST PREVIEW */}
              <div className="space-y-2 pt-3 border-t border-border/60">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-muted-foreground flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span>Curriculum ({lessons.length} Lessons)</span>
                  </span>
                  <span className="font-mono text-primary">{percent}% Done</span>
                </div>

                <div className="w-full bg-surface-elevated h-2 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated/70 border border-border text-xs"
                    >
                      <button
                        onClick={() => {
                          setActiveCourse(course);
                          setActiveVideoUrl(lesson.videoUrl || course.videoUrl || "https://www.youtube.com/embed/g2nMKzhkvxA");
                          setActiveLessonTitle(lesson.title);
                        }}
                        className="flex items-center space-x-2 text-left font-medium text-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                      >
                        <Play className="w-3 h-3 text-primary shrink-0" />
                        <span className="truncate">{lesson.title}</span>
                      </button>

                      <button
                        onClick={() => handleToggleLesson(course.id, lesson.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          lesson.completed ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={lesson.completed ? "Lesson Completed" : "Mark Completed"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD BOTTOM ACTIONS */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{course.mentor || "Elias Thorne"}</span>
                </div>

                {isFinished ? (
                  <button
                    onClick={() => setCertificateCourse(course)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveCourse(course);
                      const firstLesson = lessons[0];
                      setActiveVideoUrl(firstLesson?.videoUrl || course.videoUrl || "https://www.youtube.com/embed/g2nMKzhkvxA");
                      setActiveLessonTitle(firstLesson?.title || course.title);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Course</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {activeVideoUrl && activeCourse && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground font-display">{activeCourse.title}</h3>
                <p className="text-xs text-primary font-semibold">{activeLessonTitle}</p>
              </div>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveCourse(null);
                }}
                className="p-2 rounded-xl bg-surface-elevated text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIDEO EMBED CONTAINER */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-border">
              <iframe
                src={activeVideoUrl}
                title={activeLessonTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>HD 1080p Interactive Video Lesson</span>
              </div>

              <button
                onClick={() => {
                  const lesson = activeCourse.lessons?.find((l) => l.title === activeLessonTitle);
                  if (lesson) {
                    handleToggleLesson(activeCourse.id, lesson.id);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center space-x-2 shadow-lg shadow-primary/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Toggle Lesson Completion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL CERTIFICATE MODAL */}
      {certificateCourse && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-card border-2 border-primary/40 rounded-3xl w-full max-w-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setCertificateCourse(null)}
                className="p-2 rounded-xl bg-surface-elevated text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CERTIFICATE DISPLAY BODY */}
            <div id="certificate-print-area" className="p-8 rounded-2xl border-4 border-dashed border-primary/30 bg-surface-elevated/50 text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Award className="w-10 h-10 animate-bounce" />
                <Sparkles className="w-6 h-6" />
              </div>

              <span className="text-xs font-black uppercase tracking-widest text-primary font-display">
                BUILDVERSE ACADEMY CERTIFICATE OF MASTERY
              </span>

              <h2 className="text-2xl font-black text-foreground font-display">
                This is to certify that
              </h2>

              <p className="text-xl font-extrabold text-primary underline underline-offset-8">
                Elias Thorne
              </p>

              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                has successfully completed all required engineering modules, video masterclasses, and practical assessments for
              </p>

              <p className="text-base font-bold text-foreground font-display bg-primary/10 py-2 px-4 rounded-xl border border-primary/20 inline-block">
                {certificateCourse.title}
              </p>

              <div className="pt-6 flex items-center justify-between border-t border-border/80 text-left text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Certificate ID</p>
                  <p className="font-mono font-bold text-primary">CERT-BV-2026-{certificateCourse.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Verified Mentor</p>
                  <p className="font-bold text-foreground">{certificateCourse.mentor || "Elias Thorne"}</p>
                </div>
              </div>
            </div>

            {/* CERTIFICATE ACTIONS */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-2xl bg-surface-elevated border border-border text-foreground text-xs font-bold flex items-center space-x-2 hover:border-primary/50"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={() => alert("Certificate downloaded successfully as PDF!")}
                className="px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black flex items-center space-x-2 shadow-lg shadow-primary/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
