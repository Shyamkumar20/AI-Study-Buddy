const User = require("../models/User");
const Material = require("../models/Material");
const Task = require("../models/Task");
const QuizAttempt = require("../models/QuizAttempt");

// GET /api/user/me
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.userId).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      streak: user.streak || 1,
      studyGoalHours: user.studyGoalHours || 2,
      createdAt: user.createdAt,
    },
  });
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  const { name, studyGoalHours, avatar } = req.body;
  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name.trim();
  if (studyGoalHours !== undefined) user.studyGoalHours = Number(studyGoalHours);
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.json({
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      streak: user.streak || 1,
      studyGoalHours: user.studyGoalHours || 2,
    },
  });
};

// GET /api/user/stats
const getStats = async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const totalMaterials = await Material.countDocuments({ user: userId });
  const totalTasks = await Task.countDocuments({ user: userId });
  const completedTasks = await Task.countDocuments({ user: userId, completed: true });
  const pendingTasks = totalTasks - completedTasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const quizAttempts = await QuizAttempt.find({ user: userId });
  const totalQuizzes = quizAttempts.length;
  const averageQuizScore =
    totalQuizzes > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / totalQuizzes)
      : 0;

  // Determine mastery level
  let masteryTier = "Beginner";
  if (completedTasks >= 25 && averageQuizScore >= 80) masteryTier = "Mastery";
  else if (completedTasks >= 15 || (completedTasks >= 10 && averageQuizScore >= 75)) masteryTier = "Advanced";
  else if (completedTasks >= 7 || totalMaterials >= 3) masteryTier = "Intermediate";
  else if (completedTasks >= 2 || totalMaterials >= 1) masteryTier = "Basic";

  // Recent material for "Continue Learning"
  const recentMaterial = await Material.findOne({ user: userId })
    .sort("-createdAt")
    .select("title filename summary flashcards quiz studyPlan createdAt");

  // Collect weak topics from recent quiz attempts
  const allWeakTopics = quizAttempts
    .flatMap((q) => q.weakTopics || [])
    .filter(Boolean);
  const uniqueWeakTopics = Array.from(new Set(allWeakTopics)).slice(0, 5);

  res.json({
    streak: user.streak || 1,
    studyGoalHours: user.studyGoalHours || 2,
    totalMaterials,
    totalTasks,
    completedTasks,
    pendingTasks,
    taskCompletionRate,
    totalQuizzes,
    averageQuizScore,
    masteryTier,
    recentMaterial,
    weakTopics: uniqueWeakTopics,
  });
};

// GET /api/user/notifications
const getNotifications = async (req, res) => {
  const userId = req.user.userId;
  const user = await User.findById(userId);
  const pendingTasks = await Task.countDocuments({ user: userId, completed: false });
  const totalMaterials = await Material.countDocuments({ user: userId });
  const recentQuiz = await QuizAttempt.findOne({ user: userId }).sort("-createdAt");

  const notifications = [];

  // Streak notification
  notifications.push({
    id: "notif-streak",
    title: `${user?.streak || 1}-Day Streak Active! 🔥`,
    message: "Keep studying today to maintain your learning momentum.",
    type: "streak",
    read: false,
    timestamp: new Date().toISOString(),
  });

  // Pending tasks notification
  if (pendingTasks > 0) {
    notifications.push({
      id: "notif-tasks",
      title: `${pendingTasks} Study Task${pendingTasks > 1 ? "s" : ""} Pending`,
      message: "Check your task list to stay on track for your study goals.",
      type: "task",
      read: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    });
  }

  // Quiz notification
  if (recentQuiz) {
    notifications.push({
      id: "notif-quiz",
      title: `Latest Quiz Score: ${recentQuiz.percentage}%`,
      message:
        recentQuiz.percentage >= 80
          ? "Great job! You showed strong mastery."
          : "Review your weak topics to improve your understanding.",
      type: "quiz",
      read: true,
      timestamp: recentQuiz.createdAt,
    });
  }

  if (totalMaterials === 0) {
    notifications.push({
      id: "notif-welcome",
      title: "Welcome to AI StudyBuddy! 🚀",
      message: "Upload your first study document to generate flashcards, quizzes, and study plans.",
      type: "info",
      read: false,
      timestamp: user?.createdAt || new Date().toISOString(),
    });
  }

  res.json(notifications);
};

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getNotifications,
};
