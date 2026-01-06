const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => res.send("Student-grade backend running (MongoDB)"));

// API Routes
app.use("/students", require("./router/studentRouter"));
app.use("/grades", require("./router/gradeRouter"));
app.use("/subjects", require("./router/subjectRouter"));
app.use("/reports", require("./router/reportRouter"));

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`🚀 Server running on port: ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
