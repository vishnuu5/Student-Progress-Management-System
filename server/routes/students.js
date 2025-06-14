const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");
const { Parser } = require("json2csv");
const { syncStudentData } = require("../services/codeforcesService");

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
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
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();

    // Sync Codeforces data for new student
    try {
      await syncStudentData(savedStudent._id);
    } catch (syncError) {
      console.error("Error syncing new student data:", syncError);
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

    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put("/:id", async (req, res) => {
  try {
    const oldStudent = await Student.findById(req.params.id);
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If Codeforces handle changed, sync data immediately
    if (oldStudent.codeforcesHandle !== updatedStudent.codeforcesHandle) {
      try {
        await syncStudentData(updatedStudent._id);
      } catch (syncError) {
        console.error("Error syncing updated student data:", syncError);
      }
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete associated contests and submissions
    await Contest.deleteMany({ studentId: req.params.id });
    await Submission.deleteMany({ studentId: req.params.id });

    res.json({ message: "Student deleted successfully" });
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
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
