import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LETTER_SCORE = { A: 4, B: 3, C: 2, D: 1, F: 0 };

const gradeColor = (g) => {
  if (!g) return "bg-gray-100 text-gray-800";
  switch (g.toUpperCase()) {
    case "A":
      return "bg-emerald-100 text-emerald-800";
    case "B":
      return "bg-teal-100 text-teal-800";
    case "C":
      return "bg-amber-100 text-amber-800";
    case "D":
      return "bg-orange-100 text-orange-800";
    case "F":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Avatar = ({ name }) => {
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-teal-400 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
      {initials}
    </div>
  );
};

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [sortBy, setSortBy] = useState("Default");
  const [flag, setFlag] = useState(0);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const allStudents = await axios.get("http://localhost:3000/students/alldetails");
        setStudents(allStudents.data.rows || []);
      } catch (error) {
        console.log("Failed to fetch students", error);
        setStudents([]);
      }
    };
    fetchStudents();
  }, [flag]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/subjects");
        setSubjects(data.rows || []);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, []);

  let filteredStudents = [...students];

  if (searchQuery) {
    filteredStudents = filteredStudents.filter((student) =>
      student.Name?.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }

  if (subject && subject !== "All subjects") {
    filteredStudents = filteredStudents.filter((student) => student.subject === subject);
  }

  const getGradeScore = (row) => {
    if (!row) return -1;
    const g = (row.grade || "").toString().trim().toUpperCase();
    return LETTER_SCORE[g] ?? -1;
  };
  const getAttendanceValue = (row) => {
    const val = row?.Attendence ?? row?.attendance ?? null;
    if (val == null) return -1;
    const n = Number(val);
    return Number.isFinite(n) ? n : -1;
  };

  if (sortBy && sortBy !== "Default") {
    if (sortBy === "Name") {
      filteredStudents.sort((a, b) => (a.Name || "").localeCompare(b.Name || ""));
    } else if (sortBy === "Grades") {
      filteredStudents.sort((a, b) => {
        const sa = getGradeScore(a);
        const sb = getGradeScore(b);
        if (sa === sb) return (a.Name || "").localeCompare(b.Name || "");
        return sb - sa;
      });
    } else if (sortBy === "Attendance") {
      filteredStudents.sort((a, b) => {
        const aa = getAttendanceValue(a);
        const ab = getAttendanceValue(b);
        if (aa === ab) return (a.Name || "").localeCompare(b.Name || "");
        return ab - aa;
      });
    } else if (sortBy === "RollNo") {
      filteredStudents.sort((a, b) => (Number(a.Roll_no) || 0) - (Number(b.Roll_no) || 0));
    }
  }

  const handleDelete = async (student) => {
    if (!window.confirm("Delete this grade record?")) return;
    try {
      await axios.delete(`http://localhost:3000/grades/${student.Roll_no}/${student.id}`);
      setFlag((f) => f + 1);
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6">
      <div className="app-card">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <div className="relative flex-1">
                <svg className="w-5 h-5 absolute left-3 top-3 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-100 transition shadow-sm"
                />
              </div>

              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="px-3 py-2 border rounded-full bg-white text-sm shadow-sm">
                <option>All subjects</option>
                {subjects.map((s) => <option key={s.id} value={s.subject}>{s.subject}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-full bg-white text-sm shadow-sm">
                <option value="Default">Sort</option>
                <option value="Name">Name ↑</option>
                <option value="Grades">Grades (A → F)</option>
                <option value="Attendance">Attendance ↑</option>
                <option value="RollNo">Roll No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {filteredStudents.length === 0 ? (
            <div className="empty-state">No records found</div>
          ) : (
            <>
              {/* mobile cards */}
              <div className="sm:hidden space-y-3">
                {filteredStudents.map((student, i) => (
                  <div key={i} className="mobile-card">
                    <div className="flex items-start gap-3">
                      <Avatar name={student.Name} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{student.Name}</div>
                            <div className="text-xs text-gray-500">Roll No: {student.Roll_no}</div>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full font-medium ${gradeColor(student.grade)}`}>{student.grade ?? "-"}</div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm text-gray-700">{student.subject}</div>
                          <div className="text-sm text-gray-500">{student.Attendence ?? student.attendance ?? "-"}</div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Link to="/editgrade" state={student} className="flex-1 py-2 text-center rounded-md bg-indigo-50 text-indigo-600 text-sm">Edit</Link>
                          <button onClick={() => handleDelete(student)} className="flex-1 py-2 text-center rounded-md bg-red-50 text-red-600 text-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* table for sm+ */}
              <div className="hidden sm:block table-responsive no-scrollbar max-h-[72vh] overflow-y-auto">
                <table className="min-w-full divide-y" role="table">
                  <thead className="bg-white/90 backdrop-blur-sm sticky top-0 z-20">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Roll No</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Subject</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Grade</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Attendance</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="bg-white">
                    {filteredStudents.map((student, i) => (
                      <tr key={i} className={`hover:bg-gray-50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-teal-400 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                              {(student.Name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-900">{student.Name}</div>
                              <div className="text-xs text-gray-500">{student.email ?? ""}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">{student.Roll_no}</td>

                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">{student.subject}</td>

                        <td className="px-4 sm:px-6 py-4 text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${gradeColor(student.grade)}`}>
                            {student.grade ?? "-"}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">{student.Attendence ?? student.attendance ?? "-"}</td>

                        <td className="px-4 sm:px-6 py-4 text-right text-sm">
                          <div className="inline-flex items-center gap-2">
                            <Link to="/editgrade" state={student} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">Edit</Link>
                            <button onClick={() => handleDelete(student)} className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
