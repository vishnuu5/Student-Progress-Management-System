const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const { Parser } = require("json2csv");

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
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// Get student by ID
router.get("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

// Create new student
router.post("/", async (req, res) => {
  try {
    // Validate required fields
    const { name, email, phoneNumber, codeforcesHandle } = req.body;

    if (!name || !email || !phoneNumber || !codeforcesHandle) {
      return res.status(400).json({
        message:
          "Missing required fields: name, email, phoneNumber, codeforcesHandle",
      });
    }

    const student = new Student(req.body);
    const savedStudent = await student.save();

    // Sync Codeforces data for new student (if service is available)
    if (syncStudentData) {
      try {
        // Don't await this in production to avoid timeout
        syncStudentData(savedStudent._id).catch((err) =>
          console.error("Background sync error:", err)
        );
      } catch (syncError) {
        console.error("Error starting sync for new student:", syncError);
      }
    }

    res.status(201).json(savedStudent);
  } catch (error) {
    console.error("Error creating student:", error);

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      const message = `A student with this ${field} already exists`;
      return res.status(400).json({ message });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(400).json({ message: "Failed to create student" });
  }
});

// Update student
router.put("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If Codeforces handle changed, sync data immediately (if service is available)
    if (
      syncStudentData &&
      oldStudent.codeforcesHandle !== updatedStudent.codeforcesHandle
    ) {
      try {
        // Don't await this in production to avoid timeout
        syncStudentData(updatedStudent._id).catch((err) =>
          console.error("Background sync error:", err)
        );
      } catch (syncError) {
        console.error("Error starting sync for updated student:", syncError);
      }
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = `A student with this ${field} already exists`;
      return res.status(400).json({ message });
    }

    res.status(400).json({ message: "Failed to update student" });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID format" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete associated contests and submissions
    await Promise.all([
      Contest.deleteMany({ studentId: req.params.id }),
      Submission.deleteMany({ studentId: req.params.id }),
    ]);

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Failed to delete student" });
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
