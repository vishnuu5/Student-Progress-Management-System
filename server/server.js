const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Starting server...");

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("Middleware configured...");

// Basic route to test server
app.get("/", (req, res) => {
  res.json({
    message: "Student Progress Management System API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

console.log("Basic routes configured...");

// Connect to MongoDB (optional for now)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
} else {
  console.log("No MongoDB URI provided, running without database");
}

// Import and use routes
try {
  console.log("Loading routes...");

  const studentRoutes = require("./routes/students");
  console.log("Student routes loaded");

  const codeforcesRoutes = require("./routes/codeforces");
  console.log("Codeforces routes loaded");

  const settingsRoutes = require("./routes/settings");
  console.log("Settings routes loaded");

  app.use("/api/students", studentRoutes);
  app.use("/api/codeforces", codeforcesRoutes);
  app.use("/api/settings", settingsRoutes);

  console.log("All routes configured successfully");
} catch (error) {
  console.error("Error loading routes:", error);
}

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running successfully on port ${PORT}`);
});

module.exports = app;
