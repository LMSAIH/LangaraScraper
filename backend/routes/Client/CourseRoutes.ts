import { Router, Request, Response } from 'express';
import { CourseData } from '../../Models/CourseData';
import { CourseSection } from '../../Models/CourseSection';
import { MeetingTime } from '../../Models/MeetingTime';

const router = Router();

// Get all courses with basic filtering
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, semester, subject, limit = 100, page = 1 } = req.query;

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
});

// Get specific course by code
router.get('/:courseCode', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester } = req.query;

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
});

// Get all sections with filtering
router.get('/sections/all', async (req: Request, res: Response): Promise<void> => {
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
});

// Get sections for a specific course
router.get('/:courseCode/sections', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester, available } = req.query;

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
});

// Get all meeting times with filtering
router.get('/meetings/all', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      year, 
      semester, 
      sectionCRN,
      instructor,
      sectionType,
      days,
      limit = 100, 
      page = 1 
    } = req.query;

    // Build query
    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (sectionCRN) query.sectionCRN = String(sectionCRN);
    if (instructor) query.instructor = new RegExp(String(instructor), 'i');
    if (sectionType) query.sectionType = String(sectionType);
    if (days) query.days = new RegExp(String(days), 'i');

    // Pagination
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;

    // Get meeting times
    const meetingTimes = await MeetingTime.find(query)
      .limit(limitNum)
      .skip(skip)
      .sort({ sectionCRN: 1, sectionType: 1 })
      .lean();

    const totalCount = await MeetingTime.countDocuments(query);

    res.json({
      success: true,
      meetingTimes,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching meeting times:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get meeting times for a specific section
router.get('/sections/:crn/meetings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { crn } = req.params;
    const { year, semester } = req.query;

    const query: any = { sectionCRN: crn };
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);

    const meetingTimes = await MeetingTime.find(query)
      .sort({ sectionType: 1 })
      .lean();

    if (meetingTimes.length === 0) {
      res.status(404).json({
        success: false,
        error: `No meeting times found for section CRN ${crn}`
      });
      return;
    }

    res.json({
      success: true,
      sectionCRN: crn,
      meetingTimes,
      count: meetingTimes.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching section meeting times:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get aggregated course data (course + sections + meeting times)
router.get('/:courseCode/full', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester } = req.query;

    const courseQuery: any = { courseCode: courseCode.toUpperCase() };
    if (year) courseQuery.year = Number(year);
    if (semester) courseQuery.semester = Number(semester);

    // Get course info
    const course = await CourseData.findOne(courseQuery).lean();

    if (!course) {
      res.status(404).json({
        success: false,
        error: `Course ${courseCode} not found`
      });
      return;
    }

    // Get sections for this course
    const sections = await CourseSection.find(courseQuery)
      .sort({ section: 1 })
      .lean();

    // Get all CRNs for meeting times
    const crns = sections.map(section => section.crn);

    // Get meeting times for all sections
    const meetingTimesQuery: any = { sectionCRN: { $in: crns } };
    if (year) meetingTimesQuery.year = Number(year);
    if (semester) meetingTimesQuery.semester = Number(semester);

    const meetingTimes = await MeetingTime.find(meetingTimesQuery)
      .sort({ sectionCRN: 1, sectionType: 1 })
      .lean();

    // Group meeting times by CRN
    const meetingTimesByCRN = meetingTimes.reduce((acc, meeting) => {
      if (!acc[meeting.sectionCRN]) {
        acc[meeting.sectionCRN] = [];
      }
      acc[meeting.sectionCRN].push(meeting);
      return acc;
    }, {} as any);

    // Combine sections with their meeting times
    const sectionsWithMeetings = sections.map(section => ({
      ...section,
      meetingTimes: meetingTimesByCRN[section.crn] || []
    }));

    res.json({
      success: true,
      course: {
        ...course,
        sections: sectionsWithMeetings
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching full course data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sections with meeting times for a course (no course data)
router.get('/:courseCode/sections-full', async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester, available } = req.query;

    const sectionQuery: any = { courseCode: courseCode.toUpperCase() };
    if (year) sectionQuery.year = Number(year);
    if (semester) sectionQuery.semester = Number(semester);
    if (available === 'true'){
       sectionQuery.seatsAvailable = { $gt: "0" };
    } else {
      sectionQuery.seatsAvailable = { $lt: "0" };
    }

    // Get sections for this course
    const sections = await CourseSection.find(sectionQuery)
      .sort({ section: 1 })
      .lean();

    if (sections.length === 0) {
      res.status(404).json({
        success: false,
        error: `No sections found for course ${courseCode}`
      });
      return;
    }

    // Get all CRNs for meeting times
    const crns = sections.map(section => section.crn);

    // Get meeting times for all sections
    const meetingTimesQuery: any = { sectionCRN: { $in: crns } };
    if (year) meetingTimesQuery.year = Number(year);
    if (semester) meetingTimesQuery.semester = Number(semester);

    const meetingTimes = await MeetingTime.find(meetingTimesQuery)
      .sort({ sectionCRN: 1, sectionType: 1 })
      .lean();

    // Group meeting times by CRN
    const meetingTimesByCRN = meetingTimes.reduce((acc, meeting) => {
      if (!acc[meeting.sectionCRN]) {
        acc[meeting.sectionCRN] = [];
      }
      acc[meeting.sectionCRN].push(meeting);
      return acc;
    }, {} as any);

    // Combine sections with their meeting times
    const sectionsWithMeetings = sections.map(section => ({
      ...section,
      meetingTimes: meetingTimesByCRN[section.crn] || []
    }));

    res.json({
      success: true,
      courseCode: courseCode.toUpperCase(),
      sections: sectionsWithMeetings,
      count: sectionsWithMeetings.length,
      filters: {
        year: year ? Number(year) : undefined,
        semester: semester ? Number(semester) : undefined,
        available: available === 'true' ? true : undefined
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching course sections with meeting times:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Get all subjects
router.get('/meta/subjects', async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, semester } = req.query;

    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);

    const subjects = await CourseData.distinct('subject', query);

    res.json({
      success: true,
      subjects,
      count: subjects.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all instructors
router.get('/meta/instructors', async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, semester, subject } = req.query;

    const query: any = {};
    if (year) query.year = Number(year);
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = String(subject).toUpperCase();

    const instructors = await MeetingTime.distinct('instructor', query);
    const filteredInstructors = instructors.filter(instructor => instructor && instructor.trim() !== '');

    res.json({
      success: true,
      instructors: filteredInstructors,
      count: filteredInstructors.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all courses with sections and meeting times
router.get('/sections/meetings/all', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      year, 
      semester, 
      subject, 
      instructor, 
      available,
      limit = 100, 
      page = 1 
    } = req.query;

    // Build query for courses
    const courseQuery: any = {};
    if (year) courseQuery.year = Number(year);
    if (semester) courseQuery.semester = Number(semester);
    if (subject) courseQuery.subject = String(subject).toUpperCase();

    // Pagination
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;

    let courses;
    let totalCount;
    let courseCodes;

    // If instructor filter is provided, we need to find relevant courses first
    if (instructor) {
      // First, find meeting times that match the instructor
      const meetingQuery: any = { instructor: new RegExp(String(instructor), 'i') };
      if (year) meetingQuery.year = Number(year);
      if (semester) meetingQuery.semester = Number(semester);

      // Get sections that have this instructor
      const instructorMeetings = await MeetingTime.find(meetingQuery).distinct('sectionCRN');
      
      if (instructorMeetings.length === 0) {
        res.json({
          success: true,
          courses: [],
          count: 0,
          pagination: {
            page: Number(page),
            limit: limitNum,
            total: 0,
            totalPages: 0
          },
          filters: {
            year: year ? Number(year) : undefined,
            semester: semester ? Number(semester) : undefined,
            subject: subject ? String(subject).toUpperCase() : undefined,
            instructor: String(instructor),
            available: available === 'true' ? true : undefined
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Find sections for these CRNs to get course codes
      const sectionQuery: any = { crn: { $in: instructorMeetings } };
      if (year) sectionQuery.year = Number(year);
      if (semester) sectionQuery.semester = Number(semester);

      const instructorSections = await CourseSection.find(sectionQuery).distinct('courseCode');
      
      // Add course codes to the course query
      courseQuery.courseCode = { $in: instructorSections };
    }

    // Get courses with pagination
    courses = await CourseData.find(courseQuery)
      .limit(limitNum)
      .skip(skip)
      .sort({ subject: 1, courseCode: 1 })
      .lean();

    if (courses.length === 0) {
      res.json({
        success: true,
        courses: [],
        count: 0,
        pagination: {
          page: Number(page),
          limit: limitNum,
          total: 0,
          totalPages: 0
        },
        filters: {
          year: year ? Number(year) : undefined,
          semester: semester ? Number(semester) : undefined,
          subject: subject ? String(subject).toUpperCase() : undefined,
          instructor: instructor ? String(instructor) : undefined,
          available: available === 'true' ? true : undefined
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get all course codes for sections lookup
    courseCodes = courses.map(course => course.courseCode);

    // Build section query
    const sectionQuery: any = { courseCode: { $in: courseCodes } };
    if (year) sectionQuery.year = Number(year);
    if (semester) sectionQuery.semester = Number(semester);
    if (available === 'true') sectionQuery.seatsAvailable = { $gt: "0" };

    // Get all sections for these courses
    let sections = await CourseSection.find(sectionQuery)
      .sort({ courseCode: 1, section: 1 })
      .lean();

    // If instructor filter, we need to further filter sections
    if (instructor) {
      const meetingQuery: any = { instructor: new RegExp(String(instructor), 'i') };
      if (year) meetingQuery.year = Number(year);
      if (semester) meetingQuery.semester = Number(semester);

      const instructorCRNs = await MeetingTime.find(meetingQuery).distinct('sectionCRN');
      sections = sections.filter(section => instructorCRNs.includes(section.crn));
    }

    // Get all CRNs for meeting times
    const crns = sections.map(section => section.crn);

    // Get meeting times for all sections
    const meetingTimesQuery: any = { sectionCRN: { $in: crns } };
    if (year) meetingTimesQuery.year = Number(year);
    if (semester) meetingTimesQuery.semester = Number(semester);
    if (instructor) meetingTimesQuery.instructor = new RegExp(String(instructor), 'i');

    const meetingTimes = await MeetingTime.find(meetingTimesQuery)
      .sort({ sectionCRN: 1, sectionType: 1 })
      .lean();

    // Group meeting times by CRN
    const meetingTimesByCRN = meetingTimes.reduce((acc, meeting) => {
      if (!acc[meeting.sectionCRN]) {
        acc[meeting.sectionCRN] = [];
      }
      acc[meeting.sectionCRN].push(meeting);
      return acc;
    }, {} as any);

    // Group sections by course code with meeting times
    const sectionsByCourseCode = sections.reduce((acc, section) => {
      if (!acc[section.courseCode]) {
        acc[section.courseCode] = [];
      }
      acc[section.courseCode].push({
        ...section,
        meetingTimes: meetingTimesByCRN[section.crn] || []
      });
      return acc;
    }, {} as any);

    // Combine courses with their sections and meeting times
    const coursesWithData = courses.map(course => ({
      ...course,
      sections: sectionsByCourseCode[course.courseCode] || []
    }));

    // Filter out courses that have no sections (after instructor filtering)
    const filteredCoursesWithData = coursesWithData.filter(course => course.sections.length > 0);

    // Get total count for pagination
    totalCount = await CourseData.countDocuments(courseQuery);

    res.json({
      success: true,
      courses: filteredCoursesWithData,
      count: filteredCoursesWithData.length,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      },
      filters: {
        year: year ? Number(year) : undefined,
        semester: semester ? Number(semester) : undefined,
        subject: subject ? String(subject).toUpperCase() : undefined,
        instructor: instructor ? String(instructor) : undefined,
        available: available === 'true' ? true : undefined
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching all courses with full data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


export { router };