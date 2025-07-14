import { Request, Response } from "express";
import { getCourseInfo } from "../../Utils/Scraper/CourseInfoUtils";
import { CourseInfo } from "../../Models/CourseInfo";
import { getCurrentSemester } from "../../Utils/Scraper/ScraperUtils";

//get all course info from the database from a specific date range(if not provided, it will get all course info from the database)
const handleGetAllCoursesInfo = async (req: Request, res: Response) => {
    try {
        let { startYear, startSemester, endYear, endSemester } = req.query; //all might be optional depending on the user's request

        //checking if all four parameters are provided
        const params = [startYear, startSemester, endYear, endSemester];
        const provided = params.filter(v => v !== undefined && v !== null && v !== '');

    if (provided.length > 0 && provided.length < 4) {
        res.status(400).json({ success: false, error: "If any of startYear, startSemester, endYear, or endSemester is provided, all four must be provided." });
      return;
    }

    if (provided.length === 4) {
      if (Number(startYear) > Number(endYear)) {
        res.status(400).json({ success: false, error: "Start year must be less than end year" });
        return;
      }
      if (startYear === endYear && Number(startSemester) > Number(endSemester)) {
        res.status(400).json({ success: false, error: "Start semester must be less than end semester" });
        return;
      }
    } 
    const query: any = {};
    (startYear && endYear) ? query.year = { $gte: Number(startYear), $lte: Number(endYear) } : query.year = { $gte: 1990, $lte: new Date().getFullYear() };
    (startSemester && endSemester) ? query.semester = { $gte: Number(startSemester), $lte: Number(endSemester) } : query.semester = { $gte: 10, $lte: getCurrentSemester(new Date().getMonth() + 1) };

    const courseInfo = await CourseInfo.distinct('courseCode', query);

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
export { handleGetAllCoursesInfo, handleGetCourseInfoByCode, handleGetCourseInfoByAttribute };