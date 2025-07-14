import { Router } from "express";
import {
  handleGetCourses,
  handleGetCourseByCode,
  handleGetCourseList
} from "../../Controllers/Client/Courses";
import {
  handleGetAllSections,
  handleGetSectionsByCourseCode
  
} from "../../Controllers/Client/Sections";
import {
  handleGetAllMeetings,
  handleGetMeetingTimesBySectionCRN,
} from "../../Controllers/Client/Meetings";
import {
  handleGetAggregatedCourseDataByCourseCode,
  handleGetAggregatedCourseDataSectionAndMeetings,
  handleGetAggregatedSectionsAndMeetingsByCourseCode,
  handleGetAggregatedSectionsAndMeetings
} from "../../Controllers/Client/Aggregated";
import {
  handleGetMetaCourses,
  handleGetMetaInstructors,
  handleGetMetaTerms
} from "../../Controllers/Client/Metadata";
import {
  handleGetAllCoursesInfo,
  handleGetCourseInfoByCode
} from "../../Controllers/Client/CourseInfo";
const router = Router();

// Get all courses with basic filtering
router.get("/", handleGetCourses);

// Get course list with filters
router.get("/courseList", handleGetCourseList);

// Get specific course by code
router.get("/:courseCode", handleGetCourseByCode);

// Get all sections with filtering
router.get("/sections/all", handleGetAllSections);

// Get sections for a specific course
router.get("/:courseCode/sections", handleGetSectionsByCourseCode);

// Get all meeting times with filtering
router.get("/meetings/all", handleGetAllMeetings);

//Get course info for all courses since 1999
router.get("/courseInfo/all", handleGetAllCoursesInfo);

//Get course info for a specific course
router.get("/courseInfo/:courseCode", handleGetCourseInfoByCode);

// Get meeting times for a specific section
router.get("/sections/:crn/meetings", handleGetMeetingTimesBySectionCRN);

// Get aggregated course data (course + sections + meeting times)
router.get("/:courseCode/full", handleGetAggregatedCourseDataByCourseCode);

// Get sections with meeting times for a course (no course data)
router.get("/:courseCode/sections-full", handleGetAggregatedSectionsAndMeetingsByCourseCode);

// Get all subjects
router.get("/meta/subjects", handleGetMetaCourses);

// Get all instructors
router.get("/meta/instructors", handleGetMetaInstructors);

//Gets all terms in the DB
router.get("/meta/terms", handleGetMetaTerms);

// Get all courses with sections and meeting times
router.get("/sections/meetings/all", handleGetAggregatedCourseDataSectionAndMeetings);

// Get sections and meetings without course data (better performance)
router.get("/sections/meetings/", handleGetAggregatedSectionsAndMeetings)


export { router };
