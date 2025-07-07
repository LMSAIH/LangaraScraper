import { Router } from "express";
import * as cron from "node-cron";
import {
  handleGetCourses,
  handleGetSubjects,
} from "../../Controllers/CourseScraper";

const router = Router();

router.get("/subjects", handleGetSubjects);
router.post("/courses", handleGetCourses);

export { router };
