import { Request, Response } from 'express';
import { CourseSection } from '../../Models/CourseSection';

const handleGetAllSections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      year, 
      semester, 
      subject, 
      courseCode, 
      crn,
      available,
      limit = 100, 
      page = 1 
    } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: 'Year and semester are required',
      });
      return;
    }

    // Build query
    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = String(subject).toUpperCase();
    if (courseCode) query.courseCode = String(courseCode).toUpperCase();
    if (crn) query.crn = String(crn);
    if (available === 'true') query.seatsAvailable = { $gt: "0" };

    // Pagination
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;

    // Get sections
    const sections = await CourseSection.find(query)
      .limit(limitNum)
      .skip(skip)
      .sort({ courseCode: 1, section: 1 })
      .lean();

    const totalCount = await CourseSection.countDocuments(query);

    res.json({
      success: true,
      sections,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching sections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

const handleGetSectionsByCourseCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester, available } = req.query;

    if(!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
        example: {
          year: 2025,
          semester: 30,
          available: true
        }
      });
      return;
    }

    const query: any = { courseCode: courseCode.toUpperCase() };
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (available === 'true') query.seatsAvailable = { $gt: "0" };

    const sections = await CourseSection.find(query)
      .sort({ section: 1 })
      .lean();

    if (sections.length === 0) {
      res.status(404).json({
        success: false,
        error: `No sections found for course ${courseCode}`
      });
      return;
    }

    res.json({
      success: true,
      courseCode: courseCode.toUpperCase(),
      sections,
      count: sections.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching course sections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


export { handleGetAllSections, handleGetSectionsByCourseCode }