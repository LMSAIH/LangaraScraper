import { Request, Response } from "express";
import { CourseInfo } from "../../Models/CourseInfo";

//get all course info from the database
const handleGetCourseInfo = async (req: Request, res: Response) => {
    try {
    const courseInfo = await CourseInfo.find({});

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

        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

const handleGetCourseInfoByAttribute = async (req: Request, res: Response) => {
    try {
        const { attribute } = req.params;
        const courseInfo = await CourseInfo.find({ attributes: { $in: [attribute.toUpperCase()] } });
        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

export { handleGetCourseInfo, handleGetCourseInfoByCode, handleGetCourseInfoByAttribute};