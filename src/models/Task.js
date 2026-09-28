const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    material: { type: mongoose.Schema.Types.ObjectId, ref: "Material" },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Beginner", "Basic", "Intermediate", "Advanced", "Mastery"],
      default: "Intermediate",
    },
    estimatedMinutes: { type: Number, default: 30 },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
