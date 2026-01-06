let filteredStudents = [...students];

// Apply search filter
if (searchQuery) {
  filteredStudents = filteredStudents.filter((student) =>
    student.Name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
}

// Apply subject filter
if (subject && subject !== "All subjects") {
  filteredStudents = filteredStudents.filter(
    (student) => student.subject === subject
  );
}

// Apply sorting
if (sortBy && sortBy !== "Default") {
  if (sortBy === "Name") {
    filteredStudents.sort((a, b) => a.Name.localeCompare(b.Name));
  } else if (sortBy === "Grades") {
    filteredStudents.sort((a, b) => b.grade - a.grade);
  } else if (sortBy === "RollNo") {
    filteredStudents.sort((a, b) => a.Roll_no - b.Roll_no);
  }
}
