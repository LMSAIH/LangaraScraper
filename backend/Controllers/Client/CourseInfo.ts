import { Request, Response } from "express";
import { getCourseInfo } from "../../Utils/Scraper/CourseInfoUtils";
import { CourseInfo } from "../../Models/CourseInfo";

const handleGetAllCoursesInfo = async (req: Request, res: Response) => {
    try {
        const courseInfo = await getCourseInfo();
        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

const  handleGetCourseInfoByCode = async (req: Request, res: Response) => {
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

const handleGetCourseInfoByAttribute = async (req: Request, res: Response) => {
    try {
        const { attribute } = req.params;
        const courseInfo = await CourseInfo.find({ attributes: attribute });
        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}
export { handleGetAllCoursesInfo, handleGetCourseInfoByCode, handleGetCourseInfoByAttribute };