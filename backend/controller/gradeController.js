const { Grade, Student, Subject } = require("../model/schemas");
const ResponseHandler = require("../utils/responseHandler");
const { validateGradeInput } = require("../utils/validators");
const mongoose = require("mongoose");

const GRADE_TO_POINTS = { A: 4, B: 3, C: 2, D: 1, F: 0 };

exports.addGrade = async (req, res) => {
  const { student_id, subject_id, grade, attendance } = req.body;

  // Validate input
  const errors = validateGradeInput(student_id, subject_id, grade, attendance);
  if (errors.length > 0) {
    return ResponseHandler.validationError(res, errors);
  }

  const normalizedGrade = String(grade).trim().toUpperCase();
  const gradePoints = GRADE_TO_POINTS[normalizedGrade];

  try {
    // Check if student exists
    const student = await Student.findOne({ Roll_no: student_id });
    if (!student) {
      return ResponseHandler.error(
        res,
        404,
        `Student with Roll_no ${student_id} not found`
      );
    }

    // Check if subject exists
    if (!mongoose.Types.ObjectId.isValid(subject_id)) {
      return ResponseHandler.error(res, 400, "Invalid subject_id format");
    }
    const subject = await Subject.findById(subject_id);
    if (!subject) {
      return ResponseHandler.error(
        res,
        404,
        `Subject with ID ${subject_id} not found`
      );
    }

    // Check for existing grade
    const existing = await Grade.findOne({ student_id, subject_id });
    if (existing) {
      return ResponseHandler.error(
        res,
        409,
        `Grade already exists for this student-subject combination. Use update instead.`
      );
    }

    // Create new grade
    const newGrade = await Grade.create({
      student_id,
      subject_id,
      grade: normalizedGrade,
      gradePoints,
      attendance: attendance != null ? Number(attendance) : null,
    });

    return ResponseHandler.success(res, 201, "Grade added successfully", {
      _id: newGrade._id,
      student_id: newGrade.student_id,
      subject_id: newGrade.subject_id,
      grade: newGrade.grade,
      gradePoints: newGrade.gradePoints,
      attendance: newGrade.attendance,
      createdAt: newGrade.createdAt,
    });
  } catch (error) {
    console.error("addGrade error:", error);
    if (error.code === 11000) {
      return ResponseHandler.error(
        res,
        409,
        "Grade already exists for this student-subject combination"
      );
    }
    return ResponseHandler.error(res, 500, "Failed to add grade", error);
  }
};

exports.updateGrade = async (req, res) => {
  const { student_id, subject_id, grade, attendance } = req.body;

  // Validate input
  const errors = validateGradeInput(student_id, subject_id, grade, attendance);
  if (errors.length > 0) {
    return ResponseHandler.validationError(res, errors);
  }

  const normalizedGrade = String(grade).trim().toUpperCase();
  const gradePoints = GRADE_TO_POINTS[normalizedGrade];

  try {
    const updatedGrade = await Grade.findOneAndUpdate(
      { student_id, subject_id },
      {
        grade: normalizedGrade,
        gradePoints,
        attendance: attendance != null ? Number(attendance) : null,
      },
      { new: true, runValidators: true }
    );

    if (!updatedGrade) {
      return ResponseHandler.error(
        res,
        404,
        "Grade not found for this student-subject combination"
      );
    }

    return ResponseHandler.success(res, 200, "Grade updated successfully", {
      _id: updatedGrade._id,
      student_id: updatedGrade.student_id,
      subject_id: updatedGrade.subject_id,
      grade: updatedGrade.grade,
      gradePoints: updatedGrade.gradePoints,
      attendance: updatedGrade.attendance,
      updatedAt: updatedGrade.updatedAt,
    });
  } catch (error) {
    console.error("updateGrade error:", error);
    return ResponseHandler.error(res, 500, "Failed to update grade", error);
  }
};

exports.deleteGrade = async (req, res) => {
  const { student_id, subject_id } = req.params;

  if (!student_id || !subject_id) {
    return ResponseHandler.error(
      res,
      400,
      "Both student_id and subject_id are required"
    );
  }

  try {
    const deletedGrade = await Grade.findOneAndDelete({
      student_id,
      subject_id,
    });

    if (!deletedGrade) {
      return ResponseHandler.error(
        res,
        404,
        "Grade not found for this student-subject combination"
      );
    }

    return ResponseHandler.success(res, 200, "Grade deleted successfully", {
      student_id: deletedGrade.student_id,
      subject_id: deletedGrade.subject_id,
      grade: deletedGrade.grade,
    });
  } catch (error) {
    console.error("deleteGrade error:", error);
    return ResponseHandler.error(res, 500, "Failed to delete grade", error);
  }
};

exports.getStudentGrades = async (req, res) => {
  const { student_id } = req.params;

  if (!student_id) {
    return ResponseHandler.error(res, 400, "student_id is required");
  }

  try {
    const grades = await Grade.find({ student_id })
      .populate("subject_id", "subject code")
      .sort({ createdAt: -1 })
      .lean();

    return ResponseHandler.success(res, 200, "Fetched student grades", {
      rows: grades,
      count: grades.length,
    });
  } catch (error) {
    console.error("getStudentGrades error:", error);
    return ResponseHandler.error(
      res,
      500,
      "Failed to fetch student grades",
      error
    );
  }
};

exports.getSubjectGrades = async (req, res) => {
  const { subject_id } = req.params;

  if (!subject_id) {
    return ResponseHandler.error(res, 400, "subject_id is required");
  }

  try {
    const grades = await Grade.find({ subject_id })
      .sort({ gradePoints: -1, student_id: 1 })
      .lean();

    // Populate student names manually
    const studentIds = [...new Set(grades.map((g) => g.student_id))];
    const students = await Student.find({ Roll_no: { $in: studentIds } })
      .select("Roll_no Name")
      .lean();

    const studentMap = {};
    students.forEach((s) => (studentMap[s.Roll_no] = s.Name));

    const enrichedGrades = grades.map((g) => ({
      ...g,
      studentName: studentMap[g.student_id] || "Unknown",
    }));

    return ResponseHandler.success(res, 200, "Fetched subject grades", {
      rows: enrichedGrades,
      count: enrichedGrades.length,
    });
  } catch (error) {
    console.error("getSubjectGrades error:", error);
    return ResponseHandler.error(
      res,
      500,
      "Failed to fetch subject grades",
      error
    );
  }
};
