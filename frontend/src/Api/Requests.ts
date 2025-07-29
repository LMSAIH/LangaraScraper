import axios from "axios";
import type { SubjectsResponse, ApiResponse } from "../Types/Registration";

const fetchSubjects = async (year: number, semester: number) => {
  const response = await axios.get<SubjectsResponse>(
    `http://localhost:3000/courses/meta/subjects?year=${year}&semester=${semester}`
  );

  return response.data;
};

const fetchSections = async (
  pagination: any,
  year: number,
  semester: number,
  instructor?: string,
  subject?: string,
  courseCode?: string,
  page: number = 1
) => {
  const params: any = {
    year: year.toString(),
    semester: semester.toString(),
    limit: pagination.limit.toString(),
    page: page.toString(),
  };

  if (instructor) {
    const cleanInstructorName = instructor.trim().replace(/\s+/g, ' ');
    params.instructor = cleanInstructorName;
  }

  if (subject && subject.trim()) {
    params.subject = subject.trim();
  }

  if (courseCode && courseCode.trim()) {
    params.courseCode = courseCode.trim();
  }

  const response = await axios.get<ApiResponse>(
    `http://localhost:3000/courses/sections/meetings/`,
    { params: {...params} }
  );

  return response.data;
};

const fetchTerms = async () => {
  const response = await axios.get<{ success: boolean; terms: string[]; count: number }>(
    "http://localhost:3000/courses/meta/terms"
  );

  return response.data.terms;
};

export { fetchSubjects, fetchSections, fetchTerms };