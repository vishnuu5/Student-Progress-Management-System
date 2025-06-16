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
    contestDate: {
      type: Date,
      required: true,
    },
    solvedProblems: [
      {
        problemId: String,
        problemName: String,
        problemRating: Number,
        submissionTime: Date,
      },
    ],
    unsolvedProblems: [
      {
        problemId: String,
        problemName: String,
        problemRating: Number,
      },
    ],
    totalProblems: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

contestSchema.index({ studentId: 1, contestDate: -1 });

module.exports = mongoose.model("Contest", contestSchema);
