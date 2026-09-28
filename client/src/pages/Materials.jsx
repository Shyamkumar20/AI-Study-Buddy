import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { materialService } from "../services/materialService";
import { SkeletonList } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import {
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Calendar,
  CheckSquare,
  MessageSquare,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getMaterials();
      setMaterials(data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError("");
    const allowed = [".txt", ".md", ".pdf"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      setError("Please upload a supported file format (.txt, .md, .pdf).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5MB limit.");
      return;
    }

    setSelectedFile(file);
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      await materialService.uploadMaterial(selectedFile, customTitle);
      setSuccess(`"${customTitle || selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      setCustomTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload study material.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All associated summaries and quizzes will be removed.`)) {
      return;
    }

    try {
      await materialService.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Failed to delete material: " + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickAction = async (materialId, actionType) => {
    setActionLoadingId(materialId);
    try {
      if (actionType === "summarize") {
        setActionMessage("AI is summarizing your material...");
        await materialService.summarize(materialId);
        navigate(`/materials/${materialId}?tab=summary`);
      } else if (actionType === "flashcards") {
        setActionMessage("AI is generating 5 smart flashcards...");
        await materialService.generateFlashcards(materialId, 5);
        navigate(`/materials/${materialId}?tab=flashcards`);
      } else if (actionType === "quiz") {
        setActionMessage("AI is generating your MCQ quiz...");
        await materialService.generateQuiz(materialId, 5);
        navigate(`/quizzes?material=${materialId}`);
      } else if (actionType === "tasks") {
        setActionMessage("AI is creating learning tasks...");
        await materialService.generateTasks(materialId);
        navigate("/tasks");
      }
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
      setActionMessage("");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Study Materials</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload class notes, textbooks, and articles to generate interactive study aids
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        <form onSubmit={handleUpload}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-indigo-300">
                  Selected: {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Drag and drop your study document, or{" "}
                  <span className="text-indigo-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500">
                  Supports .TXT, .MD, .PDF (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Give this material a title (optional)"
                className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shrink-0 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </form>
      </div>

      {/* Action Processing Overlay Banner */}
      {actionLoadingId && (
        <div className="p-4 rounded-2xl bg-indigo-600 text-white flex items-center justify-center gap-3 animate-pulse shadow-xl">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">{actionMessage}</span>
        </div>
      )}

      {/* Materials List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Uploaded Materials</h2>
          <span className="text-xs text-slate-400 font-medium">
            {materials.length} item{materials.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No materials uploaded yet"
            description="Upload your study materials above to unlock AI summaries, quizzes, and automated study plans."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map((mat) => (
              <div
                key={mat._id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleDelete(mat._id, mat.title)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/materials/${mat._id}`}
                    className="group-hover:text-indigo-300 transition-colors block"
                  >
                    <h3 className="text-base font-bold text-white line-clamp-1 flex items-center gap-1.5">
                      <span>{mat.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    Filename: {mat.filename}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Uploaded {new Date(mat.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* AI Quick Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction(mat._id, "summarize")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Summarize</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction(mat._id, "flashcards")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      <span>Flashcards</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction(mat._id, "quiz")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-3 h-3 text-emerald-400" />
                      <span>Quiz</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction(mat._id, "tasks")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckSquare className="w-3 h-3 text-amber-400" />
                      <span>Tasks</span>
                    </button>
                  </div>

                  <Link
                    to={`/chat?material=${mat._id}`}
                    className="w-full py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Ask AI Assistant</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
