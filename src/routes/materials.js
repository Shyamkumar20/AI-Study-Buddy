const router = require("express").Router();
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  uploadMaterial,
  getMaterials,
  getMaterial,
  deleteMaterial,
  summarize,
  generateFlashcards,
  generateQuiz,
  generateStudyPlan,
  askMaterial,
  generateTasks,
} = require("../controllers/materialController");

router.use(protect); // all routes require login

router.post("/upload", upload.single("file"), uploadMaterial);
router.get("/", getMaterials);
router.get("/:id", getMaterial);
router.delete("/:id", deleteMaterial);

const { submitQuiz } = require("../controllers/quizController");

// AI features
router.post("/:id/summarize", summarize);
router.post("/:id/flashcards", generateFlashcards);
router.post("/:id/quiz", generateQuiz);
router.post("/:id/quiz/submit", submitQuiz);
router.post("/:id/study-plan", generateStudyPlan);
router.post("/:id/ask", askMaterial);
router.post("/:id/tasks", generateTasks);

module.exports = router;
