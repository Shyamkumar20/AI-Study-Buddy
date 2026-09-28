import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { materialService } from "../services/materialService";
import { EmptyState } from "../components/EmptyState";
import {
  CalendarDays,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  Calendar,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const StudyPlan = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    searchParams.get("material") || ""
  );
  const [days, setDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [goal, setGoal] = useState("Thoroughly understand and prepare for exams");
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setFetchingMaterials(true);
        const data = await materialService.getMaterials();
        setMaterials(data || []);
        if (!selectedMaterialId && data && data.length > 0) {
          setSelectedMaterialId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      } finally {
        setFetchingMaterials(false);
      }
    };
    loadMaterials();
  }, []);

  // When material selected, check if it already has a study plan
  useEffect(() => {
    if (!selectedMaterialId) return;
    const checkExistingPlan = async () => {
      try {
        const mat = await materialService.getMaterial(selectedMaterialId);
        if (mat?.studyPlan) {
          setStudyPlan(mat.studyPlan);
        } else {
          setStudyPlan("");
        }
      } catch (err) {
        console.error("Failed to fetch material details:", err);
      }
    };
    checkExistingPlan();
  }, [selectedMaterialId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId) return;

    setLoading(true);
    try {
      const res = await materialService.generateStudyPlan(selectedMaterialId, {
        days,
        hoursPerDay,
        goal,
      });
      setStudyPlan(res.studyPlan);
    } catch (err) {
      alert("Failed to generate plan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Smart Study Plan</h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate an intelligent, day-by-day learning schedule tailored to your available time
        </p>
      </div>

      {fetchingMaterials ? (
        <div className="p-12 text-center text-slate-400">Loading your materials...</div>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No materials uploaded yet"
          description="Upload a study document first to generate a structured timeline."
          actionText="Upload Study Document"
          actionLink="/materials"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6 h-fit">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Plan Parameters</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Study Material
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {materials.map((mat) => (
                    <option key={mat._id} value={mat._id}>
                      {mat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Primary Learning Goal
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master core concepts before test"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Completion Target</span>
                  <span className="text-indigo-400 font-bold">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>3 days (Sprint)</span>
                  <span>14 days</span>
                  <span>30 days (In-depth)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Daily Study Time</span>
                  <span className="text-indigo-400 font-bold">{hoursPerDay} Hours / Day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>1 hr</span>
                  <span>4 hrs</span>
                  <span>8 hrs</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Gemini is Crafting Schedule...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4" />
                    <span>Generate AI Schedule</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column (2 cols): Timeline / Day View */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80">
            <h2 className="text-base font-bold text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>Your Day-by-Day Timeline</span>
              </span>
              {studyPlan && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ready to follow
                </span>
              )}
            </h2>

            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mx-auto" />
                <p className="text-sm text-slate-300 font-medium">
                  Optimizing study order, breakdown, and milestones with Gemini AI...
                </p>
              </div>
            ) : studyPlan ? (
              <div className="space-y-6">
                <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap p-6 rounded-2xl bg-slate-950/70 border border-slate-800">
                  {studyPlan}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-500">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                <p className="text-sm font-medium text-slate-400">No schedule generated yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust parameters on the left and click "Generate AI Schedule".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
