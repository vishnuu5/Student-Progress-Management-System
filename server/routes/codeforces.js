const express = require("express");
const router = express.Router();

// Mock data for testing
const mockContests = [
  {
    _id: "1",
    studentId: "1",
    contestId: 1234,
    contestName: "Codeforces Round #123",
    rank: 100,
    oldRating: 1200,
    newRating: 1250,
    ratingChange: 50,
    contestTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const mockSubmissions = [
  {
    _id: "1",
    studentId: "1",
    submissionId: 12345,
    contestId: 1234,
    problemIndex: "A",
    problemName: "Simple Problem",
    problemRating: 800,
    verdict: "OK",
    submissionTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    language: "C++",
  },
];

// Get contest history
router.get("/contests/:studentId", (req, res) => {
  try {
    const contests = mockContests.filter(
      (c) => c.studentId === req.params.studentId
    );
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get problem solving data
router.get("/problems/:studentId", (req, res) => {
  try {
    const submissions = mockSubmissions.filter(
      (s) => s.studentId === req.params.studentId && s.verdict === "OK"
    );

    const response = {
      totalProblems: submissions.length,
      avgRating:
        submissions.length > 0
          ? Math.round(
              submissions.reduce((sum, s) => sum + s.problemRating, 0) /
                submissions.length
            )
          : 0,
      mostDifficult: submissions.reduce(
        (max, s) => (s.problemRating > max.problemRating ? s : max),
        {
          problemRating: 0,
        }
      ),
      avgProblemsPerDay: 0.5,
      ratingBuckets: {
        "800-1000": 1,
        "1001-1200": 0,
        "1201-1400": 0,
        "1401-1600": 0,
        "1601-1800": 0,
        "1801-2000": 0,
        "2000+": 0,
      },
      heatmapData: {
        [new Date().toISOString().split("T")[0]]: 1,
      },
      submissions: submissions,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
