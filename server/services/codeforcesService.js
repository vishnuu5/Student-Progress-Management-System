const axios = require("axios");
const Student = require("../models/Student");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");

const CODEFORCES_API_BASE = "https://codeforces.com/api";

// Rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchCodeforcesData = async (handle) => {
  try {
    // Fetch user info
    const userResponse = await axios.get(`${CODEFORCES_API_BASE}/user.info`, {
      params: { handles: handle }
    });

    if (userResponse.data.status !== 'OK' || !userResponse.data.result.length) {
      throw new Error('User not found on Codeforces');
    }

    const userData = userResponse.data.result[0];

    // Fetch user's last submission
    const submissionsResponse = await axios.get(`${CODEFORCES_API_BASE}/user.status`, {
      params: { handle, count: 1 }
    });

    let lastSubmissionDate = null;
    if (submissionsResponse.data.status === 'OK' && submissionsResponse.data.result.length > 0) {
      lastSubmissionDate = new Date(submissionsResponse.data.result[0].creationTimeSeconds * 1000);
    }

    return {
      currentRating: userData.rating || 0,
      maxRating: userData.maxRating || 0,
      lastSubmissionDate
    };
  } catch (error) {
    console.error('Error fetching Codeforces data:', error);
    throw error;
  }
};

const fetchContestHistory = async (handle) => {
  try {
    const response = await axios.get(`${CODEFORCES_API_BASE}/user.rating`, {
      params: { handle }
    });

    if (response.data.status !== 'OK') {
      throw new Error('Failed to fetch contest history');
    }

    return response.data.result.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingChange: contest.newRating - contest.oldRating,
      contestDate: new Date(contest.ratingUpdateTimeSeconds * 1000)
    }));
  } catch (error) {
    console.error('Error fetching contest history:', error);
    throw error;
  }
};

const fetchSubmissions = async (handle, count = 100) => {
  try {
    const response = await axios.get(`${CODEFORCES_API_BASE}/user.status`, {
      params: { handle, count }
    });

    if (response.data.status !== 'OK') {
      throw new Error('Failed to fetch submissions');
    }

    return response.data.result.map(submission => ({
      problemId: submission.problem.contestId + submission.problem.index,
      problemName: submission.problem.name,
      problemRating: submission.problem.rating || 0,
      verdict: submission.verdict,
      submissionTime: new Date(submission.creationTimeSeconds * 1000),
      programmingLanguage: submission.programmingLanguage
    }));
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

async function syncStudentData(studentId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    console.log(`Syncing data for ${student.codeforcesHandle}...`);

    // Fetch user info
    const userInfo = await fetchCodeforcesData(student.codeforcesHandle);

    student.currentRating = userInfo.currentRating;
    student.maxRating = userInfo.maxRating;

    // Fetch contest history
    try {
      const contests = await fetchContestHistory(student.codeforcesHandle);

      for (const contest of contests) {
        await Contest.findOneAndUpdate(
          { studentId: student._id, contestId: contest.contestId },
          {
            studentId: student._id,
            contestId: contest.contestId,
            contestName: contest.contestName,
            rank: contest.rank,
            oldRating: contest.oldRating,
            newRating: contest.newRating,
            ratingChange: contest.ratingChange,
            contestDate: contest.contestDate,
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error("Error fetching contests:", error.message);
    }

    // Fetch submissions
    try {
      const submissions = await fetchSubmissions(student.codeforcesHandle);

      for (const submission of submissions) {
        await Submission.findOneAndUpdate(
          { submissionId: submission.problemId },
          {
            studentId: student._id,
            submissionId: submission.problemId,
            problemName: submission.problemName,
            problemRating: submission.problemRating,
            verdict: submission.verdict,
            submissionTime: submission.submissionTime,
            language: submission.programmingLanguage,
          },
          { upsert: true }
        );
      }

      student.lastSubmissionDate = userInfo.lastSubmissionDate;
    } catch (error) {
      console.error("Error fetching submissions:", error.message);
    }

    student.lastDataUpdate = new Date();
    await student.save();

    console.log(`Data sync completed for ${student.codeforcesHandle}`);
  } catch (error) {
    console.error(
      `Error syncing data for student ${studentId}:`,
      error.message
    );
    throw error;
  }
}

async function syncAllStudentsData() {
  try {
    const students = await Student.find({ isActive: true });
    console.log(`Starting sync for ${students.length} students...`);

    for (const student of students) {
      try {
        await syncStudentData(student._id);
        await delay(2000); // Rate limiting between students
      } catch (error) {
        console.error(
          `Failed to sync data for ${student.codeforcesHandle}:`,
          error.message
        );
      }
    }

    console.log("All students data sync completed");
  } catch (error) {
    console.error("Error in syncAllStudentsData:", error);
    throw error;
  }
}

module.exports = {
  syncStudentData,
  syncAllStudentsData,
  fetchCodeforcesData,
  fetchContestHistory,
  fetchSubmissions
};
