import { Request, Response } from "express";
import {
  getSubjects,
  getCourses,
  parseCourseData,
} from "../Utils/Scraper/ScraperUtils";
import { CourseData } from "../Models/CourseData";
import mongoose from "mongoose";

const handleGetSubjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { year, semester } = req.query;

  if (!year || !semester) {
    res.status(400).json({ error: "Year and semester are required" });
    return;
  }

  try {
    const subjects = await getSubjects(Number(year), Number(semester));

    res.json({ subjects: subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleGetCourses = async (req: Request, res: Response): Promise<void> => {
  const { year, semester, saveToDb = false } = req.body;

  if (!year || !semester) {
    res.status(400).json({
      error: "Year and semester are required",
      example: {
        year: 2025,
        semester: 30,
        saveToDb: true,
      },
    });
    return;
  }

  try {
    const subjects = await getSubjects(Number(year), Number(semester));
    const coursesHtml = await getCourses(
      Number(year),
      Number(semester),
      subjects
    );
    const courseData = parseCourseData(coursesHtml);

    // Save to database if requested
    if (saveToDb) {
      const sessionStorage = await mongoose.startSession();

      try {
        await sessionStorage.withTransaction(async () => {
          // Delete old courses for the specified year and semester
          const deleteResult = await CourseData.deleteMany({
            year: Number(year),
            semester: Number(semester),
          });

          // Insert new courses
          const insertResult = await CourseData.insertMany(
            courseData.map((course) => ({ ...course, year: Number(year), semester: Number(semester), term: `${year}${semester}` })),
          );

          console.log(
            `Deleted ${deleteResult.deletedCount} courses and inserted ${insertResult.length} new courses.`
          );
        });
      } finally {
        sessionStorage.endSession();
      }
    }

    // Build response object
    const response = {
      success: true,
      year: Number(year),
      semester: Number(semester),
      scraped: {
        totalCourses: courseData.length,
        totalSections: courseData.reduce(
          (sum, course) => sum + course.sections.length,
          0
        ),
        courses: courseData,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

export { handleGetSubjects, handleGetCourses };
