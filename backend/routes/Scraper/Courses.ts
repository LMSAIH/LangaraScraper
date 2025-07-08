import { Router } from "express";
import {
  handleGetCourses,
  handleGetSubjects,
  handleGetAllHistoricalCourses
} from "../../Controllers/CourseScraper";

const router = Router();

router.get("/subjects", handleGetSubjects);
router.post("/courses", handleGetCourses);
router.post("/courses/historical", handleGetAllHistoricalCourses);

export { router };
