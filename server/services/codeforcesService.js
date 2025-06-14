const axios = require("axios");
const Student = require("../models/Student");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");

const CODEFORCES_API_BASE = "https://codeforces.com/api";

// Rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchCodeforcesData(endpoint, params = {}) {
  try {
    await delay(1000); // Rate limiting
    const response = await axios.get(`${CODEFORCES_API_BASE}${endpoint}`, {
      params,
    });

    if (response.data.status !== "OK") {
      throw new Error(`Codeforces API error: ${response.data.comment}`);
    }

    return response.data.result;
  } catch (error) {
    console.error("Codeforces API error:", error.message);
    throw error;
  }
}

async function syncStudentData(studentId) {
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    console.log(`Syncing data for ${student.codeforcesHandle}...`);

    // Fetch user info
    const userInfo = await fetchCodeforcesData("/user.info", {
      handles: student.codeforcesHandle,
    });

    if (userInfo && userInfo.length > 0) {
      const user = userInfo[0];
      student.currentRating = user.rating || 0;
      student.maxRating = user.maxRating || 0;
    }

    // Fetch contest history
    try {
      const contests = await fetchCodeforcesData("/user.rating", {
        handle: student.codeforcesHandle,
      });

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
            ratingChange: contest.newRating - contest.oldRating,
            contestTime: new Date(contest.ratingUpdateTimeSeconds * 1000),
          },
          { upsert: true }
        );
      }
    } catch (error) {
      console.error("Error fetching contests:", error.message);
    }

    // Fetch submissions
    try {
      const submissions = await fetchCodeforcesData("/user.status", {
        handle: student.codeforcesHandle,
        from: 1,
        count: 1000,
      });

      let lastSubmissionDate = null;

      for (const submission of submissions) {
        const submissionDate = new Date(submission.creationTimeSeconds * 1000);
        if (!lastSubmissionDate || submissionDate > lastSubmissionDate) {
          lastSubmissionDate = submissionDate;
        }

        await Submission.findOneAndUpdate(
          { submissionId: submission.id },
          {
            studentId: student._id,
            submissionId: submission.id,
            contestId: submission.contestId || 0,
            problemIndex: submission.problem.index,
            problemName: submission.problem.name,
            problemRating: submission.problem.rating || 0,
            verdict: submission.verdict,
            submissionTime: submissionDate,
            language: submission.programmingLanguage,
          },
          { upsert: true }
        );
      }

      student.lastSubmissionDate = lastSubmissionDate;
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
};
