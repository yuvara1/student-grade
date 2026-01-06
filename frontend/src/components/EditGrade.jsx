import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EditGrade = () => {
  const location = useLocation();
  const student = location.state || {};
  const navigate = useNavigate();
  const [grade, setGrade] = useState(student.grade ?? "");
  const [attendance, setAttendance] = useState(student.Attendence ?? "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put("http://localhost:3000/grades/update", {
        grade,
        student_id: student.Roll_no,
        subject_id: student._id || student.id,
        attendance: attendance === "" ? null : Number(attendance),
      });
      alert("Grade updated successfully");
      navigate("/");
    } catch (err) {
      console.error("Update failed", err);
      alert(err?.response?.data?.message || "Failed to update grade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-6"
      >
        <h1 className="text-xl font-semibold mb-4">Update Grade</h1>
        <div className="mb-4 text-sm text-gray-600">
          Student: <span className="font-medium">{student.Name}</span> —
          Subject:{" "}
          <span className="font-medium text-teal-600">{student.subject}</span>
        </div>
        <input
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full px-4 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-teal-200"
          placeholder="Grade (A/B/C/D/F)"
        />
        <input
          value={attendance}
          onChange={(e) => setAttendance(e.target.value)}
          type="number"
          min="0"
          max="100"
          className="w-full px-4 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-teal-200"
          placeholder="Attendance (0-100)"
          required
        />
        <button
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md"
        >
          {loading ? "Updating..." : "Update Grade"}
        </button>
      </form>
    </div>
  );
};

export default EditGrade;
