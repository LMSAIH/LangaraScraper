import { Request, Response } from "express";
import { CourseInfo } from "../../Models/CourseInfo";

//get all course info from the database with pagination and filtering
const handleGetCourseInfo = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;
        
        // Filter parameters
        const subject = req.query.subject as string;
        const courseCode = req.query.courseCode as string;
        const attribute = req.query.attribute as string;

        // Build query
        const query: any = {};
        
        if (subject) {
            // Find courses that start with the subject (e.g., "CPSC" matches "CPSC 1050", "CPSC 1181", etc.)
            query.courseCode = new RegExp(`^${subject.toUpperCase()}\\s`, 'i');
        }
        
        if (courseCode) {
            // Search for courses containing the course code (partial match)
            query.courseCode = new RegExp(courseCode, 'i');
        }

        if (attribute) {
            // Filter by attribute (e.g., "UT", "HUM", etc.)
            query.attributes = { $in: [attribute.toUpperCase()] };
        }

        // Get total count for pagination metadata
        const totalCourses = await CourseInfo.countDocuments(query);
        const totalPages = Math.ceil(totalCourses / limit);

        // Get paginated courses
        const courseInfo = await CourseInfo.find(query)
            .sort({ courseCode: 1 }) // Sort by course code for consistent ordering
            .skip(skip)
            .limit(limit);


        res.json({
            courses: courseInfo,
            pagination: {
                page: page,
                totalPages: totalPages,
                total: totalCourses,
                limit: limit,
            },
        });
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
            return res.status(404).json({ error: "Course not found" });
        }

        res.json(courseInfo);
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

const handleGetCourseInfoByAttribute = async (req: Request, res: Response) => {
    try {
        const { attribute } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Build query for attribute filtering
        const query = { attributes: { $in: [attribute.toUpperCase()] } };

        // Get total count for pagination metadata
        const totalCourses = await CourseInfo.countDocuments(query);
        const totalPages = Math.ceil(totalCourses / limit);

        // Get paginated courses with attribute filter
        const courseInfo = await CourseInfo.find(query)
            .sort({ courseCode: 1 }) // Sort by course code for consistent ordering
            .skip(skip)
            .limit(limit);

        res.json({
            courses: courseInfo,
            pagination: {
                page: page,
                totalPages: totalPages,
                total: totalCourses,
                limit: limit,
            },
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get course info" });
    }
}

const handleGetSubjects = async (req: Request, res: Response) => {
    try {
        // Get all unique subjects from course codes
        const courseInfo = await CourseInfo.find({}, { courseCode: 1 });
        
        const subjects = new Set<string>();
        
        courseInfo.forEach(course => {
            // Extract subject from course code (e.g., "CPSC 1050" -> "CPSC")
            const match = course.courseCode.match(/^([A-Z]+)/);
            if (match) {
                subjects.add(match[1]);
            }
        });
        
        // Convert Set to sorted array
        const subjectsArray = Array.from(subjects).sort();
        
        res.json({
            subjects: subjectsArray,
            count: subjectsArray.length
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to get subjects" });
    }
}

export { handleGetCourseInfo, handleGetCourseInfoByCode, handleGetCourseInfoByAttribute, handleGetSubjects};