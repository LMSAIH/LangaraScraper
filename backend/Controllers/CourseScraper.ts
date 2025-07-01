import { Request, Response } from "express";
import {
  getSubjects,
  getCourses,
  parseCourseData,
} from "../Utils/Scraper/ScraperUtils";
import { CourseData } from "../Types/ScraperTypes";
import { CourseData as DBCourseData } from "../Models/CourseData";
import { CourseSection } from "../Models/CourseSection";
import { MeetingTime } from "../Models/MeetingTime";
import mongoose from "mongoose";

const handleGetSubjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { year, semester } = req.query;

  if (!year || !semester) {
    res.status(400).json({ error: "Year and semester are required" });
    return;
  }

  try {
    const subjects = await getSubjects(Number(year), Number(semester));
    res.json({ subjects: subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleGetCourses = async (req: Request, res: Response): Promise<void> => {
  const { year, semester, saveToDb = false } = req.body;

  if (!year || !semester) {
    res.status(400).json({
      error: "Year and semester are required",
      example: {
        year: 2025,
        semester: 30,
        saveToDb: true,
      },
    });
    return;
  }

  try {
    const subjects = await getSubjects(Number(year), Number(semester));
    const coursesHtml = await getCourses(
      Number(year),
      Number(semester),
      subjects
    );
    const courseData = parseCourseData(coursesHtml);

    // Save to database if requested
    if (saveToDb) {
      handleSaveToDB(Number(year), Number(semester), courseData)
    }

    // Calculate totals for response
    const totalSections = courseData.reduce(
      (sum, course) => sum + course.sections.length,
      0
    );
    const totalMeetingTimes = courseData.reduce(
      (sum, course) => sum + course.sections.reduce(
        (sectionSum, section) => sectionSum + section.data.length,
        0
      ),
      0
    );

    // Build response object
    const response = {
      success: true,
      year: Number(year),
      semester: Number(semester),
      scraped: {
        totalCourses: courseData.length,
        totalSections,
        totalMeetingTimes,
        courses: courseData,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

//This is a helper function for handleGetCourses that autopopulates the database with the scraped course data.
//The old data is removed before inserting the new data to avoid duplicates.
const handleSaveToDB = async (year: number, semester: number, data: CourseData[]) => {
  const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const term = `${year}${semester}`;
          
          // Delete old data for the specified year and semester
          const [courseDeleteResult, sectionDeleteResult, meetingDeleteResult] = await Promise.all([
            DBCourseData.deleteMany({ year: Number(year), semester: Number(semester) }),
            CourseSection.deleteMany({ year: Number(year), semester: Number(semester) }),
            MeetingTime.deleteMany({ year: Number(year), semester: Number(semester) })
          ]);

          // Prepare data for insertion
          const coursesToInsert = [];
          const sectionsToInsert = [];
          const meetingTimesToInsert = [];

          for (const course of data) {
            // Add course data
            coursesToInsert.push({
              courseCode: course.courseCode,
              subject: course.subject,
              term,
              year: Number(year),
              semester: Number(semester),
            });

            // Add sections and meeting times
            for (const section of course.sections) {
              sectionsToInsert.push({
                courseCode: course.courseCode,
                crn: section.crn,
                subject: section.subject,
                course: section.course,
                section: section.section,
                credits: section.credits,
                title: section.title,
                seatsAvailable: section.seatsAvailable,
                waitlist: section.waitlist,
                additionalFees: section.additionalFees,
                repeatLimit: section.repeatLimit,
                notes: section.notes,
                term,
                year: Number(year),
                semester: Number(semester),
              });

              // Add meeting times for this section
              for (const meetingTime of section.data) {
                meetingTimesToInsert.push({
                  sectionCRN: section.crn,
                  sectionType: meetingTime.SectionType,
                  days: meetingTime.Days,
                  time: meetingTime.Time,
                  room: meetingTime.Room,
                  instructor: meetingTime.Instructor,
                  term,
                  year: Number(year),
                  semester: Number(semester),
                });
              }
            }
          }

          // Insert new data in parallel
          const [courseInsertResult, sectionInsertResult, meetingInsertResult] = await Promise.all([
            coursesToInsert.length > 0 ? DBCourseData.insertMany(coursesToInsert) : [],
            sectionsToInsert.length > 0 ? CourseSection.insertMany(sectionsToInsert) : [],
            meetingTimesToInsert.length > 0 ? MeetingTime.insertMany(meetingTimesToInsert) : []
          ]);

          console.log(
            `Deleted: ${courseDeleteResult.deletedCount} courses, ${sectionDeleteResult.deletedCount} sections, ${meetingDeleteResult.deletedCount} meeting times`
          );
          console.log(
            `Inserted: ${courseInsertResult.length} courses, ${sectionInsertResult.length} sections, ${meetingInsertResult.length} meeting times`
          );
        });
      } finally {
        session.endSession();
      }
}

export { handleGetSubjects, handleGetCourses };
