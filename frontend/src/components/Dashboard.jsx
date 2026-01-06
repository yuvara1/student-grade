import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import StudentTable from "./StudentTable";

const StatCard = ({ title, value, subtitle, accent = "from-teal-400 to-sky-400" }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-tr ${accent} flex items-center justify-center text-white text-lg font-semibold`}>
      {typeof value === "number" ? value : (value ? value.toString().charAt(0) : "•")}
    </div>
    <div className="flex-1">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold text-slate-900">{value ?? "—"}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [studentsCount, setStudentsCount] = useState(0);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState("—");
  const [topStudent, setTopStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // students (use /students/alldetails if available)
        const studentsRes = await axios.get("http://localhost:3000/students/alldetails").catch(() => axios.get("http://localhost:3000/students"));
        const studentRows = (studentsRes?.data?.rows) || (studentsRes?.data) || [];
        // unique students by Roll_no
        const unique = new Set((studentRows || []).map((r) => String(r.Roll_no)));
        const sCount = unique.size || 0;

        // subjects
        const subRes = await axios.get("http://localhost:3000/subjects").catch(() => ({ data: { rows: [] } }));
        const subs = subRes?.data?.rows || subRes?.data || [];
        const subCount = (Array.isArray(subs) ? subs.length : 0);

        // avg attendance: compute numeric values from rows
        const attVals = (studentRows || [])
          .map((r) => {
            const a = r.Attendence ?? r.attendance ?? r.att ?? null;
            const n = a == null || a === "" ? NaN : Number(a);
            return Number.isFinite(n) ? n : NaN;
          })
          .filter((v) => Number.isFinite(v));
        const avgAtt = attVals.length ? Math.round((attVals.reduce((a, b) => a + b, 0) / attVals.length) * 10) / 10 : "—";

        // top student overall (endpoint may be /reports/top)
        let top = null;
        try {
          const topRes = await axios.get("http://localhost:3000/reports/top");
          const topRows = topRes?.data?.rows || [];
          if (topRows.length) top = topRows[0];
        } catch (e) {
          // fallback: use /reports/rank first entry
          try {
            const rankRes = await axios.get("http://localhost:3000/reports/rank");
            const rankRows = rankRes?.data?.rows || [];
            if (rankRows.length) top = rankRows[0];
          } catch (ee) {
            top = null;
          }
        }

        if (!mounted) return;
        setStudentsCount(sCount);
        setSubjectsCount(subCount);
        setAvgAttendance(avgAtt === "—" ? "—" : `${avgAtt}%`);
        setTopStudent(top);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load dashboard stats");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of students, grades and reports</p>
        </div>

        <div className="flex gap-3">
          <Link to="/addstudent" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm hover:shadow-md">
            + Add Student
          </Link>
          <Link to="/addgrades" className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-sky-500 text-white rounded-lg text-sm hover:opacity-95">
            + Add Grade
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={loading ? "…" : studentsCount} subtitle="Updated now" accent="from-indigo-400 to-violet-400" />
        <StatCard title="Subjects" value={loading ? "…" : subjectsCount} subtitle="Active subjects" accent="from-teal-400 to-sky-400" />
        <StatCard title="Avg Attendance" value={loading ? "…" : avgAttendance} subtitle="All subjects" accent="from-amber-400 to-orange-400" />
        <StatCard
          title="Top Student"
          value={loading ? "…" : (topStudent ? topStudent.Name : "—")}
          subtitle={topStudent ? `Avg ${topStudent.avg_percent ?? (topStudent.avg_score ? Math.round((topStudent.avg_score / 4) * 100 * 10) / 10 + "%" : "")}` : "Overall"}
          accent="from-emerald-400 to-teal-400"
        />
      </section>

      {error && <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">{error}</div>}

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Students</h2>
          <div className="text-sm text-gray-500">Manage student grades and records</div>
        </div>

        <StudentTable />
      </section>
    </div>
  );
}
