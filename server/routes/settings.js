const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const { updateSyncSettings } = require('../services/cronService');

// Get current settings
router.get("/", async (req, res) => {
  try {
    const settings = await Settings.findOne() || await Settings.create({
      syncTime: '02:00',
      syncFrequency: 'daily'
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update all settings
router.put("/", async (req, res) => {
  try {
    const { emailSettings, syncTime, syncFrequency, inactivityThreshold, cronExpression, cronDescription } = req.body;
    
    // Get existing settings or create new
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update fields if provided
    if (emailSettings) {
      settings.emailSettings = {
        smtpHost: emailSettings.smtpHost,
        smtpPort: emailSettings.smtpPort,
        smtpUser: emailSettings.smtpUser,
        smtpPassword: emailSettings.smtpPassword,
        fromEmail: emailSettings.fromEmail
      };
    }
    if (syncTime) settings.syncTime = syncTime;
    if (syncFrequency) settings.syncFrequency = syncFrequency;
    if (inactivityThreshold) settings.inactivityThreshold = inactivityThreshold;
    if (cronExpression) settings.cronExpression = cronExpression;
    if (cronDescription) settings.cronDescription = cronDescription;

    // Update cron job if sync settings changed
    if (syncTime || syncFrequency) {
      await updateSyncSettings(settings.syncTime, settings.syncFrequency);
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update sync settings
router.put("/sync", async (req, res) => {
  try {
    const { syncTime, syncFrequency } = req.body;
    
    if (!syncTime || !syncFrequency) {
      return res.status(400).json({ message: 'Sync time and frequency are required' });
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(syncTime)) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm' });
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(syncFrequency)) {
      return res.status(400).json({ message: 'Invalid frequency' });
    }

    await updateSyncSettings(syncTime, syncFrequency);
    res.json({ message: 'Sync settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update email settings
router.put("/email", async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = req.body;
    
    const settings = await Settings.findOne() || new Settings();
    settings.emailSettings = {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom
    };
    
    await settings.save();
    res.json({ message: 'Email settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
