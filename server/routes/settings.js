const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const cron = require("node-cron");

let currentCronJob = null;

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
    res.status(500).json({ message: error.message });
  }
});

// Update settings
router.put("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    // Update cron job if expression changed
    if (req.body.cronExpression && currentCronJob) {
      currentCronJob.stop();
      currentCronJob = cron.schedule(req.body.cronExpression, async () => {
        console.log("Running scheduled Codeforces data sync...");
        // Add sync logic here
      });
      currentCronJob.start();
    }

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
