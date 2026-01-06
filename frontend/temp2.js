//!Filter ----------------------------------------------------
let filteredStudents = [...students];

//!Apply Seach Filter---------------------------------------------------
if (searchQuery) {
  filteredStudents = students.filter((student) => {
    return student.Name.toLowerCase().includes(
      searchQuery.trim().toLowerCase()
    );
  });
}

//!Filter subject---------------------------------------------------
if (subject) {
  if (subject == "All subjects") {
    filteredStudents = [...students];
  } else {
    filteredStudents = students.filter((student) => {
      return student.subject == subject;
    });
  }
}

//!Sorting---------------------------------------------------------
if (sortBy) {
  if (sortBy == "Default") {
    filteredStudents = [...students];
  } else if (sortBy === "Name") {
    filteredStudents.sort((a, b) => a.Name.localeCompare(b.Name));
  } else if (sortBy === "Grades") {
    filteredStudents.sort((a, b) => b.grade - a.grade);
  } else if (sortBy === "RollNo") {
    filteredStudents.sort((a, b) => a.Roll_no - b.Roll_no);
  }
}
