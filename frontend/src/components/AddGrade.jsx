import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AddGrade = () => {
  const navigate = useNavigate();
  const [studentList, setStudentList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [updatingStudent, setUpdatingStudent] = useState();
  const [gradesMap, setGradesMap] = useState({}); // { subjectId: { grade, attendance, id } }
  const [editing, setEditing] = useState({
    subjectId: null,
    grade: "",
    attendance: "",
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setListLoading(true);
        const { data } = await axios.get("http://localhost:3000/students");
        setStudentList(data.rows || []);
      } catch (error) {
        console.error("Failed to fetch students", error);
        setStudentList([]);
      } finally {
        setListLoading(false);
      }
    };
    const fetchSubjects = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/subjects");
        setSubjects(data.rows || []);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
        setSubjects([]);
      }
    };
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchStudentGrades = async () => {
      if (!updatingStudent) {
        setGradesMap({});
        return;
      }
      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:3000/students/alldetails"
        );
        const rows = data.rows || [];
        const studentRows = rows.filter(
          (r) => String(r.Roll_no) === String(updatingStudent.Roll_no)
        );
        const map = {};
        studentRows.forEach((r) => {
          map[r.id] = {
            grade: r.grade,
            attendance: r.Attendence ?? r.attendance ?? null,
          }; // handle naming
        });
        setGradesMap(map);
      } catch (err) {
        console.error("Failed to fetch student grades", err);
        setGradesMap({});
      } finally {
        setLoading(false);
      }
    };
    fetchStudentGrades();
  }, [updatingStudent]);

  const startEdit = (subjectId) => {
    const existing = gradesMap[subjectId] || {};
    setEditing({
      subjectId,
      grade: existing.grade || "",
      attendance: existing.attendance ?? "",
    });
  };

  const cancelEdit = () =>
    setEditing({ subjectId: null, grade: "", attendance: "" });

  const handleSave = async () => {
    if (!editing.subjectId || !updatingStudent) return;
    const payload = {
      student_id: updatingStudent.Roll_no,
      subject_id: editing.subjectId,
      grade: editing.grade,
      attendance: editing.attendance === "" ? null : Number(editing.attendance),
    };

    try {
      // if grade exists -> update, else create
      const exists =
        gradesMap[editing.subjectId] &&
        gradesMap[editing.subjectId].grade != null;
      if (exists) {
        await axios.put("http://localhost:3000/grades/update", {
          student_id: payload.student_id,
          subject_id: payload.subject_id,
          grade: payload.grade,
          attendance: payload.attendance,
        });
      } else {
        await axios.post("http://localhost:3000/grades", payload);
      }

      // update local map without full reload
      setGradesMap((prev) => ({
        ...prev,
        [editing.subjectId]: {
          grade: payload.grade,
          attendance: payload.attendance,
        },
      }));
      cancelEdit();
    } catch (err) {
      console.error("Failed to save grade", err);
      alert(err?.response?.data?.message || "Failed to save grade");
    }
  };

  const handleDelete = async (subjectId) => {
    if (!updatingStudent) return;
    if (!window.confirm("Delete this grade?")) return;
    try {
      await axios.delete(
        `http://localhost:3000/grades/${updatingStudent.Roll_no}/${subjectId}`
      );
      setGradesMap((prev) => {
        const next = { ...prev };
        delete next[subjectId];
        return next;
      });
    } catch (err) {
      console.error("Delete failed", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const filteredStudents = studentList
    .filter(
      (s) =>
        !query ||
        String(s.Name || "")
          .toLowerCase()
          .includes(query.trim().toLowerCase())
    )
    .slice(0, 200);

  return (
    // fixed viewport height, panels scroll independently
    <div className="h-[90vh] flex flex-col md:flex-row gap-6 p-4 md:p-6">
      {/* Left Panel - Student List */}
      {/* small go-back button on mobile / top-level */}
      <div className="w-full md:hidden mb-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-white text-sm"
        >
          ← Go back
        </button>
      </div>
      <aside className="w-full md:w-1/3 bg-gradient-to-b from-white/80 to-white rounded-xl border border-gray-100 shadow-sm p-3 md:p-4 overflow-auto no-scrollbar min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-slate-900">Students</h1>
          <div className="text-xs text-gray-500">
            {listLoading ? "Loading…" : `${studentList.length}`}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students..."
            className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <button
            onClick={() => {
              setQuery("");
            }}
            className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm text-slate-700 hover:bg-gray-50"
            title="Clear"
          >
            Clear
          </button>
        </div>

        {listLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredStudents.length === 0 && (
              <div className="text-sm text-gray-500 p-3">
                No students found.
              </div>
            )}
            {filteredStudents.map((student) => (
              <li
                key={student.Roll_no}
                onClick={() => setUpdatingStudent(student)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-shadow ${
                  updatingStudent?.Roll_no === student.Roll_no
                    ? "ring-2 ring-teal-200 bg-white"
                    : "hover:shadow-md bg-white/60"
                }`}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-teal-400 to-sky-400 text-white flex items-center justify-center font-semibold">
                  {(student.Name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {student.Name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Roll: {student.Roll_no}
                  </div>
                </div>

                <div className="text-xs text-gray-400">›</div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Right panel - Subjects table */}
      <main className="w-full md:w-2/3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 flex flex-col overflow-hidden min-h-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Set Grades</h2>
            <div className="text-sm text-gray-500">
              {updatingStudent
                ? `${updatingStudent.Name} — Roll ${updatingStudent.Roll_no}`
                : "Select a student to manage grades"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setUpdatingStudent(null);
                setGradesMap({});
                setEditing({ subjectId: null, grade: "", attendance: "" });
              }}
              className="px-3 py-1 text-sm bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
            >
              Clear
            </button>
            <button
              onClick={() => navigate(-1)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-white text-sm"
            >
              Go back
            </button>
          </div>
        </div>

        {!updatingStudent ? (
          <div className="empty-state text-gray-600">
            Select a student on the left to view and add grades per subject.
          </div>
        ) : (
          <>
            {loading ? (
              <div className="space-y-3">
                <div className="h-8 w-1/3 rounded bg-gray-100 animate-pulse" />
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-auto flex-1 min-h-0 table-responsive no-scrollbar">
                <table className="min-w-full divide-y">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Attendance
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y">
                    {subjects.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-6 text-sm text-gray-500">
                          No subjects available.
                        </td>
                      </tr>
                    )}

                    {subjects.map((sub) => {
                      // Ensure subject has a unique ID
                      const subjectId = sub._id || sub.id;
                      const g = gradesMap[subjectId] || {};
                      const isEditing = editing.subjectId === subjectId;
                      return (
                        <tr key={subjectId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{sub.subject}</td>

                          <td className="px-4 py-3 text-sm w-40">
                            {!isEditing ? (
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  g.grade
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {g.grade ?? "-"}
                              </span>
                            ) : (
                              <select
                                value={editing.grade}
                                onChange={(e) =>
                                  setEditing((s) => ({
                                    ...s,
                                    grade: e.target.value,
                                  }))
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm"
                              >
                                <option key="select" value="">
                                  Select
                                </option>
                                {["A", "B", "C", "D", "F"].map((grade) => (
                                  <option key={grade} value={grade}>
                                    {grade}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm w-40">
                            {!isEditing ? (
                              g.attendance != null ? (
                                g.attendance
                              ) : (
                                "-"
                              )
                            ) : (
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={editing.attendance}
                                onChange={(e) =>
                                  setEditing((s) => ({
                                    ...s,
                                    attendance: e.target.value,
                                  }))
                                }
                                className="w-full px-2 py-1 border border-gray-200 rounded-md text-sm"
                              />
                            )}
                          </td>

                          <td className="px-4 py-3 text-right text-sm">
                            {!isEditing ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => startEdit(subjectId)}
                                  className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-sm hover:bg-indigo-100"
                                >
                                  {g.grade ? "Edit" : "Add"}
                                </button>
                                {g.grade && (
                                  <button
                                    onClick={() => handleDelete(subjectId)}
                                    className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm hover:bg-red-100"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={handleSave}
                                  className="px-3 py-1 bg-teal-500 text-white rounded-md text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-1 border border-gray-200 rounded-md text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AddGrade;
