const express = require("express");
const router = express.Router();

// Mock settings
let settings = {
  cronExpression: "0 2 * * *",
  cronDescription: "Daily at 2:00 AM",
  emailSettings: {
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
  },
  inactivityThreshold: 7,
};

// Get settings
router.get("/", (req, res) => {
  try {
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.put("/", (req, res) => {
  try {
    settings = { ...settings, ...req.body };
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
