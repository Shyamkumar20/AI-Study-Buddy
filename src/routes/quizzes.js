const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  submitQuiz,
  getQuizHistory,
  getQuizAttempt,
} = require("../controllers/quizController");

router.use(protect);

router.post("/:id/submit", submitQuiz);
router.get("/history", getQuizHistory);
router.get("/:id", getQuizAttempt);

module.exports = router;
