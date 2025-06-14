const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    contestId: {
      type: Number,
      required: true,
    },
    contestName: {
      type: String,
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    oldRating: {
      type: Number,
      required: true,
    },
    newRating: {
      type: Number,
      required: true,
    },
    ratingChange: {
      type: Number,
      required: true,
    },
    contestTime: {
      type: Date,
      required: true,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    problemsUnsolved: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

contestSchema.index({ studentId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model("Contest", contestSchema);
