const { Router } = require("express");
const {
  addGrade,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  getSubjectGrades,
} = require("../controller/gradeController");

const router = Router();

router.post("/", addGrade);
router.delete("/:student_id/:subject_id", deleteGrade);
router.put("/update", updateGrade);
router.get("/student/:student_id", getStudentGrades);
router.get("/subject/:subject_id", getSubjectGrades);

module.exports = router;
