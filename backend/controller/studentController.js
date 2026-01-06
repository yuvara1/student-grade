const { Student, Grade, Subject } = require("../model/schemas");
const ResponseHandler = require("../utils/responseHandler");
const { validateStudentInput } = require("../utils/validators");

exports.addStudent = async (req, res) => {
  const { Name, Roll_no } = req.body;

  // Validate input
  const errors = validateStudentInput(Name, Roll_no);
  if (errors.length > 0) {
    return ResponseHandler.validationError(res, errors);
  }

  try {
    // Check if student already exists
    const existing = await Student.findOne({ Roll_no });
    if (existing) {
      return ResponseHandler.error(
        res,
        409,
        `Student with Roll_no ${Roll_no} already exists`
      );
    }

    // Create new student
    const student = await Student.create({ Name, Roll_no });
    return ResponseHandler.success(res, 201, "Student added successfully", {
      Name: student.Name,
      Roll_no: student.Roll_no,
      _id: student._id,
    });
  } catch (error) {
    console.error("addStudent error:", error);
    if (error.code === 11000) {
      return ResponseHandler.error(
        res,
        409,
        "Student with this Roll_no or email already exists"
      );
    }
    return ResponseHandler.error(res, 500, "Failed to add student", error);
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ status: "active" })
      .select("Roll_no Name email phone status createdAt")
      .sort({ Roll_no: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Fetched all active students",
      rows: students,
    });
  } catch (error) {
    console.error("getStudents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: error.message,
    });
  }
};

exports.getStudentsWithSubject = async (req, res) => {
  try {
    const result = await Student.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "grades",
          localField: "Roll_no",
          foreignField: "student_id",
          as: "grades",
        },
      },
      { $unwind: { path: "$grades", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subjects",
          localField: "grades.subject_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      { $unwind: { path: "$subjectInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          Name: 1,
          Roll_no: 1,
          email: 1,
          subject: "$subjectInfo.subject",
        },
      },
      { $sort: { Roll_no: 1 } },
    ]);

    return ResponseHandler.success(res, 200, "Fetched students with subjects", {
      rows: result,
    });
  } catch (error) {
    console.error("getStudentsWithSubject error:", error);
    return ResponseHandler.error(
      res,
      500,
      "Failed to fetch students with subjects",
      error
    );
  }
};

exports.getAllStudentsWithGradeAndSubject = async (req, res) => {
  try {
    const result = await Student.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "grades",
          localField: "Roll_no",
          foreignField: "student_id",
          as: "grades",
        },
      },
      { $unwind: "$grades" },
      {
        $lookup: {
          from: "subjects",
          localField: "grades.subject_id",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      { $unwind: "$subjectInfo" },
      {
        $project: {
          Name: 1,
          Roll_no: 1,
          subject: "$subjectInfo.subject",
          id: "$subjectInfo._id",
          grade: "$grades.grade",
          gradePoints: "$grades.gradePoints",
          Attendence: "$grades.attendance",
          examinationDate: "$grades.examinationDate",
        },
      },
      { $sort: { Roll_no: 1, subject: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetched all students with grades and subjects",
      rows: result,
    });
  } catch (error) {
    console.error("getAllStudentsWithGradeAndSubject error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch students with grades and subjects",
      error: error.message,
    });
  }
};
