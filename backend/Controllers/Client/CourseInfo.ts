import { Request, Response } from "express";
import { getCurrentSemester } from "../../Utils/Scraper/CourseInfoUtils";
import { CourseInfo } from "../../Models/CourseInfo";

//get all course info from the database from a specific date range(if not provided, it will get all course info from the database)
const handleGetCourseInfo = async (req: Request, res: Response) => {
    try {
        let { startYear, startSemester } = req.query; //all might be optional depending on the user's request


    if (!startYear || !startSemester) {
        res.status(400).json({ success: false, error: "Start year and start semester are required" });
      return;
    }
    const query: any = {};

    const currentYear = new Date().getFullYear();
    const currentSemester = getCurrentSemester();

    query.year = { $gte: Number(startYear), $lte: currentYear };
    query.semester = { $gte: Number(startSemester), $lte: currentSemester };

    const courseInfo = await CourseInfo.find(query).sort({ courseCode: 1 });

    if(!courseInfo) {
        res.status(404).json({ error: "Course info not found" });
        return;
    }

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

export { handleGetCourseInfo, handleGetCourseInfoByCode, handleGetCourseInfoByAttribute};