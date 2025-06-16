require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initializeCronJobs } = require('./services/cronService');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration
app.use(
  cors({
    origin: NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, ...(process.env.ALLOWED_ORIGINS?.split(",") || [])].filter(Boolean)
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for Render
app.set("trust proxy", 1);

// Security headers for production
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
}

// Import routes
const studentRoutes = require("./routes/students");
const codeforcesRoutes = require("./routes/codeforces");
const settingsRoutes = require("./routes/settings");
const contestsRoutes = require("./routes/contests");
const submissionsRoutes = require("./routes/submissions");

// Register routes
app.use("/api/students", studentRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/contests", contestsRoutes);
app.use("/api/submissions", submissionsRoutes);

// Basic route to test server
app.get("/", (req, res) => {
  res.json({
    message: "Student Progress Management System API",
    status: "running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Keep-alive endpoint
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: Date.now() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: NODE_ENV === "production" ? "Something went wrong!" : err.message,
    ...(NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

// Catch-all handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
    availableEndpoints: [
      "GET /",
      "GET /api/health",
      "GET /api/ping",
      "GET /api/students",
      "POST /api/students",
      "GET /api/settings",
    ],
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Initialize cron jobs after MongoDB connection
    await initializeCronJobs();
    console.log('Cron jobs initialized');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  mongoose.connection.close(() => {
    console.log("Process terminated");
  });
});
