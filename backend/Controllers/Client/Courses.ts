import { Request, Response } from 'express';
import {CourseData} from '../../Models/CourseData';
import { getCourseInfo } from '../../Utils/Scraper/CourseInfoUtils';
import { getCurrentSemester } from '../../Utils/Scraper/ScraperUtils';
import mongoose from 'mongoose';
import { CourseInfo } from '../../Models/CourseInfo';

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
    const { startYear, startSemester, endYear, endSemester, subject } = req.query; //all might be optional depending on the user's request
    const { saveToDB } = req.body;

    //checking if all four parameters are provided
    const params = [startYear, startSemester, endYear, endSemester];
    const provided = params.filter(v => v !== undefined && v !== null && v !== '');

    if (provided.length > 0 && provided.length < 4) {
        res.status(400).json({ success: false, error: "If any of startYear, startSemester, endYear, or endSemester is provided, all four must be provided." });
      return;
    }

    if (provided.length === 4) {
      if (Number(startYear) > Number(endYear)) {
        res.status(400).json({ success: false, error: "Start year must be less than end year" });
        return;
      }
      if (startYear === endYear && Number(startSemester) > Number(endSemester)) {
        res.status(400).json({ success: false, error: "Start semester must be less than end semester" });
        return;
      }
    }

    // Build query
    const query: any = {};
    if (startYear && endYear) query.year = { $gte: Number(startYear), $lte: Number(endYear) };
    if (startSemester && endSemester) query.semester = { $gte: Number(startSemester), $lte: Number(endSemester) };
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
        startYear: startYear ? Number(startYear) : null,
        startSemester: startSemester ? Number(startSemester) : null,
        endYear: endYear ? Number(endYear) : null,
        endSemester: endSemester ? Number(endSemester) : null,
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

const handleSaveToDBCourseInfo = async () => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const currentYear = new Date().getFullYear();
      const currentSemester = (getCurrentSemester(new Date().getMonth() + 1)) ? 0 : 30;

      const startYear = currentYear - 2;
      const startSemester = 10;

      const courseInfoDelete = await CourseInfo.deleteMany({ year: { $gte: startYear, $lte: currentYear }, semester: { $gte: startSemester, $lte: currentSemester } });

      const courseInfoToInsert = await getCourseInfo(startYear, startSemester, currentYear, currentSemester);

      const courseInfo = await CourseInfo.insertMany(courseInfoToInsert);

      console.log(`Deleted: ${courseInfoDelete.deletedCount} course info`);
      console.log(`Inserted: ${courseInfo.length} course info`);
    });
  
  } catch (error) {
    console.error('Error saving course info:', error);
    throw new Error('Failed to save course info');
  } finally {
    await session.endSession();
  }
}

export { handleGetCourses, handleGetCourseByCode, handleGetCourseList, handleSaveToDBCourseInfo };