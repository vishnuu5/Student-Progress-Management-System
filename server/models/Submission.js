const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    problemId: {
      type: String,
      required: true,
    },
    problemName: {
      type: String,
      required: true,
    },
    problemRating: {
      type: Number,
      required: true,
    },
    verdict: {
      type: String,
      required: true,
    },
    submissionTime: {
      type: Date,
      required: true,
    },
    programmingLanguage: {
      type: String,
      required: true,
    },
    executionTime: {
      type: Number,
      default: 0,
    },
    memoryConsumed: {
      type: Number,
      default: 0,
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    isContestSubmission: {
      type: Boolean,
      default: false,
    },
    contestId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ studentId: 1, submissionTime: -1 });
submissionSchema.index({ studentId: 1, problemId: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
