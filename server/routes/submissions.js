const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { fetchSubmissions } = require('../services/codeforcesService');

// Get all submissions for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days } = req.query;
    
    let dateFilter = {};
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateFilter = { submissionTime: { $gte: startDate } };
    }

    const submissions = await Submission.find({
      studentId,
      ...dateFilter
    }).sort({ submissionTime: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync submissions for a student
router.post('/sync/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { codeforcesHandle } = req.body;

    if (!codeforcesHandle) {
      return res.status(400).json({ message: 'Codeforces handle is required' });
    }

    // Fetch submissions from Codeforces
    const submissions = await fetchSubmissions(codeforcesHandle);

    // Update or create submission records
    for (const submission of submissions) {
      await Submission.findOneAndUpdate(
        {
          studentId,
          problemId: submission.problemId,
          submissionTime: submission.submissionTime
        },
        {
          ...submission,
          studentId
        },
        {
          upsert: true,
          new: true
        }
      );
    }

    res.json({ message: 'Submissions synced successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submission statistics
router.get('/stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days } = req.query;

    let dateFilter = {};
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateFilter = { submissionTime: { $gte: startDate } };
    }

    const submissions = await Submission.find({
      studentId,
      ...dateFilter
    });

    const stats = {
      totalSubmissions: submissions.length,
      problemsSolved: new Set(submissions
        .filter(s => s.verdict === 'OK')
        .map(s => s.problemId)
      ).size,
      averageRating: submissions.reduce((acc, curr) => acc + curr.problemRating, 0) / submissions.length || 0,
      submissionsPerDay: submissions.length / (parseInt(days) || 1),
      ratingDistribution: submissions.reduce((acc, curr) => {
        const rating = Math.floor(curr.problemRating / 100) * 100;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {}),
      verdictDistribution: submissions.reduce((acc, curr) => {
        acc[curr.verdict] = (acc[curr.verdict] || 0) + 1;
        return acc;
      }, {}),
      languageDistribution: submissions.reduce((acc, curr) => {
        acc[curr.programmingLanguage] = (acc[curr.programmingLanguage] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 