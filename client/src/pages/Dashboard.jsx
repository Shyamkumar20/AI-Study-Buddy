import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { taskService } from "../services/taskService";
import { SkeletonCard, SkeletonList } from "../components/SkeletonLoader";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  PlusCircle,
  HelpCircle,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData] = await Promise.all([
        userService.getStats(),
        taskService.getTasks(),
      ]);
      setStats(statsData);
      setTodayTasks(tasksData.slice(0, 4));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const updated = await taskService.updateTask(taskId, {
        completed: !currentCompleted,
      });

      // Confetti burst on task completion
      if (!currentCompleted) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      setTodayTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: updated.completed } : t))
      );

      // Refresh stats
      const newStats = await userService.getStats();
      setStats(newStats);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900/90 border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">
              <span>{currentDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                {stats?.streak || user?.streak || 1} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Student"} 👋
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-xl">
              You are on track for today's study goal. Review your materials and test your recall with AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/materials"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Material</span>
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700/60 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* Ambient glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Overview Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Task Completion</span>
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stats?.taskCompletionRate || 0}%
              </span>
              <span className="text-xs text-slate-400">
                ({stats?.completedTasks || 0}/{stats?.totalTasks || 0})
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${stats?.taskCompletionRate || 0}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Quiz Accuracy</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stats?.averageQuizScore || 0}%
              </span>
              <span className="text-xs text-slate-400">
                ({stats?.totalQuizzes || 0} taken)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${stats?.averageQuizScore || 0}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Study Materials</span>
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">
                {stats?.totalMaterials || 0}
              </span>
              <span className="text-xs text-slate-400">documents</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Ready for AI analysis</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Mastery Level</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-amber-300">
                {stats?.masteryTier || "Beginner"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Progresses with completed tasks</p>
          </div>
        </div>
      )}

      {/* Main Grid: Today's Learning & Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Today's Learning Tasks</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {todayTasks.filter((t) => !t.completed).length} pending
              </span>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all tasks <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : todayTasks.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No tasks pending for today!</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Upload a document to automatically break it down into learning steps.
              </p>
              <Link
                to="/materials"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium"
              >
                Go to Materials
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    task.completed
                      ? "bg-slate-900/30 border-slate-800/40 text-slate-500"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task._id, task.completed)}
                      className="shrink-0 p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.completed ? "line-through text-slate-500" : "text-white"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes || 25} min
                        </span>
                        <span>•</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                            task.difficulty === "Beginner"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : task.difficulty === "Advanced"
                              ? "bg-purple-500/10 text-purple-400"
                              : "bg-indigo-500/10 text-indigo-400"
                          }`}
                        >
                          {task.difficulty || "Intermediate"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task._id, task.completed)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      task.completed
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                    }`}
                  >
                    {task.completed ? "Done" : "Complete"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Continue Learning & Weak Topics */}
        <div className="space-y-6">
          {/* Continue Learning Card */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-base font-bold text-white mb-4">Continue Learning</h2>
            {stats?.recentMaterial ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white line-clamp-1">
                    {stats.recentMaterial.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {stats.recentMaterial.summary
                      ? "AI Summary ready"
                      : "Ready for flashcards & quizzes"}
                  </p>
                </div>

                <Link
                  to={`/materials/${stats.recentMaterial._id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  <span>Resume Study Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs">No active study materials</p>
                <Link
                  to="/materials"
                  className="mt-3 inline-block text-xs font-semibold text-indigo-400 hover:underline"
                >
                  Upload your first file
                </Link>
              </div>
            )}
          </div>

          {/* Weak Topics Analysis */}
          {stats?.weakTopics && stats.weakTopics.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center gap-2 mb-3 text-amber-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-sm font-bold">Review Weak Topics</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Identified from recent quiz answers:
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.weakTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
