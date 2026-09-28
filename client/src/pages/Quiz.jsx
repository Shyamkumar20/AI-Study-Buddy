import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { materialService } from "../services/materialService";
import { quizService } from "../services/quizService";
import { EmptyState } from "../components/EmptyState";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  AlertTriangle,
} from "lucide-react";

export const Quiz = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    searchParams.get("material") || ""
  );
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Quiz running state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [index]: selectedOption }
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  // Load materials list
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const mats = await materialService.getMaterials();
        setMaterials(mats || []);
        if (!selectedMaterialId && mats && mats.length > 0) {
          setSelectedMaterialId(mats[0]._id);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // When material selected, load its details
  useEffect(() => {
    if (!selectedMaterialId) return;
    const loadMat = async () => {
      try {
        const data = await materialService.getMaterial(selectedMaterialId);
        setMaterial(data);
        setQuizStarted(false);
        setResults(null);
        setUserAnswers({});
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load material:", err);
      }
    };
    loadMat();
  }, [selectedMaterialId]);

  const handleGenerateQuiz = async () => {
    if (!selectedMaterialId) return;
    setGenerating(true);
    try {
      const res = await materialService.generateQuiz(selectedMaterialId, 5);
      setMaterial((prev) => ({ ...prev, quiz: res.quiz }));
      setQuizStarted(true);
      setUserAnswers({});
      setCurrentIndex(0);
      setResults(null);
    } catch (err) {
      alert("Failed to generate quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionIdx, optionText) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionText,
    }));
  };

  const handleSubmitQuiz = async () => {
    const quizQuestions = material?.quiz || [];
    const formattedAnswers = quizQuestions.map((q, idx) => ({
      questionIndex: idx,
      selectedAnswer: userAnswers[idx] || "",
    }));

    setSubmitting(true);
    try {
      const res = await quizService.submitQuiz(selectedMaterialId, formattedAnswers);
      setResults(res);

      if (res.percentage >= 75) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      alert("Failed to submit quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const questions = material?.quiz || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Quiz Center</h1>
        <p className="text-sm text-slate-400 mt-1">
          Test your comprehension with AI-generated multiple-choice questions
        </p>
      </div>

      {/* Material Selector */}
      {materials.length > 0 && !quizStarted && !results && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Study Material</p>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer mt-0.5"
              >
                {materials.map((m) => (
                  <option key={m._id} value={m._id} className="bg-slate-900 text-white">
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={generating}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Generating Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{questions.length > 0 ? "Regenerate New Questions" : "Generate AI Quiz"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {materials.length === 0 && !loading && (
        <EmptyState
          icon={HelpCircle}
          title="No materials available for quizzes"
          description="Upload study material first, and Gemini AI will automatically create practice quizzes for you."
          actionText="Upload Material"
          actionLink="/materials"
        />
      )}

      {/* Pre-Quiz Launch Card */}
      {!quizStarted && !results && material && (
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
            <HelpCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {questions.length > 0 ? `${questions.length} MCQ Questions Ready` : "No Quiz Generated Yet"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Based on "{material.title}". Test your understanding, get instant scoring, and identify your weak topics.
            </p>
          </div>

          {questions.length > 0 ? (
            <button
              onClick={() => {
                setQuizStarted(true);
                setCurrentIndex(0);
                setUserAnswers({});
              }}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
            >
              <span>Start Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerateQuiz}
              disabled={generating}
              className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quiz with Gemini</span>
            </button>
          )}
        </div>
      )}

      {/* Quiz Runner */}
      {quizStarted && !results && questions.length > 0 && (
        <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl space-y-6">
          {/* Progress Bar & Counter */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-indigo-400">
                {Math.round(((currentIndex + 1) / questions.length) * 100)}% Completed
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {questions[currentIndex]?.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {questions[currentIndex]?.options?.map((opt, oIdx) => {
              const isSelected = userAnswers[currentIndex] === opt;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentIndex, opt)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10"
                      : "border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500 text-white"
                        : "border-slate-700 text-slate-500"
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Grading Answers...</span>
                  </>
                ) : (
                  <span>Submit Quiz</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score Header Card */}
          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                {results.percentage}%
              </h2>
              <p className="text-sm font-semibold text-slate-300 mt-1">
                You scored {results.score} out of {results.totalQuestions} questions correct
              </p>
            </div>

            {results.percentage >= 80 ? (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🎉 Outstanding Recall!
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                📚 Keep Reviewing Core Concepts
              </span>
            )}

            {/* Weak Topics Callout */}
            {results.weakTopics && results.weakTopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left mt-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Topics to Review</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {results.weakTopics.map((wt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300"
                    >
                      {wt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setResults(null);
                  setQuizStarted(true);
                  setCurrentIndex(0);
                  setUserAnswers({});
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake This Quiz</span>
              </button>
              <Link
                to={`/chat?material=${selectedMaterialId}`}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>Ask AI About Weak Topics</span>
              </Link>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">Answer Review</h3>
            {results.answers?.map((ans, aIdx) => (
              <div
                key={aIdx}
                className={`p-4 rounded-2xl border ${
                  ans.isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {ans.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm space-y-1">
                    <p className="font-semibold text-white">{ans.questionText}</p>
                    <p className="text-slate-400 text-xs">
                      Your answer:{" "}
                      <span className={ans.isCorrect ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                        {ans.selectedAnswer || "No answer selected"}
                      </span>
                    </p>
                    {!ans.isCorrect && (
                      <p className="text-emerald-400 text-xs font-semibold">
                        Correct answer: {ans.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
