const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const { Parser } = require("json2csv");
const { fetchCodeforcesData } = require('../services/codeforcesService');

// Import service only when needed to avoid circular dependencies
let syncStudentData;
try {
  const codeforcesService = require("../services/codeforcesService");
  syncStudentData = codeforcesService.syncStudentData;
} catch (error) {
  console.warn("Codeforces service not available:", error.message);
}

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find({ isActive: true });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post("/", async (req, res) => {
  try {
    const { name, email, phoneNumber, codeforcesHandle } = req.body;

    // Check if student with same email or CF handle exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { codeforcesHandle }]
    });

    if (existingStudent) {
      return res.status(400).json({
        message: 'Student with this email or Codeforces handle already exists'
      });
    }

    // Fetch initial Codeforces data
    const cfData = await fetchCodeforcesData(codeforcesHandle);

    const student = new Student({
      name,
      email,
      phoneNumber,
      codeforcesHandle,
      currentRating: cfData.currentRating,
      maxRating: cfData.maxRating,
      lastDataUpdate: new Date(),
      lastSubmissionDate: cfData.lastSubmissionDate
    });

    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update student
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phoneNumber, codeforcesHandle, emailRemindersEnabled } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if email or CF handle is being changed and if it's already taken
    if (email !== student.email || codeforcesHandle !== student.codeforcesHandle) {
      const existingStudent = await Student.findOne({
        _id: { $ne: student._id },
        $or: [{ email }, { codeforcesHandle }]
      });

      if (existingStudent) {
        return res.status(400).json({
          message: 'Student with this email or Codeforces handle already exists'
        });
      }
    }

    // If CF handle is changed, fetch new data
    if (codeforcesHandle !== student.codeforcesHandle) {
      const cfData = await fetchCodeforcesData(codeforcesHandle);
      student.currentRating = cfData.currentRating;
      student.maxRating = cfData.maxRating;
      student.lastDataUpdate = new Date();
      student.lastSubmissionDate = cfData.lastSubmissionDate;
    }

    // Update other fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    student.codeforcesHandle = codeforcesHandle || student.codeforcesHandle;
    if (emailRemindersEnabled !== undefined) {
      student.emailRemindersEnabled = emailRemindersEnabled;
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete student (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.isActive = false;
    await student.save();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const stats = {
      currentRating: student.currentRating,
      maxRating: student.maxRating,
      lastDataUpdate: student.lastDataUpdate,
      lastSubmissionDate: student.lastSubmissionDate,
      emailRemindersCount: student.emailRemindersCount,
      emailRemindersEnabled: student.emailRemindersEnabled
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download students as CSV
router.get("/export/csv", async (req, res) => {
  try {
    const students = await Student.find();
    const fields = [
      "name",
      "email",
      "phoneNumber",
      "codeforcesHandle",
      "currentRating",
      "maxRating",
      "lastDataUpdate",
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(students);

    res.header("Content-Type", "text/csv");
    res.attachment("students.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ message: "Failed to export CSV" });
  }
});

module.exports = router;
