import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const AddStudent = () => {
  const [student, setStudent] = useState({ Name: "", Roll_no: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleInput = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student.Name.trim() || !student.Roll_no.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:3000/students", student);
      setSuccess(`Student added: ${student.Name}`);
      setStudent({ Name: "", Roll_no: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 px-4">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-5 bg-gradient-to-r from-teal-50 to-sky-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-teal-500 to-sky-400 flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Add Student
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Register a new student
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {success && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name
            </label>
            <div className="relative">
              <input
                name="Name"
                value={student.Name}
                onChange={handleInput}
                required
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roll No
            </label>
            <input
              name="Roll_no"
              value={student.Roll_no}
              onChange={handleInput}
              required
              placeholder="e.g. 101"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition shadow-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg text-white bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 disabled:opacity-60 transition font-medium"
            >
              {loading ? "Saving..." : "Add Student"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStudent({ Name: "", Roll_no: "" });
                setError("");
                setSuccess("");
              }}
              className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-slate-700 hover:bg-gray-50"
            >
              Clear
            </button>
            <button onClick={() => navigate(-1)} className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-white text-sm">
              Go back
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Tip: Use full name and unique roll number.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
