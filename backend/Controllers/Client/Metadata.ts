import { Request, Response } from "express";
import { CourseData } from "../../Models/CourseData";
import { MeetingTime } from "../../Models/MeetingTime";

const handleGetMetaCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { year, semester } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);

    const subjects = await CourseData.distinct("subject", query);

    res.json({
      success: true,
      subjects,
      count: subjects.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleGetMetaInstructors = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { year, semester, subject } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = String(subject).toUpperCase();

    const instructors = await MeetingTime.distinct("instructor", query);
    const filteredInstructors = instructors.filter(
      (instructor) => instructor && instructor.trim() !== ""
    );

    res.json({
      success: true,
      instructors: filteredInstructors,
      count: filteredInstructors.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching instructors:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleGetMetaTerms = async (

  req: Request,
  res: Response
): Promise<void> => {
  try {

    const terms = await CourseData.distinct("term");

    if (!terms || terms.length === 0) {
      res.status(404).json({
        success: false,
        error: "No terms found",
      });
      return;
    }

    res.json({
      success: true,
      terms,
      count: terms.length,
    });

  } catch (error: any) {
    console.error("Error fetching terms:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export { handleGetMetaCourses, handleGetMetaInstructors, handleGetMetaTerms };
