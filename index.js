require("dotenv").config();
require("express-async-errors");

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/utils/db");
const fs = require("fs");
const path = require("path");

const app = express();

if(!fs.existsSync("uploads")) fs.mkdirSync("uploads");
// Middleware
app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Routes
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/materials", require("./src/routes/materials"));
app.use("/api/admin", require("./src/routes/admin"));
app.use("/api/tasks", require("./src/routes/tasks"));
app.use("/api/quizzes", require("./src/routes/quizzes"));
app.use("/api/user", require("./src/routes/user"));

// Health check
app.get("/", (req, res) => res.json({ message: "AI StudyBuddy API is running" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Something went wrong" });
});

const PORT = Number(process.env.PORT || 5000);

connectDB().then(() => {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the existing process and restart the server.`);
      process.exitCode = 1;
      return;
    }

    throw error;
  });
});
