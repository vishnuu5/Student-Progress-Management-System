const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration for production
app.use(
  cors({
    origin:
      NODE_ENV === "production"
        ? [
            process.env.FRONTEND_URL,
            "https://your-vercel-app.vercel.app", // Replace with your actual Vercel URL
            ...(process.env.ALLOWED_ORIGINS?.split(",") || []),
          ].filter(Boolean)
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

// Basic route to test server
app.get("/", (req, res) => {
  res.json({
    message: "Student Progress Management System API",
    status: "running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint (important for Render)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Keep-alive endpoint to prevent Render from sleeping
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: Date.now() });
});

// Connect to MongoDB with production settings
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/student-progress";

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: NODE_ENV === "production" ? 5000 : 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection error:", error);
    if (NODE_ENV === "production") {
      // In production, retry connection instead of exiting
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Handle MongoDB connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected. Attempting to reconnect...");
  if (NODE_ENV === "production") {
    setTimeout(connectDB, 5000);
  }
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

// Connect to database
connectDB();

// Import and use routes
try {
  console.log("📁 Loading routes...");

  const studentRoutes = require("./routes/students");
  const codeforcesRoutes = require("./routes/codeforces");
  const settingsRoutes = require("./routes/settings");

  app.use("/api/students", studentRoutes);
  app.use("/api/codeforces", codeforcesRoutes);
  app.use("/api/settings", settingsRoutes);

  console.log("✅ All routes configured successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error);
}

// Import services for cron jobs (only in production)
if (NODE_ENV === "production") {
  try {
    const { syncAllStudentsData } = require("./services/codeforcesService");
    const { checkInactiveStudents } = require("./services/emailService");

    // Cron job configuration
    const cronJob = cron.schedule(
      process.env.CRON_EXPRESSION || "0 2 * * *",
      async () => {
        console.log("🔄 Running daily Codeforces data sync...");
        try {
          await syncAllStudentsData();
          await checkInactiveStudents();
          console.log("✅ Daily sync completed successfully");
        } catch (error) {
          console.error("❌ Error in daily sync:", error);
        }
      },
      {
        scheduled: true,
        timezone: process.env.TIMEZONE || "UTC",
      }
    );

    cronJob.start();
    console.log("⏰ Cron job started");
  } catch (error) {
    console.warn("⚠️ Cron services not available:", error.message);
  }
}

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

// Start server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🎉 Server running successfully on port ${PORT}`);
});

// Graceful shutdown for production
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    mongoose.connection.close();
  });
});
