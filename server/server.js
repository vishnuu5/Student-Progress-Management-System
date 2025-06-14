const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
const path = require("path");
require("dotenv").config();

const studentRoutes = require("./routes/students");
const codeforcesRoutes = require("./routes/codeforces");
const settingsRoutes = require("./routes/settings");
const { syncAllStudentsData } = require("./services/codeforcesService");
const { checkInactiveStudents } = require("./services/emailService");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/codeforces", codeforcesRoutes);
app.use("/api/settings", settingsRoutes);

// Cron job - daily at 2 AM
const cronJob = cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("Running daily Codeforces data sync...");
    try {
      await syncAllStudentsData();
      await checkInactiveStudents();
      console.log("Daily sync completed successfully");
    } catch (error) {
      console.error("Error in daily sync:", error);
    }
  },
  { scheduled: false }
);

cronJob.start();

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve(); // Needed if using ES5-style modules
  app.use(express.static(path.join(__dirname, "client", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
