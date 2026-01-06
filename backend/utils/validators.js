/**
 * Input Validation Utilities
 */

const validateStudentInput = (name, rollNo) => {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({
      field: "Name",
      message: "Name must be at least 2 characters",
    });
  }
  if (name && name.length > 100) {
    errors.push({
      field: "Name",
      message: "Name cannot exceed 100 characters",
    });
  }

  if (
    rollNo == null ||
    !Number.isInteger(Number(rollNo)) ||
    Number(rollNo) < 1
  ) {
    errors.push({
      field: "Roll_no",
      message: "Roll_no must be a positive integer",
    });
  }

  return errors;
};

const validateSubjectInput = (subjectName) => {
  const errors = [];

  if (
    !subjectName ||
    typeof subjectName !== "string" ||
    subjectName.trim().length < 2
  ) {
    errors.push({
      field: "subject",
      message: "Subject name must be at least 2 characters",
    });
  }
  if (subjectName && subjectName.length > 100) {
    errors.push({
      field: "subject",
      message: "Subject name cannot exceed 100 characters",
    });
  }

  return errors;
};

const validateGradeInput = (studentId, subjectId, grade, attendance) => {
  const errors = [];
  const VALID_GRADES = ["A", "B", "C", "D", "F"];

  if (
    studentId == null ||
    !Number.isInteger(Number(studentId)) ||
    Number(studentId) < 1
  ) {
    errors.push({
      field: "student_id",
      message: "student_id must be a positive integer",
    });
  }

  if (!subjectId || typeof subjectId !== "string") {
    errors.push({ field: "subject_id", message: "subject_id is required" });
  }

  if (!grade || !VALID_GRADES.includes(String(grade).trim().toUpperCase())) {
    errors.push({
      field: "grade",
      message: "grade must be one of: A, B, C, D, F",
    });
  }

  if (attendance != null) {
    const att = Number(attendance);
    if (!Number.isFinite(att) || att < 0 || att > 100) {
      errors.push({
        field: "attendance",
        message: "attendance must be between 0 and 100",
      });
    }
  }

  return errors;
};

const validateUserInput = (userId, email, password) => {
  const errors = [];

  if (!userId || typeof userId !== "string" || userId.trim().length < 3) {
    errors.push({
      field: "userId",
      message: "userId must be at least 3 characters",
    });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push({ field: "email", message: "Please provide a valid email" });
  }

  if (!password || password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters",
    });
  }

  return errors;
};

module.exports = {
  validateStudentInput,
  validateSubjectInput,
  validateGradeInput,
  validateUserInput,
};
