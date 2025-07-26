import { Router } from "express";
import {
  handleGetCourseInfo,
  handleGetCourseInfoByAttribute,
  handleGetCourseInfoByCode,
  handleGetSubjects,
} from "../../Controllers/Client/CourseInfo";

const router = Router();

// More specific routes first
router.get("/subjects", handleGetSubjects);
router.get("/attribute/:attribute", handleGetCourseInfoByAttribute);
router.get("/:courseCode", handleGetCourseInfoByCode);
router.get("/", handleGetCourseInfo);

export { router };
