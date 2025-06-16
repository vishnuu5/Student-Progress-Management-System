const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const { fetchContestHistory } = require('../services/codeforcesService');

// Get all contests for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days } = req.query;
    
    let dateFilter = {};
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateFilter = { contestDate: { $gte: startDate } };
    }

    const contests = await Contest.find({
      studentId,
      ...dateFilter
    }).sort({ contestDate: -1 });

    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync contest history for a student
router.post('/sync/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { codeforcesHandle } = req.body;

    if (!codeforcesHandle) {
      return res.status(400).json({ message: 'Codeforces handle is required' });
    }

    // Fetch contest history from Codeforces
    const contestHistory = await fetchContestHistory(codeforcesHandle);

    // Update or create contest records
    for (const contest of contestHistory) {
      await Contest.findOneAndUpdate(
        {
          studentId,
          contestId: contest.contestId
        },
        {
          ...contest,
          studentId
        },
        {
          upsert: true,
          new: true
        }
      );
    }

    res.json({ message: 'Contest history synced successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get contest statistics
router.get('/stats/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { days } = req.query;

    let dateFilter = {};
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      dateFilter = { contestDate: { $gte: startDate } };
    }

    const contests = await Contest.find({
      studentId,
      ...dateFilter
    });

    const stats = {
      totalContests: contests.length,
      averageRank: contests.reduce((acc, curr) => acc + curr.rank, 0) / contests.length || 0,
      averageRatingChange: contests.reduce((acc, curr) => acc + curr.ratingChange, 0) / contests.length || 0,
      maxRating: Math.max(...contests.map(c => c.newRating), 0),
      totalSolvedProblems: contests.reduce((acc, curr) => acc + curr.solvedProblems.length, 0),
      totalUnsolvedProblems: contests.reduce((acc, curr) => acc + curr.unsolvedProblems.length, 0),
      ratingDistribution: contests.reduce((acc, curr) => {
        const rating = Math.floor(curr.newRating / 100) * 100;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 