import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { materialService } from "../services/materialService";
import { SkeletonCard } from "../components/SkeletonLoader";
import {
  Sparkles,
  FileText,
  BookOpen,
  Calendar,
  HelpCircle,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Copy,
  Check,
} from "lucide-react";

export const MaterialDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "summary");

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  // Summary generation state
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const data = await materialService.getMaterial(id);
      setMaterial(data);
    } catch (err) {
      console.error("Failed to load material:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const handleSummarize = async () => {
    setGeneratingSummary(true);
    try {
      const res = await materialService.summarize(id);
      setMaterial((prev) => ({ ...prev, summary: res.summary }));
    } catch (err) {
      alert("Failed to generate summary: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    try {
      const res = await materialService.generateFlashcards(id, flashcardCount);
      setMaterial((prev) => ({ ...prev, flashcards: res.flashcards }));
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      alert("Failed to generate flashcards: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleCopySummary = () => {
    if (!material?.summary) return;
    navigator.clipboard.writeText(material.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Material not found.</p>
        <Link to="/materials" className="text-indigo-400 hover:underline mt-2 inline-block">
          Back to library
        </Link>
      </div>
    );
  }

  const flashcards = material.flashcards || [];

  return (
    <div className="space-y-6">
      {/* Back button & Title header */}
      <div>
        <Link
          to="/materials"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{material.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Source: {material.filename} • Uploaded {new Date(material.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/quizzes?material=${material._id}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Take Quiz</span>
            </Link>
            <Link
              to={`/chat?material=${material._id}`}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI About This</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: "summary", label: "AI Summary", icon: Sparkles },
          { id: "flashcards", label: `Flashcards (${flashcards.length})`, icon: BookOpen },
          { id: "studyPlan", label: "Study Plan", icon: Calendar },
          { id: "content", label: "Original Content", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Summary */}
      {activeTab === "summary" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI Extracted Key Concepts</span>
            </div>
            {material.summary && (
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          {material.summary ? (
            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {material.summary}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400 mb-4">
                No summary generated for this document yet.
              </p>
              <button
                onClick={handleSummarize}
                disabled={generatingSummary}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                {generatingSummary ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Analyzing & Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Summary</span>
                  </>
                )}
              </button>
            </div>
          )}

          {material.summary && (
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSummarize}
                disabled={generatingSummary}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium"
              >
                <RotateCw className={`w-3.5 h-3.5 ${generatingSummary ? "animate-spin" : ""}`} />
                <span>Regenerate Summary</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Flashcards (Interactive 3D Flip Deck) */}
      {activeTab === "flashcards" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">Card Count:</label>
              <select
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="5">5 Cards</option>
                <option value="10">10 Cards</option>
                <option value="15">15 Cards</option>
              </select>
            </div>

            <button
              onClick={handleGenerateFlashcards}
              disabled={generatingFlashcards}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25"
            >
              {generatingFlashcards ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Generating Deck...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{flashcards.length > 0 ? "Regenerate Cards" : "Generate Flashcards"}</span>
                </>
              )}
            </button>
          </div>

          {flashcards.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-slate-900/40 border border-dashed border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">No Flashcards Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                Generate dynamic flashcards to test your memory on the core definitions and concepts.
              </p>
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingFlashcards}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25"
              >
                Generate First Deck
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[280px] sm:min-h-[320px] rounded-3xl p-8 bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-2xl flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/50 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-semibold">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </span>
                  <span className="text-[11px] text-slate-500">Click anywhere to flip</span>
                </div>

                <div className="my-auto text-center py-6">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                        Question
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                        {flashcards[currentCardIndex]?.question}
                      </h3>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                        Answer
                      </span>
                      <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
                        {flashcards[currentCardIndex]?.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center text-xs text-indigo-400 gap-1.5 font-medium">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? "Show Question" : "Reveal Answer"}</span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-slate-400 font-medium">
                  {currentCardIndex + 1} / {flashcards.length}
                </span>

                <button
                  disabled={currentCardIndex === flashcards.length - 1}
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Study Plan */}
      {activeTab === "studyPlan" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Personalized Study Plan</span>
            </h2>
            <Link
              to={`/study-plan?material=${material._id}`}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Configure Parameters →
            </Link>
          </div>

          {material.studyPlan ? (
            <div className="prose prose-invert max-w-none text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
              {material.studyPlan}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400 mb-4">
                No study plan generated for this material yet.
              </p>
              <Link
                to={`/study-plan?material=${material._id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                <Calendar className="w-4 h-4" />
                <span>Create Study Roadmap</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab: Content */}
      {activeTab === "content" && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Full Text Extract</h2>
            <span className="text-xs text-slate-400">
              {(material.content?.length || 0).toLocaleString()} characters
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {material.content}
          </div>
        </div>
      )}
    </div>
  );
};
