const { Router } = require("express");
const { getAverageGradePerSubject, getTopStudentsBySubject, getStudentRanklist, getTopStudentsOverall } = require("../controller/reportController");
const router = Router();

router.get("/", getAverageGradePerSubject); // subject averages
router.get("/top/:subject_id", getTopStudentsBySubject); // top 5 per subject
router.get("/top", getTopStudentsOverall);        // <-- top 5 overall (no subject)
router.get("/rank", getStudentRanklist); // overall ranklist

module.exports = router;