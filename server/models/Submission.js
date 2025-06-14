const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    submissionId: {
      type: Number,
      required: true,
      unique: true,
    },
    contestId: {
      type: Number,
      required: true,
    },
    problemIndex: {
      type: String,
      required: true,
    },
    problemName: {
      type: String,
      required: true,
    },
    problemRating: {
      type: Number,
      default: 0,
    },
    verdict: {
      type: String,
      required: true,
    },
    submissionTime: {
      type: Date,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ studentId: 1, submissionTime: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
