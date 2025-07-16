import { Request, Response } from 'express';
import {CourseData} from '../../Models/CourseData';

const handleGetCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, semester, subject, limit = 10000, page = 1 } = req.query;

    // Build query
    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = String(subject).toUpperCase();

    // Pagination
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;

    // Get courses
    const courses = await CourseData.find(query)
      .limit(limitNum)
      .skip(skip)
      .lean();

    const totalCount = await CourseData.countDocuments(query);

    res.json({
      success: true,
      courses,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

const handleGetCourseByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester } = req.query;

    if(!courseCode || !year || !semester) {
        res.status(400).json({
            success: false,
            error: 'Course code, year, and semester are required'
        });
        return;
    }

    const query: any = { courseCode: courseCode.toUpperCase() };
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);

    const course = await CourseData.findOne(query).lean();

    if (!course) {
      res.status(404).json({
        success: false,
        error: `Course ${courseCode} not found`
      });
      return;
    }

    res.json({
      success: true,
      course,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

const handleGetCourseList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, semester, subject } = req.query;

    // Build query
    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = String(subject).toUpperCase();

    // Get distinct course codes with high limit
    const distinctCourseCodes = await CourseData.distinct('courseCode', query);

    // Sort the course codes alphabetically
    distinctCourseCodes.sort();

    res.json({
      success: true,
      courseCodes: distinctCourseCodes,
      count: distinctCourseCodes.length,
      filters: {
        year: year ? Number(year) : null,
        semester: semester ? Number(semester) : null,
        subject: subject ? String(subject).toUpperCase() : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching course list:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export { handleGetCourses, handleGetCourseByCode, handleGetCourseList };