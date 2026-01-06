const { Subject } = require("../model/schemas");
const ResponseHandler = require("../utils/responseHandler");
const { validateSubjectInput } = require("../utils/validators");
const { Router } = require("express");

const router = Router();

// GET /subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .select("subject code description isActive createdAt")
      .sort({ subject: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Fetched all subjects",
      rows: subjects.map((s) => ({
        _id: s._id,
        subject: s.subject,
        code: s.code,
        description: s.description,
        isActive: s.isActive,
        createdAt: s.createdAt,
      })),
    });
  } catch (error) {
    console.error("subjectRouter GET / error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subjects",
      error: error.message,
    });
  }
});

// POST /subjects
router.post("/", async (req, res) => {
  const { subject } = req.body;

  const errors = validateSubjectInput(subject);
  if (errors.length > 0) {
    return ResponseHandler.validationError(res, errors);
  }

  const trimmed = subject.toString().trim();

  try {
    const existing = await Subject.findOne({ subject: trimmed });
    if (existing) {
      return ResponseHandler.error(res, 409, "Subject already exists");
    }

    const newSubject = await Subject.create({ subject: trimmed });
    return ResponseHandler.success(res, 201, "Subject added successfully", {
      _id: newSubject._id,
      subject: newSubject.subject,
      createdAt: newSubject.createdAt,
    });
  } catch (error) {
    console.error("subjectRouter POST / error:", error);
    if (error.code === 11000) {
      return ResponseHandler.error(res, 409, "Subject already exists");
    }
    return ResponseHandler.error(res, 500, "Failed to add subject", error);
  }
});

module.exports = router;
