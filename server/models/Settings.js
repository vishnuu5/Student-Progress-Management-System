const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    syncTime: {
      type: String,
      default: "02:00", // Default to 2 AM
      validate: {
        validator: function(v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: props => `${props.value} is not a valid time format (HH:mm)`
      }
    },
    syncFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'daily'
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
    cronExpression: {
      type: String,
      default: "0 2 * * *" // Default to 2 AM daily
    },
    cronDescription: {
      type: String,
      default: "Daily at 2:00 AM"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
