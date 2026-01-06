import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Grade from "./Grade";

const SetSubNGrade = ({ student }) => {
  const [subjectList, setSubjectList] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [updatingSubject, setUpdatingSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchSubject = async () => {
      setLoading(true);
      setError("");
      try {
        let { data } = await axios.get("http://localhost:3000/subjects");
        const list = data.rows || [];
        setSubjectList(list);
        setFilteredSubjects(list);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
        setError("Failed to load subjects");
        setSubjectList([]);
        setFilteredSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, []);

  useEffect(() => {
    if (!query) return setFilteredSubjects(subjectList);
    const q = query.trim().toLowerCase();
    setFilteredSubjects(
      subjectList.filter((s) => s.subject.toLowerCase().includes(q))
    );
  }, [query, subjectList]);

  useEffect(() => {
    setUpdatingSubject(null);
  }, [student]);

  const handleGradeSaved = ({ student: s, subject: sub }) => {
    setSuccessMsg(`Grade saved for ${s.Name} — ${sub.subject}`);
    setTimeout(() => setSuccessMsg(""), 2500);
    setUpdatingSubject(null);
  };

  if (!student) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">No student selected</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please select a student from the left panel to set grades.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-semibold">
          Updating report of{" "}
          <span className="text-teal-600">{student?.Name}</span>
        </h1>
        <div className="text-sm text-gray-500">Roll No: {student?.Roll_no}</div>
      </div>

      <section className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-auto md:h-[68vh]">
        <div className="w-full md:w-1/3 app-card p-4 flex flex-col max-h-80 md:max-h-full no-scrollbar">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Subjects</h2>
            <Link
              to="/addsubject"
              className="text-sm text-teal-600 hover:underline"
            >
              Add
            </Link>
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects..."
            className="w-full px-3 py-2 mb-3 border rounded-md focus:ring-2 focus:ring-teal-200"
          />

          <div className="overflow-y-auto flex-1">
            <ul className="space-y-2">
              {filteredSubjects.map((s) => {
                const subId = s._id || s.id;
                return (
                  <li
                    key={subId}
                    onClick={() => setUpdatingSubject(s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setUpdatingSubject(s);
                    }}
                    className={`p-3 rounded-md cursor-pointer transition flex justify-between items-center ${
                      (updatingSubject?._id || updatingSubject?.id) === subId
                        ? "bg-teal-50 border border-teal-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm">{s.subject}</span>
                    {(updatingSubject?._id || updatingSubject?.id) ===
                      subId && (
                      <span className="text-xs text-teal-600">Selected</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-2/3 app-card p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 sticky-top">
            <h2 className="text-lg font-semibold">Set Grade</h2>
            {updatingSubject && (
              <button
                type="button"
                onClick={() => setUpdatingSubject(null)}
                className="text-sm px-3 py-1 border rounded-md text-gray-700 hover:bg-white"
              >
                Clear selection
              </button>
            )}
          </div>

          {successMsg && (
            <div className="mb-3 text-sm text-green-600">{successMsg}</div>
          )}

          <div className="overflow-y-auto flex-1 min-h-0 table-responsive">
            {!updatingSubject && (
              <div className="text-gray-500">
                Select a subject on the left to add grade and attendance for{" "}
                <span className="font-medium">{student.Name}</span>.
              </div>
            )}

            {updatingSubject && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium">
                    {updatingSubject.subject}
                  </h3>
                </div>

                <Grade
                  student={student}
                  subject={updatingSubject}
                  onSaved={handleGradeSaved}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SetSubNGrade;
