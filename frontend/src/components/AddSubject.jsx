import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddSubject = () => {
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert("Enter subject name");
      return;
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:3000/subjects", { subject: subject.trim() });
      alert("Subject added");
      setSubject("");
      navigate("/addgrades");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-gradient-to-r from-white/60 to-white/40 rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50 to-sky-50">
          <h2 className="text-2xl font-semibold text-slate-900">Add Subject</h2>
          <p className="text-sm text-slate-600 mt-1">Create a new subject for grading</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 bg-white">
          <label className="block text-sm font-medium text-slate-700">Subject name</label>

          <div className="relative">
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3 pointer-events-none" viewBox="0 0 24 24" fill="none">
              <path d="M12 2v20M5 9h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder-slate-400 transition"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-md text-white bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-600 hover:to-sky-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? "Saving..." : "Add Subject"}
            </button>

            <button
              type="button"
              onClick={() => setSubject("")}
              className="px-4 py-2 rounded-md border border-gray-200 bg-white text-slate-700 hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button onClick={() => navigate(-1)} className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-white text-sm">
              Go back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubject;