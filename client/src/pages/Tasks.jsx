import React, { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import { materialService } from "../services/materialService";
import { EmptyState } from "../components/EmptyState";
import { SkeletonList } from "../components/SkeletonLoader";
import confetti from "canvas-confetti";
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  Filter,
  Sparkles,
} from "lucide-react";

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'

  // Modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("Intermediate");
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskMaterial, setNewTaskMaterial] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [taskData, matData] = await Promise.all([
        taskService.getTasks(),
        materialService.getMaterials(),
      ]);
      setTasks(taskData || []);
      setMaterials(matData || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (taskId, currentCompleted) => {
    try {
      const updated = await taskService.updateTask(taskId, {
        completed: !currentCompleted,
      });

      if (!currentCompleted) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: updated.completed } : t))
      );
    } catch (err) {
      alert("Failed to update task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert("Failed to delete task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setSubmitting(true);
    try {
      const created = await taskService.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        difficulty: newTaskDifficulty,
        estimatedMinutes: Number(newTaskMinutes),
        materialId: newTaskMaterial || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    } catch (err) {
      alert("Failed to create task: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Study Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track and complete structured learning steps generated from your materials
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "pending"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "completed"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-400">
          {tasks.length > 0 && (
            <span>
              Progress:{" "}
              <strong className="text-indigo-400 font-bold">
                {Math.round((completedCount / tasks.length) * 100)}%
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={filter === "completed" ? "No completed tasks yet" : "No tasks found"}
          description="Tasks can be generated directly from any study document in the Materials section."
          actionText="Explore Materials"
          actionLink="/materials"
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`p-5 rounded-2xl border transition-all flex items-start sm:items-center justify-between gap-4 ${
                task.completed
                  ? "bg-slate-900/30 border-slate-800/50 text-slate-500"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-200"
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <button
                  onClick={() => handleToggle(task._id, task.completed)}
                  className="mt-1 sm:mt-0 p-1 text-slate-400 hover:text-indigo-400 transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      task.completed ? "line-through text-slate-500" : "text-white"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.estimatedMinutes || 25} min
                    </span>
                    <span>•</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        task.difficulty === "Beginner"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : task.difficulty === "Advanced"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-indigo-500/10 text-indigo-400"
                      }`}
                    >
                      {task.difficulty || "Intermediate"}
                    </span>
                    {task.material?.title && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[150px]">
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span className="truncate">{task.material.title}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(task._id, task.completed)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    task.completed
                      ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      : "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white"
                  }`}
                >
                  {task.completed ? "Done" : "Complete"}
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <h2 className="text-lg font-bold text-white">Create New Study Task</h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Review chapter 3 algorithms"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Additional details or focus notes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated Mins
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {materials.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Link to Material (optional)
                  </label>
                  <select
                    value={newTaskMaterial}
                    onChange={(e) => setNewTaskMaterial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None (Independent task)</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
