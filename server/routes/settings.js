const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// Get settings
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update settings
router.put("/", async (req, res) => {
  try {
    // Validate cron expression if provided
    if (req.body.cronExpression) {
      const cronRegex =
        /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;
      if (!cronRegex.test(req.body.cronExpression)) {
        return res
          .status(400)
          .json({ message: "Invalid cron expression format" });
      }
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(400).json({ message: "Failed to update settings" });
  }
});

module.exports = router;
