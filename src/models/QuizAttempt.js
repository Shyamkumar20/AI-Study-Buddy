const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material" },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: [
      {
        questionIndex: Number,
        questionText: String,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
      },
    ],
    weakTopics: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
