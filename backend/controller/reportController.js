const { Student, Grade, Subject } = require("../model/schemas");
const ResponseHandler = require("../utils/responseHandler");

const LETTER_TO_SCORE = { A: 4, B: 3, C: 2, D: 1, F: 0 };
const SCORE_TO_LETTER = (score) => {
  if (score === null) return null;
  if (score >= 3.5) return "A";
  if (score >= 2.5) return "B";
  if (score >= 1.5) return "C";
  if (score >= 0.5) return "D";
  return "F";
};

// Average grade per subject
exports.getAverageGradePerSubject = async (req, res) => {
  try {
    const subjects = await Subject.find().lean();
    const grades = await Grade.find().lean();

    const groups = {};
    subjects.forEach((sub) => {
      groups[sub._id.toString()] = {
        subject: sub.subject,
        subject_id: sub._id,
        grades: [],
      };
    });

    grades.forEach((g) => {
      const key = g.subject_id.toString();
      if (groups[key]) {
        groups[key].grades.push(g.gradePoints);
      }
    });

    const labels = [];
    const data = [];
    const outRows = [];

    Object.values(groups).forEach((g) => {
      const numeric = g.grades.filter((v) => v !== null);
      const avg = numeric.length
        ? Number(
            (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(2)
          )
        : null;
      labels.push(g.subject);
      const avgPercent =
        avg !== null ? Number(((avg / 4) * 100).toFixed(1)) : 0;
      data.push(avgPercent);
      outRows.push({
        subject: g.subject,
        subject_id: g.subject_id,
        avg_score: avg,
        avg_percent: avgPercent,
        count_grades: numeric.length,
      });
    });

    return ResponseHandler.success(
      res,
      200,
      "Fetched average grades per subject",
      {
        labels,
        data,
        rows: outRows,
      }
    );
  } catch (err) {
    console.error("getAverageGradePerSubject error:", err);
    return ResponseHandler.error(res, 500, "Failed to compute report", err);
  }
};

// Top 5 students for a subject
exports.getTopStudentsBySubject = async (req, res) => {
  const { subject_id } = req.params;
  if (!subject_id) {
    return ResponseHandler.error(res, 400, "subject_id is required");
  }

  try {
    const grades = await Grade.find({ subject_id }).lean();
    const studentIds = [...new Set(grades.map((g) => g.student_id))];
    const students = await Student.find({ Roll_no: { $in: studentIds } })
      .select("Name Roll_no")
      .lean();

    const studentMap = {};
    students.forEach((s) => (studentMap[s.Roll_no] = s.Name));

    const enriched = grades
      .map((g) => ({
        Name: studentMap[g.student_id] || "Unknown",
        Roll_no: g.student_id,
        grade: g.grade,
        gradePoints: g.gradePoints,
        attendance: g.attendance,
      }))
      .sort((a, b) => b.gradePoints - a.gradePoints)
      .slice(0, 5);

    return ResponseHandler.success(
      res,
      200,
      "Fetched top 5 students for subject",
      {
        rows: enriched,
      }
    );
  } catch (err) {
    console.error("getTopStudentsBySubject error:", err);
    return ResponseHandler.error(res, 500, "Failed to fetch top students", err);
  }
};

// Overall student ranklist
exports.getStudentRanklist = async (req, res) => {
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
      {
        $project: {
          Name: 1,
          Roll_no: 1,
          avg_score: { $avg: "$grades.gradePoints" },
          subjects_count: { $size: "$grades" },
        },
      },
      { $match: { subjects_count: { $gt: 0 } } },
      { $sort: { avg_score: -1 } },
    ]);

    const rankRows = result.map((r) => ({
      Name: r.Name,
      Roll_no: r.Roll_no,
      avg_score: r.avg_score ? Number(r.avg_score.toFixed(3)) : null,
      avg_percent: r.avg_score
        ? Number(((r.avg_score / 4) * 100).toFixed(1))
        : null,
      subjects_count: r.subjects_count,
      avg_letter: SCORE_TO_LETTER(r.avg_score),
    }));

    return res.status(200).json({
      success: true,
      message: "Fetched student ranklist",
      rows: rankRows,
    });
  } catch (err) {
    console.error("getStudentRanklist error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to compute ranklist",
      error: err.message,
    });
  }
};

// Top 5 students overall
exports.getTopStudentsOverall = async (req, res) => {
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
      {
        $project: {
          Name: 1,
          Roll_no: 1,
          avg_score: { $avg: "$grades.gradePoints" },
          subjects_count: { $size: "$grades" },
        },
      },
      { $match: { subjects_count: { $gt: 0 } } },
      { $sort: { avg_score: -1 } },
      { $limit: 5 },
    ]);

    const out = result.map((r) => ({
      Name: r.Name,
      Roll_no: r.Roll_no,
      avg_score: r.avg_score ? Number(r.avg_score.toFixed(3)) : null,
      avg_percent: r.avg_score
        ? Number(((r.avg_score / 4) * 100).toFixed(1))
        : null,
      subjects_count: r.subjects_count,
    }));

    return ResponseHandler.success(res, 200, "Fetched top 5 students overall", {
      rows: out,
    });
  } catch (err) {
    console.error("getTopStudentsOverall error:", err);
    return ResponseHandler.error(
      res,
      500,
      "Failed to fetch top students overall",
      err
    );
  }
};
