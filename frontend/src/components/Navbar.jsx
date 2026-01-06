import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-slate-900 to-teal-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl font-bold">SG</div>
          <div className="hidden sm:block">
            <div className="text-lg font-semibold">Student Grade</div>
            <div className="text-xs opacity-80">Management System</div>
          </div>
        </Link>

        {/* hamburger for mobile */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden p-2 rounded-md bg-white/10 hover:bg-white/12"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* desktop nav */}
        <nav className="hidden sm:flex items-center space-x-3">
          <Link className="px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 transition text-sm" to="/">Home</Link>
          <Link className="px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 transition text-sm" to="/addstudent">Add Student</Link>
          <Link className="px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 transition text-sm" to="/addgrades">Add Grade</Link>
          <Link className="px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 transition text-sm" to="/addsubject">Add Subject</Link>
          <Link className="px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 transition text-sm" to="/reports">Reports</Link>
        </nav>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="sm:hidden bg-gradient-to-r from-slate-900 to-teal-600/95 px-4 pb-4">
          <nav className="flex flex-col gap-2">
            <Link onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 text-white text-sm" to="/">Home</Link>
            <Link onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 text-white text-sm" to="/addstudent">Add Student</Link>
            <Link onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 text-white text-sm" to="/addgrades">Add Grade</Link>
            <Link onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 text-white text-sm" to="/addsubject">Add Subject</Link>
            <Link onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md bg-white/8 hover:bg-white/12 text-white text-sm" to="/reports">Reports</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
