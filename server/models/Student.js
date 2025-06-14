const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    codeforcesHandle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    currentRating: {
      type: Number,
      default: 0,
    },
    maxRating: {
      type: Number,
      default: 0,
    },
    lastDataUpdate: {
      type: Date,
      default: Date.now,
    },
    emailRemindersCount: {
      type: Number,
      default: 0,
    },
    emailRemindersEnabled: {
      type: Boolean,
      default: true,
    },
    lastSubmissionDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
