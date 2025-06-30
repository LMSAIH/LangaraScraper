import { Router } from "express";

import { handleGetCourses, handleGetSubjects } from "../../Controllers/CourseScraper";

const router = Router();


router.get("/subjects", handleGetSubjects);

router.post("/courses", handleGetCourses);

export { router };
