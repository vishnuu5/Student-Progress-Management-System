const express = require("express");
const router = express.Router();

// For CSV export, we'll use a simple manual approach first
const createCSV = (data) => {
  const headers = [
    "name",
    "email",
    "phoneNumber",
    "codeforcesHandle",
    "currentRating",
    "maxRating",
    "lastDataUpdate",
  ];
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle dates and escape commas
          if (value instanceof Date) {
            return `"${value.toISOString()}"`;
          }
          return `"${String(value || "").replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");
  return csvContent;
};

// Temporary in-memory storage for testing
const students = [
  {
    _id: "1",
    name: "Test Student",
    email: "test@example.com",
    phoneNumber: "1234567890",
    codeforcesHandle: "testuser",
    currentRating: 1200,
    maxRating: 1300,
    lastDataUpdate: new Date(),
    emailRemindersCount: 0,
    emailRemindersEnabled: true,
  },
];

// Get all students
router.get("/", (req, res) => {
  try {
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID
router.get("/:id", (req, res) => {
  try {
    const student = students.find((s) => s._id === req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new student
router.post("/", (req, res) => {
  try {
    const newStudent = {
      _id: Date.now().toString(),
      ...req.body,
      currentRating: 0,
      maxRating: 0,
      lastDataUpdate: new Date(),
      emailRemindersCount: 0,
      emailRemindersEnabled: true,
    };

    // Check for duplicate email
    if (students.find((s) => s.email === newStudent.email)) {
      return res
        .status(400)
        .json({ message: "A student with this email already exists" });
    }

    // Check for duplicate codeforces handle
    if (
      students.find((s) => s.codeforcesHandle === newStudent.codeforcesHandle)
    ) {
      return res
        .status(400)
        .json({
          message: "A student with this Codeforces handle already exists",
        });
    }

    students.push(newStudent);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put("/:id", (req, res) => {
  try {
    const index = students.findIndex((s) => s._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check for duplicate email (excluding current student)
    if (
      req.body.email &&
      students.find(
        (s) => s.email === req.body.email && s._id !== req.params.id
      )
    ) {
      return res
        .status(400)
        .json({ message: "A student with this email already exists" });
    }

    // Check for duplicate codeforces handle (excluding current student)
    if (
      req.body.codeforcesHandle &&
      students.find(
        (s) =>
          s.codeforcesHandle === req.body.codeforcesHandle &&
          s._id !== req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          message: "A student with this Codeforces handle already exists",
        });
    }

    students[index] = { ...students[index], ...req.body };
    res.json(students[index]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete("/:id", (req, res) => {
  try {
    const index = students.findIndex((s) => s._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Student not found" });
    }

    students.splice(index, 1);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export CSV
router.get("/export/csv", (req, res) => {
  try {
    const csv = createCSV(students);

    res.header("Content-Type", "text/csv");
    res.attachment("students.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
