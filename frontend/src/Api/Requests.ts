import axios from "axios";
import type { SubjectsResponse, ApiResponse } from "../Types/Registration";

const fetchSubjects = async () => {

  const response = await axios.get<SubjectsResponse>(
    "http://localhost:3000/courses/meta/subjects?year=2025&semester=30"
  );

  return response.data;

};

const fetchSections = async (
  pagination: any,
  instructor?: string,
  subject?: string,
  courseCode?: string,
  page: number = 1
) => {
  const params = new URLSearchParams({
    year: "2025",
    semester: "30",
    limit: pagination.limit.toString(),
    page: page.toString(),
  });

  if (instructor && instructor.trim()) {
    params.append("instructor", instructor.trim());
  }

  if (subject && subject.trim()) {
    params.append("subject", subject.trim());
  }

  if (courseCode && courseCode.trim()) {
    params.append("courseCode", courseCode.trim());
  }

  const response = await axios.get<ApiResponse>(
    `http://localhost:3000/courses/sections/meetings/?${params.toString()}`
  );

  return response.data;
};

export { fetchSubjects, fetchSections };

