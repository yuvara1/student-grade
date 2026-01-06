const { Router } = require("express");
const {
  addStudent,
  getStudents,
  getStudentsWithSubject,
  getAllStudentsWithGradeAndSubject,
} = require("../controller/studentController");

const router = Router();

// POST /students
router.post("/", addStudent);
// GET  /students
router.get("/", getStudents);
// GET /students/details
router.get("/details", getStudentsWithSubject);
// GET /students/alldetails
router.get("/alldetails", getAllStudentsWithGradeAndSubject);

module.exports = router;
