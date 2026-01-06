import axios from "axios";
import React, { useState } from "react";

const LETTERS = ["A", "B", "C", "D", "F"];

const Grade = ({ student, subject, onSaved }) => {
  const [grade, setGrade] = useState("");
  const [attendance, setAttendance] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddGrade = async (e) => {
    e.preventDefault();
    if (!grade) return alert("Please select a grade");
    const attVal = attendance === "" ? null : Number(attendance);
    if (
      attendance !== "" &&
      (!Number.isFinite(attVal) || attVal < 0 || attVal > 100)
    ) {
      return alert("Attendance must be a number between 0 and 100");
    }
    const payload = {
      grade,
      student_id: student.Roll_no,
      subject_id: subject._id || subject.id,
      attendance: attVal,
    };
    try {
      setLoading(true);
      await axios.post("http://localhost:3000/grades", payload);
      setGrade("");
      setAttendance("");
      if (typeof onSaved === "function") onSaved({ student, subject, payload });
      else alert("Grade added");
    } catch (error) {
      console.error("Add grade error", error);
      alert(error?.response?.data?.message || "Failed to add grade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleAddGrade}
      className="bg-white p-4 rounded-md shadow-sm max-w-md form-compact"
    >
      <div className="mb-3 text-sm text-gray-700">
        Add grade for <span className="font-semibold">{student.Name}</span> —{" "}
        <span className="text-teal-600 font-medium">{subject.subject}</span>
      </div>

      <select
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="w-full px-4 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-teal-200"
      >
        <option value="">Select grade</option>
        {LETTERS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <input
        value={attendance}
        onChange={(e) => setAttendance(e.target.value)}
        type="number"
        min="0"
        max="100"
        placeholder="Attendance (0-100) — optional"
        className="w-full px-4 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-teal-200"
      />

      <div className="flex gap-3 btn-stack">
        <button
          disabled={loading}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white rounded-md"
        >
          {loading ? "Saving..." : "Add Grade"}
        </button>
        <button
          type="button"
          onClick={() => {
            setGrade("");
            setAttendance("");
          }}
          className="px-4 py-2 border rounded-md text-gray-700"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default Grade;
