const Material = require("../models/Material");
const QuizAttempt = require("../models/QuizAttempt");
const { askGemini } = require("../utils/gemini");

// POST /api/materials/:id/quiz/submit
const submitQuiz = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Material not found" });

  if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const { answers } = req.body; // Array of { questionIndex: number, selectedAnswer: string }
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "Answers array is required" });
  }

  const quizQuestions = material.quiz || [];
  if (quizQuestions.length === 0) {
    return res.status(400).json({ message: "No quiz generated for this material yet" });
  }

  let score = 0;
  const gradedAnswers = [];
  const incorrectQuestions = [];

  quizQuestions.forEach((q, idx) => {
    const userSubmission = answers.find((a) => a.questionIndex === idx);
    const selected = userSubmission ? userSubmission.selectedAnswer : "";
    const isCorrect = String(selected).trim().toUpperCase() === String(q.answer).trim().toUpperCase();

    if (isCorrect) {
      score += 1;
    } else {
      incorrectQuestions.push({
        question: q.question,
        correctAnswer: q.answer,
        studentAnswer: selected,
      });
    }

    gradedAnswers.push({
      questionIndex: idx,
      questionText: q.question,
      selectedAnswer: selected,
      correctAnswer: q.answer,
      isCorrect,
    });
  });

  const totalQuestions = quizQuestions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Derive weak topics
  let weakTopics = [];
  if (incorrectQuestions.length > 0) {
    try {
      const prompt = `
A student missed the following quiz questions from their study material:
${JSON.stringify(incorrectQuestions, null, 2)}

Identify 1 to 3 specific sub-topics or concepts they should review.
Return ONLY a valid JSON array of short topic names (e.g. ["Concept A", "Concept B"]), with no markdown formatting:
`;
      const raw = await askGemini(prompt);
      const clean = raw.replace(/```json|```/g, "").trim();
      weakTopics = JSON.parse(clean);
    } catch {
      weakTopics = incorrectQuestions.slice(0, 3).map((iq) => iq.question.slice(0, 40) + "...");
    }
  }

  const attempt = await QuizAttempt.create({
    user: req.user.userId,
    material: material._id,
    score,
    totalQuestions,
    percentage,
    answers: gradedAnswers,
    weakTopics,
  });

  res.json({
    attemptId: attempt._id,
    score,
    totalQuestions,
    percentage,
    answers: gradedAnswers,
    weakTopics,
  });
};

// GET /api/quizzes/history
const getQuizHistory = async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user.userId })
    .populate("material", "title filename")
    .sort("-createdAt");
  res.json(attempts);
};

// GET /api/quizzes/:id
const getQuizAttempt = async (req, res) => {
  const attempt = await QuizAttempt.findOne({ _id: req.params.id, user: req.user.userId })
    .populate("material", "title filename");
  if (!attempt) return res.status(404).json({ message: "Attempt not found" });
  res.json(attempt);
};

module.exports = { submitQuiz, getQuizHistory, getQuizAttempt };
