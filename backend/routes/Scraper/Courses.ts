import { Router } from "express";
import {
  handleGetCourses,
  handleGetSubjects,
  handleGetAllHistoricalCourses
} from "../../Controllers/CourseScraper";
import { handleGetCourseInfo } from "../../Controllers/CourseScraper";

const router = Router();

router.get("/subject", handleGetSubjects);
router.post("/courses", handleGetCourses);
router.post("/courses/historical", handleGetAllHistoricalCourses);
router.post("/coursesinfo", handleGetCourseInfo);



export { router };
