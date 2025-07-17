import { Request, Response } from "express";
import { getCurrentSemester } from "../../Utils/Scraper/CourseInfoUtils";
import { CourseInfo } from "../../Models/CourseInfo";

//get all course info from the database
const handleGetCourseInfo = async (req: Request, res: Response) => {
    try {
    const courseInfo = await CourseInfo.find({});

    if(!courseInfo) {
        res.status(404).json({ error: "Course info not found" });
        return;
    }

    res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

//get course info by course code. pay attention to the fact that course code has spaces in it and for using postman, you need to use %20 instead of space
const handleGetCourseInfoByCode = async (req: Request, res: Response) => {
    try {
        const { courseCode } = req.params;
        const courseInfo = await CourseInfo.findOne({ courseCode });
        if (!courseInfo) {
            res.status(404).json({ error: "Course info not found" });
            return;
        }
        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

export { handleGetCourseInfo, handleGetCourseInfoByCode};