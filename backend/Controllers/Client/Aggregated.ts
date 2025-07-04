import { Request, Response } from "express";
import { CourseData } from "../../Models/CourseData";
import { CourseSection } from "../../Models/CourseSection";
import { MeetingTime } from "../../Models/MeetingTime";

const handleGetAggregatedCourseDataByCourseCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester } = req.query;

    const courseQuery: any = { courseCode: courseCode.toUpperCase() };
    if (year) courseQuery.year = Number(year);
    if (semester) courseQuery.semester = Number(semester);

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

    // Get course info
    const course = await CourseData.findOne(courseQuery).lean();

    if (!course) {
      res.status(404).json({
        success: false,
        error: `Course ${courseCode} not found`,
      });
      return;
    }

    // Get sections for this course
    const sections = await CourseSection.find(courseQuery)
      .sort({ section: 1 })
      .lean();

    // Get all CRNs for meeting times
    const crns = sections.map((section) => section.crn);

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
    const sectionsWithMeetings = sections.map((section) => ({
      ...section,
      meetingTimes: meetingTimesByCRN[section.crn] || [],
    }));

    res.json({
      success: true,
      course: {
        ...course,
        sections: sectionsWithMeetings,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching full course data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleGetAggregatedSectionsAndMeetingsByCourseCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { courseCode } = req.params;
    const { year, semester, available } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

    const sectionQuery: any = { courseCode: courseCode.toUpperCase() };
    if (year) sectionQuery.year = Number(year);
    if (semester) sectionQuery.semester = Number(semester);
    if (available === "true") {
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
        error: `No sections found for course ${courseCode}`,
      });
      return;
    }

    // Get all CRNs for meeting times
    const crns = sections.map((section) => section.crn);

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
    const sectionsWithMeetings = sections.map((section) => ({
      ...section,
      meetingTimes: meetingTimesByCRN[section.crn] || [],
    }));

    res.json({
      success: true,
      courseCode: courseCode.toUpperCase(),
      sections: sectionsWithMeetings,
      count: sectionsWithMeetings.length,
      filters: {
        year: year ? Number(year) : undefined,
        semester: semester ? Number(semester) : undefined,
        available: available === "true" ? true : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching course sections with meeting times:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ...existing code...

const handleGetAggregatedSectionsAndMeetings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      year,
      semester,
      subject,
      instructor,
      available,
      limit = 100,
      page = 1,
    } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

    // Pagination
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;

    let sections;
    let totalCount;

    // Build base section query
    const baseSectionQuery: any = {};
    if (year) baseSectionQuery.year = Number(year);
    if (semester) baseSectionQuery.semester = Number(semester);
    if (subject) baseSectionQuery.subject = String(subject).toUpperCase();
    if (available === "true") baseSectionQuery.seatsAvailable = { $gt: "0" };

    if (instructor) {
      // Get meeting times that match the instructor
      const meetingQuery: any = {
        instructor: new RegExp(String(instructor), "i"),
      };
      if (year) meetingQuery.year = Number(year);
      if (semester) meetingQuery.semester = Number(semester);

      // Get CRNs that have this instructor
      const instructorCRNs = await MeetingTime.find(meetingQuery).distinct(
        "sectionCRN"
      );

      if (instructorCRNs.length === 0) {
        res.json({
          success: true,
          sections: [],
          count: 0,
          pagination: {
            page: Number(page),
            limit: limitNum,
            total: 0,
            totalPages: 0,
          },
          filters: {
            year: year ? Number(year) : undefined,
            semester: semester ? Number(semester) : undefined,
            subject: subject ? String(subject).toUpperCase() : undefined,
            instructor: instructor ? String(instructor) : undefined,
            available: available === "true" ? true : undefined,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Add CRN filter to section query
      baseSectionQuery.crn = { $in: instructorCRNs };
    }

    // Get total count for pagination
    totalCount = await CourseSection.countDocuments(baseSectionQuery);

    // Get sections with pagination
    sections = await CourseSection.find(baseSectionQuery)
      .limit(limitNum)
      .skip(skip)
      .sort({ subject: 1, courseCode: 1, section: 1 })
      .lean();

    if (sections.length === 0) {
      res.json({
        success: true,
        sections: [],
        count: 0,
        pagination: {
          page: Number(page),
          limit: limitNum,
          total: totalCount,
          totalPages: 0,
        },
        filters: {
          year: year ? Number(year) : undefined,
          semester: semester ? Number(semester) : undefined,
          subject: subject ? String(subject).toUpperCase() : undefined,
          instructor: instructor ? String(instructor) : undefined,
          available: available === "true" ? true : undefined,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get all CRNs for meeting times
    const crns = sections.map((section) => section.crn);

    // Get meeting times for all sections
    const meetingTimesQuery: any = { sectionCRN: { $in: crns } };
    if (year) meetingTimesQuery.year = Number(year);
    if (semester) meetingTimesQuery.semester = Number(semester);
    if (instructor)
      meetingTimesQuery.instructor = new RegExp(String(instructor), "i");

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
    const sectionsWithMeetings = sections.map((section) => ({
      ...section,
      meetingTimes: meetingTimesByCRN[section.crn] || [],
    }));

    res.json({
      success: true,
      sections: sectionsWithMeetings,
      count: sectionsWithMeetings.length,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      filters: {
        year: year ? Number(year) : undefined,
        semester: semester ? Number(semester) : undefined,
        subject: subject ? String(subject).toUpperCase() : undefined,
        instructor: instructor ? String(instructor) : undefined,
        available: available === "true" ? true : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching sections with meeting times:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const handleGetAggregatedCourseDataSectionAndMeetings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      year,
      semester,
      subject,
      instructor,
      available,
      limit = 100,
      page = 1,
    } = req.query;

    if (!year || !semester) {
      res.status(400).json({
        success: false,
        error: "Year and semester are required",
      });
      return;
    }

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

    if (instructor) {
      // meeting times that match the instructor
      const meetingQuery: any = {
        instructor: new RegExp(String(instructor), "i"),
      };
      if (year) meetingQuery.year = Number(year);
      if (semester) meetingQuery.semester = Number(semester);

      // Get sections that have this instructor
      const instructorMeetings = await MeetingTime.find(meetingQuery).distinct(
        "sectionCRN"
      );

      if (instructorMeetings.length === 0) {
        res.json({
          success: true,
          courses: [],
          count: 0,
          pagination: {
            page: Number(page),
            limit: limitNum,
            total: 0,
            totalPages: 0,
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Find sections for these CRNs to get course codes
      const sectionQuery: any = { crn: { $in: instructorMeetings } };
      if (year) sectionQuery.year = Number(year);
      if (semester) sectionQuery.semester = Number(semester);
      if (available === "true") sectionQuery.seatsAvailable = { $gt: "0" };

      const instructorSections = await CourseSection.find(
        sectionQuery
      ).distinct("courseCode");

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
          totalPages: 0,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get all course codes for sections lookup
    courseCodes = courses.map((course) => course.courseCode);

    // Build section query
    const sectionQuery: any = { courseCode: { $in: courseCodes } };
    if (year) sectionQuery.year = Number(year);
    if (semester) sectionQuery.semester = Number(semester);
    if (available === "true") sectionQuery.seatsAvailable = { $gt: "0" };

    // Get all sections for these courses
    let sections = await CourseSection.find(sectionQuery)
      .sort({ courseCode: 1, section: 1 })
      .lean();

    // If instructor filter, we need to further filter sections
    if (instructor) {
      const meetingQuery: any = {
        instructor: new RegExp(String(instructor), "i"),
      };
      if (year) meetingQuery.year = Number(year);
      if (semester) meetingQuery.semester = Number(semester);

      const instructorCRNs = await MeetingTime.find(meetingQuery).distinct(
        "sectionCRN"
      );
      sections = sections.filter((section) =>
        instructorCRNs.includes(section.crn)
      );
    }

    // Get all CRNs for meeting times
    const crns = sections.map((section) => section.crn);

    // Get meeting times for all sections
    const meetingTimesQuery: any = { sectionCRN: { $in: crns } };
    if (year) meetingTimesQuery.year = Number(year);
    if (semester) meetingTimesQuery.semester = Number(semester);
    if (instructor)
      meetingTimesQuery.instructor = new RegExp(String(instructor), "i");

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
        meetingTimes: meetingTimesByCRN[section.crn] || [],
      });
      return acc;
    }, {} as any);

    // Combine courses with their sections and meeting times
    const coursesWithData = courses.map((course) => ({
      ...course,
      sections: sectionsByCourseCode[course.courseCode] || [],
    }));

    // Filter out courses that have no sections (after instructor filtering)
    const filteredCoursesWithData = coursesWithData.filter(
      (course) => course.sections.length > 0
    );

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
        totalPages: Math.ceil(totalCount / limitNum),
      },
      filters: {
        year: year ? Number(year) : undefined,
        semester: semester ? Number(semester) : undefined,
        subject: subject ? String(subject).toUpperCase() : undefined,
        instructor: instructor ? String(instructor) : undefined,
        available: available === "true" ? true : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching all courses with full data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export {
  handleGetAggregatedCourseDataByCourseCode,
  handleGetAggregatedSectionsAndMeetingsByCourseCode,
  handleGetAggregatedSectionsAndMeetings,
  handleGetAggregatedCourseDataSectionAndMeetings,
};
