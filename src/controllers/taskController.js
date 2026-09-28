const Task = require("../models/Task");

// GET /api/tasks
const getTasks = async (req, res) => {
  const filter = { user: req.user.userId };
  if (req.query.completed !== undefined) {
    filter.completed = req.query.completed === "true";
  }
  const tasks = await Task.find(filter)
    .populate("material", "title filename")
    .sort("-createdAt");
  res.json(tasks);
};

// POST /api/tasks
const createTask = async (req, res) => {
  const { title, description, difficulty, estimatedMinutes, dueDate, materialId } = req.body;
  if (!title) return res.status(400).json({ message: "Task title is required" });

  const task = await Task.create({
    user: req.user.userId,
    material: materialId || null,
    title: title.trim(),
    description: description || "",
    difficulty: difficulty || "Intermediate",
    estimatedMinutes: estimatedMinutes || 30,
    dueDate: dueDate || null,
  });

  res.status(201).json(task);
};

// PATCH /api/tasks/:id
const updateTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.userId });
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (req.body.completed !== undefined) {
    task.completed = Boolean(req.body.completed);
    task.completedAt = task.completed ? new Date() : null;
  }
  if (req.body.title) task.title = req.body.title.trim();
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.difficulty) task.difficulty = req.body.difficulty;
  if (req.body.estimatedMinutes) task.estimatedMinutes = req.body.estimatedMinutes;
  if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;

  await task.save();
  res.json(task);
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
