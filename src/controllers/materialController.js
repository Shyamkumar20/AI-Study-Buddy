const fs = require("fs");
const Material = require("../models/Material");
const { askGemini } = require("../utils/gemini");

// Helper: read uploaded file text
const readFileText = (filePath) => fs.readFileSync(filePath, "utf-8");

// POST /api/materials/upload
const uploadMaterial = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const { title } = req.body;
  const content = readFileText(req.file.path);

  const material = await Material.create({
    user: req.user.userId,
    title: title || req.file.originalname,
    content,
    filename: req.file.originalname,
  });

  // Clean up file from disk after reading
  fs.unlinkSync(req.file.path);

  res.status(201).json({ message: "Material uploaded", material });
};

// GET /api/materials
const getMaterials = async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { user: req.user.userId };
  const materials = await Material.find(filter).select("-content -flashcards -quiz -studyPlan").sort("-createdAt");
  res.json(materials);
};

// GET /api/materials/:id
const getMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  // Students can only access their own
  if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json(material);
};

// DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  await material.deleteOne();
  res.json({ message: "Deleted" });
};

// POST /api/materials/:id/summarize
const summarize = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  const prompt = `Summarize the following study material clearly and concisely in bullet points:\n\n${material.content}`;
  const summary = await askGemini(prompt);

  material.summary = summary;
  await material.save();

  res.json({ summary });
};

// POST /api/materials/:id/flashcards
const generateFlashcards = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  const count = req.body.count || 5;

  const prompt = `
Create ${count} flashcards from the study material below.
Return ONLY valid JSON in this format, no extra text:
[{"question": "...", "answer": "..."}]

Study material:
${material.content}
`;

  const raw = await askGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  const flashcards = JSON.parse(clean);

  material.flashcards = flashcards;
  await material.save();

  res.json({ flashcards });
};

// POST /api/materials/:id/quiz
const generateQuiz = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  const count = req.body.count || 5;

  const prompt = `
Create ${count} multiple choice quiz questions from the study material below.
Return ONLY valid JSON in this format, no extra text:
[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}]

Study material:
${material.content}
`;

  const raw = await askGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  const quiz = JSON.parse(clean);

  material.quiz = quiz;
  await material.save();

  res.json({ quiz });
};

// POST /api/materials/:id/study-plan
const generateStudyPlan = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  const { goal, hoursPerDay, days } = req.body;

  const prompt = `
You are a study planner. Based on the study material below, create a personalized ${days || 7}-day study plan.
Student's goal: ${goal || "Understand and retain the material"}
Available study time: ${hoursPerDay || 2} hours per day.

Return a clear day-by-day schedule with topics and activities.

Study material:
${material.content}
`;

  const studyPlan = await askGemini(prompt);

  material.studyPlan = studyPlan;
  await material.save();

  res.json({ studyPlan });
};

// POST /api/materials/:id/ask
const askMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const { question, history } = req.body;
  if (!question) return res.status(400).json({ message: "Question is required" });

  let conversationContext = "";
  if (Array.isArray(history) && history.length > 0) {
    conversationContext = "Previous conversation:\n" +
      history.map((m) => `${m.role === "user" ? "Student" : "AI Assistant"}: ${m.content}`).join("\n") + "\n\n";
  }

  const prompt = `You are a helpful, expert AI Study Assistant.
Use the following study material context to answer the student's question accurately, concisely, and clearly.
If the answer cannot be found in the study material, you may politely state that and provide the best educational explanation.

Study Material Title: ${material.title}
Study Material Content:
${material.content.slice(0, 15000)}

${conversationContext}Student's Question: ${question}

Provide an insightful, well-structured answer (you may use bullet points and clear formatting if appropriate):`;

  const reply = await askGemini(prompt);
  res.json({ reply });
};

// POST /api/materials/:id/tasks
const generateTasks = async (req, res) => {
  const material = await Material.findById(req.params.id);
  if (!material) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "admin" && material.user.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  const Task = require("../models/Task");

  const prompt = `
Based on the study material below, break it down into 4 to 6 specific, actionable, progressive learning tasks.
Return ONLY valid JSON array in this format, with no extra text or markdown fences:
[
  {
    "title": "...",
    "description": "...",
    "difficulty": "Beginner" | "Intermediate" | "Advanced",
    "estimatedMinutes": 25
  }
]

Study material:
${material.content.slice(0, 15000)}
`;

  const raw = await askGemini(prompt);
  const clean = raw.replace(/```json|```/g, "").trim();
  let taskList = [];
  try {
    taskList = JSON.parse(clean);
  } catch {
    taskList = [
      { title: `Read core concepts of ${material.title}`, description: "Review main principles and definitions.", difficulty: "Beginner", estimatedMinutes: 20 },
      { title: `Practice flashcards for ${material.title}`, description: "Test memory retention on key terms.", difficulty: "Intermediate", estimatedMinutes: 15 },
      { title: `Take quiz on ${material.title}`, description: "Evaluate understanding through multiple choice questions.", difficulty: "Advanced", estimatedMinutes: 25 },
    ];
  }

  const createdTasks = await Promise.all(
    taskList.map((t) =>
      Task.create({
        user: req.user.userId,
        material: material._id,
        title: t.title,
        description: t.description || "",
        difficulty: t.difficulty || "Intermediate",
        estimatedMinutes: t.estimatedMinutes || 25,
      })
    )
  );

  res.status(201).json({ tasks: createdTasks });
};

module.exports = {
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
};

