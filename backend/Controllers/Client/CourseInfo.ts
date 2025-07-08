import { Request, Response } from "express";
import { getCourseInfo } from "../../Utils/Scraper/CourseInfoUtils";
import { CourseInfo } from "../../Models/CourseInfo";

const handleGetCourseInfo = async (req: Request, res: Response) => {
    try {
        const { year, semester } = req.query;
        const courseInfo = await getCourseInfo(Number(year), Number(semester));
        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

const handleGetCourseInfoByCode = async (req: Request, res: Response) => {
    try {
        const { courseCode } = req.params;
        const courseInfo = await CourseInfo.findOne({ courseCode });
        if (!courseInfo) {
            return res.status(404).json({ error: "Course info not found" });
        }
        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}
export { handleGetCourseInfo, handleGetCourseInfoByCode };