const mongoose = require("mongoose");

// ============================================
// STUDENT SCHEMA
// ============================================
const studentSchema = new mongoose.Schema(
  {
    Roll_no: {
      type: Number,
      required: [true, "Roll number is required"],
      unique: true,
      index: true,
      min: [1, "Roll number must be positive"],
    },
    Name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated"],
      default: "active",
    },
  },
  {
    timestamps: true,
    collection: "students",
  }
);

studentSchema.index({ Roll_no: 1, email: 1 });

// ============================================
// SUBJECT SCHEMA
// ============================================
const subjectSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject name is required"],
      trim: true,
      unique: true,
      index: true,
      minlength: [2, "Subject name must be at least 2 characters"],
      maxlength: [100, "Subject name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "subjects",
  }
);

// ============================================
// GRADE SCHEMA
// ============================================
const gradeSchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
      required: [true, "Student ID is required"],
      ref: "Student",
      index: true,
    },
    subject_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Subject ID is required"],
      ref: "Subject",
      index: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      enum: {
        values: ["A", "B", "C", "D", "F"],
        message: "Grade must be one of: A, B, C, D, F",
      },
    },
    gradePoints: {
      type: Number,
      enum: [4, 3, 2, 1, 0],
      required: true,
    },
    attendance: {
      type: Number,
      default: null,
      min: [0, "Attendance cannot be less than 0"],
      max: [100, "Attendance cannot exceed 100"],
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
    examinationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "grades",
  }
);

// Compound unique index: each student can have only one grade per subject
gradeSchema.index({ student_id: 1, subject_id: 1 }, { unique: true });
gradeSchema.index({ subject_id: 1, grade: 1 });
gradeSchema.index({ createdAt: -1 });

// ============================================
// USER SCHEMA (Authentication)
// ============================================
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      index: true,
      trim: true,
      minlength: [3, "User ID must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "teacher",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// ============================================
// MODEL CREATION
// ============================================
const Student = mongoose.model("Student", studentSchema);
const Subject = mongoose.model("Subject", subjectSchema);
const Grade = mongoose.model("Grade", gradeSchema);
const User = mongoose.model("User", userSchema);

module.exports = { Student, Subject, Grade, User };
