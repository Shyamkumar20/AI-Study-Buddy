import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../services/userService";
import { quizService } from "../services/quizService";
import { SkeletonCard, SkeletonList } from "../components/SkeletonLoader";
import {
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const Progress = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, histData] = await Promise.all([
          userService.getStats(),
          quizService.getHistory(),
        ]);
        setStats(statsData);
        setHistory(histData || []);
      } catch (err) {
        console.error("Failed to load progress data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tiers = [
    { name: "Beginner", threshold: "Start journey" },
    { name: "Basic", threshold: "2+ tasks completed" },
    { name: "Intermediate", threshold: "7+ tasks completed" },
    { name: "Advanced", threshold: "15+ tasks & 75%+ quiz" },
    { name: "Mastery", threshold: "25+ tasks & 80%+ quiz" },
  ];

  const currentTierIndex = tiers.findIndex(
    (t) => t.name.toLowerCase() === (stats?.masteryTier || "beginner").toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Study Progress & Mastery</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track your retention metrics, streak consistency, and tier progression
        </p>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          {/* Streak & Tier Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900/80 to-indigo-950/40 border border-orange-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="w-9 h-9 fill-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {stats?.streak || 1} Days
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">
                    Active Streak 🔥
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  You've maintained study consistency. Target: {stats?.studyGoalHours || 2} hours daily.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-right md:text-left shrink-0">
              <p className="text-xs text-slate-400 font-medium">Current Mastery Level</p>
              <p className="text-xl font-bold text-amber-300 flex items-center gap-2 mt-0.5">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{stats?.masteryTier || "Beginner"}</span>
              </p>
            </div>
          </div>

          {/* Mastery Tiers Progression */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <h2 className="text-base font-bold text-white">Mastery Pathway</h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {tiers.map((tier, idx) => {
                const isUnlocked = idx <= currentTierIndex;
                const isCurrent = idx === currentTierIndex;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : isUnlocked
                        ? "border-indigo-500/40 bg-indigo-500/5 text-slate-300"
                        : "border-slate-800/60 bg-slate-950/40 opacity-40 text-slate-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{tier.name}</span>
                      {isUnlocked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{tier.threshold}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Total Materials</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.totalMaterials || 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Uploaded documents</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Tasks Completed</span>
              <p className="text-2xl font-bold text-white mt-1">
                {stats?.completedTasks || 0} / {stats?.totalTasks || 0}
              </p>
              <p className="text-[11px] text-indigo-400 mt-1">
                {stats?.taskCompletionRate || 0}% completion rate
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Quizzes Taken</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.totalQuizzes || 0}</p>
              <p className="text-[11px] text-slate-500 mt-1">Assessments graded</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs text-slate-400">Average Quiz Score</span>
              <p className="text-2xl font-bold text-white mt-1">{stats?.averageQuizScore || 0}%</p>
              <p className="text-[11px] text-emerald-400 mt-1">Recall accuracy</p>
            </div>
          </div>

          {/* Quiz Attempt History */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Recent Quiz Attempts</h2>
              <Link to="/quizzes" className="text-xs text-indigo-400 hover:underline font-semibold">
                Start new quiz →
              </Link>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No quiz attempts yet. Complete a quiz to view your score trends.
              </p>
            ) : (
              <div className="space-y-3">
                {history.map((att) => (
                  <div
                    key={att._id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {att.material?.title || "Study Material"}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Completed on {new Date(att.createdAt).toLocaleDateString()} •{" "}
                        {att.score}/{att.totalQuestions} correct
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-bold ${
                          att.percentage >= 80
                            ? "text-emerald-400"
                            : att.percentage >= 60
                            ? "text-indigo-400"
                            : "text-amber-400"
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
