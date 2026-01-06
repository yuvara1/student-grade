import React from "react";
import "./App.css";
import "./index.css";
import Dashboard from "./components/Dashboard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddStudent from "./components/AddStudent";
import AddGrade from "./components/AddGrade";
import EditGrade from "./components/EditGrade";
import AddSubject from "./components/AddSubject";
import Reports from "./components/Reports";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        {/* central responsive container — keeps perfect alignment across devices */}
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/addstudent" element={<AddStudent />} />
              <Route path="/addgrades" element={<AddGrade />} />
              <Route path="/editgrade" element={<EditGrade />} />
              <Route path="/addsubject" element={<AddSubject />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
