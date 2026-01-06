const mongoose = require("mongoose");
const { Student, Subject, Grade, User } = require("./model/schemas");
require("dotenv").config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/student_grade";
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Student.deleteMany({});
    await Subject.deleteMany({});
    await Grade.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create sample students
    const students = await Student.create([
      {
        Roll_no: 1001,
        Name: "YUVARAJ",
        email: "yuvaraj@gmail.com",
        phone: "9443883036",
      },
      {
        Roll_no: 1002,
        Name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9443883037",
      },
      {
        Roll_no: 1003,
        Name: "Surya Prakash",
        email: "suriya@gmail.com",
        phone: "9443883038",
      },
    ]);
    console.log(`✅ Created ${students.length} students`);

    // Create sample subjects
    const subjects = await Subject.create([
      {
        subject: "DSA",
        code: "DSA041",
        description: "Basic DSA concepts",
      },
      {
        subject: "JAVA",
        code: "JAVA101",
        description: "Introduction to Java programming",
      },
      {
        subject: "JAVASCRIPT",
        code: "JS101",
        description: "Introduction to JavaScript programming",
      },
      {
        subject: "WEB DEVELOPMENT",
        code: "WEB101",
        description: "Introduction to web development",
      },
      {
        subject: "MYSQL",
        code: "MYSQL101",
        description: "Introduction to MySQL database",
      },
    ]);
    console.log(`✅ Created ${subjects.length} subjects`);

    // Create sample grades (all students x all subjects)
    const grades = [];
    const gradeLetters = ["A", "B", "C", "D", "F"];
    const gradePoints = { A: 4, B: 3, C: 2, D: 1, F: 0 };

    for (const student of students) {
      for (const subject of subjects) {
        const randomGrade =
          gradeLetters[Math.floor(Math.random() * gradeLetters.length)];
        grades.push({
          student_id: student.Roll_no,
          subject_id: subject._id,
          grade: randomGrade,
          gradePoints: gradePoints[randomGrade],
          attendance: Math.floor(Math.random() * 41) + 60, // Random 60-100
        });
      }
    }

    await Grade.create(grades);
    console.log(`✅ Created ${grades.length} grade records`);

    // Create sample users
    const users = await User.create([
      {
        userId: "teacher01",
        email: "teacher@example.com",
        password: "password123",
        role: "teacher",
      },
      {
        userId: "admin01",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Summary
    console.log("\n📊 Database seeded successfully!");
    console.log(`   Students: ${students.length}`);
    console.log(`   Subjects: ${subjects.length}`);
    console.log(`   Grades: ${grades.length}`);
    console.log(`   Users: ${users.length}`);

    console.log("\n🔗 Test the API:");
    console.log("   GET http://localhost:3000/students");
    console.log("   GET http://localhost:3000/subjects");
    console.log("   GET http://localhost:3000/students/alldetails");

    mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
