const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    cronExpression: {
      type: String,
      default: "0 2 * * *", // Daily at 2 AM
    },
    cronDescription: {
      type: String,
      default: "Daily at 2:00 AM",
    },
    emailSettings: {
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
      fromEmail: String,
    },
    inactivityThreshold: {
      type: Number,
      default: 7, // days
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
