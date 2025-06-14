const express = require("express");
const router = express.Router();
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const { getDateRange } = require("../utils/dateUtils");

// Get contest history for a student
router.get("/contests/:studentId", async (req, res) => {
  try {
    const { days = 365 } = req.query;
    const { startDate } = getDateRange(Number.parseInt(days));

    const contests = await Contest.find({
      studentId: req.params.studentId,
      contestTime: { $gte: startDate },
    }).sort({ contestTime: -1 });

    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get problem solving data for a student
router.get("/problems/:studentId", async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const { startDate } = getDateRange(Number.parseInt(days));

    const submissions = await Submission.find({
      studentId: req.params.studentId,
      submissionTime: { $gte: startDate },
      verdict: "OK",
    }).sort({ submissionTime: -1 });

    // Calculate statistics
    const totalProblems = submissions.length;
    const avgRating =
      submissions.length > 0
        ? submissions.reduce((sum, sub) => sum + (sub.problemRating || 0), 0) /
          submissions.length
        : 0;

    const mostDifficult = submissions.reduce(
      (max, sub) =>
        (sub.problemRating || 0) > (max.problemRating || 0) ? sub : max,
      { problemRating: 0 }
    );

    const avgProblemsPerDay = totalProblems / Number.parseInt(days);

    // Rating buckets
    const ratingBuckets = {
      "800-1000": 0,
      "1001-1200": 0,
      "1201-1400": 0,
      "1401-1600": 0,
      "1601-1800": 0,
      "1801-2000": 0,
      "2000+": 0,
    };

    submissions.forEach((sub) => {
      const rating = sub.problemRating || 0;
      if (rating <= 1000) ratingBuckets["800-1000"]++;
      else if (rating <= 1200) ratingBuckets["1001-1200"]++;
      else if (rating <= 1400) ratingBuckets["1201-1400"]++;
      else if (rating <= 1600) ratingBuckets["1401-1600"]++;
      else if (rating <= 1800) ratingBuckets["1601-1800"]++;
      else if (rating <= 2000) ratingBuckets["1801-2000"]++;
      else ratingBuckets["2000+"]++;
    });

    // Submission heatmap data
    const heatmapData = {};
    submissions.forEach((sub) => {
      const date = sub.submissionTime.toISOString().split("T")[0];
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    res.json({
      totalProblems,
      avgRating: Math.round(avgRating),
      mostDifficult,
      avgProblemsPerDay: Math.round(avgProblemsPerDay * 100) / 100,
      ratingBuckets,
      heatmapData,
      submissions: submissions.slice(0, 50), // Latest 50 submissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
