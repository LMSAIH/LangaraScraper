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
      handleSaveToDB(Number(year), Number(semester), courseData);
    }

    // Calculate totals for response
    const totalSections = courseData.reduce(
      (sum, course) => sum + course.sections.length,
      0
    );
    const totalMeetingTimes = courseData.reduce(
      (sum, course) =>
        sum +
        course.sections.reduce(
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
const handleSaveToDB = async (
  year: number,
  semester: number,
  data: CourseData[]
) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const term = `${year}${semester}`;

      // Delete old data for the specified year and semester
      const [courseDeleteResult, sectionDeleteResult, meetingDeleteResult] =
        await Promise.all([
          DBCourseData.deleteMany({
            year: Number(year),
            semester: Number(semester),
          }),
          CourseSection.deleteMany({
            year: Number(year),
            semester: Number(semester),
          }),
          MeetingTime.deleteMany({
            year: Number(year),
            semester: Number(semester),
          }),
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
      const [courseInsertResult, sectionInsertResult, meetingInsertResult] =
        await Promise.all([
          coursesToInsert.length > 0
            ? DBCourseData.insertMany(coursesToInsert)
            : [],
          sectionsToInsert.length > 0
            ? CourseSection.insertMany(sectionsToInsert)
            : [],
          meetingTimesToInsert.length > 0
            ? MeetingTime.insertMany(meetingTimesToInsert)
            : [],
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
};

const handleGetAllHistoricalCourses = async (req: Request, res: Response): Promise<void> => {
  const { saveToDb = false } = req.body;

  try {
    const startYear = 1999;
    const startSemester = 20; // Summer 1999
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Determine current semester based on month
    const month = currentDate.getMonth() + 1; // getMonth() is 0-indexed
    let currentSemester: number;
    
    if (month >= 1 && month <= 4) {
      currentSemester = 10; // Spring
    } else if (month >= 5 && month <= 8) {
      currentSemester = 20; // Summer
    } else {
      currentSemester = 30; // Fall
    }

    console.log(`Starting historical scrape from ${startYear}/${startSemester} to ${currentYear}/${currentSemester}`);

    const allCourseData: CourseData[] = [];
    const scrapingResults = [];
    let totalProcessed = 0;
    let totalErrors = 0;

    // Generate all year/semester combinations
    for (let year = startYear; year <= currentYear; year++) {
      const semesters = year === currentYear 
        ? getCurrentSemester(currentSemester)
        : [10, 20, 30]; // Spring, Summer, Fall
      
      for (const semester of semesters) {
        // Skip if before start point
        if (year === startYear && semester < startSemester) {
          continue;
        }

        try {
          console.log(`Scraping ${year}/${semester}...`);
          
          const subjects = await getSubjects(year, semester);
          
          // Skip if no subjects found (likely semester doesn't exist)
          if (!subjects || subjects.length === 0) {
            console.log(`No subjects found for ${year}/${semester}, skipping...`);
            continue;
          }

          const coursesHtml = await getCourses(year, semester, subjects);
          const courseData = parseCourseData(coursesHtml);

          // Add to accumulated data
          allCourseData.push(...courseData);

          // Save to database if requested
          if (saveToDb) {
            await handleSaveToDB(year, semester, courseData);
          }

          const totalSections = courseData.reduce((sum, course) => sum + course.sections.length, 0);
          const totalMeetingTimes = courseData.reduce(
            (sum, course) =>
              sum + course.sections.reduce((sectionSum, section) => sectionSum + section.data.length, 0),
            0
          );

          scrapingResults.push({
            year,
            semester,
            success: true,
            totalCourses: courseData.length,
            totalSections,
            totalMeetingTimes,
          });

          totalProcessed++;
          console.log(`✅ Completed ${year}/${semester}: ${courseData.length} courses, ${totalSections} sections`);

          // Add delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error: any) {
          console.error(`❌ Error scraping ${year}/${semester}:`, error.message);
          totalErrors++;
          
          scrapingResults.push({
            year,
            semester,
            success: false,
            error: error.message,
          });
        }
      }
    }

    // Calculate final totals
    const totalCourses = allCourseData.length;
    const totalSections = allCourseData.reduce((sum, course) => sum + course.sections.length, 0);
    const totalMeetingTimes = allCourseData.reduce(
      (sum, course) =>
        sum + course.sections.reduce((sectionSum, section) => sectionSum + section.data.length, 0),
      0
    );

    const response = {
      success: true,
      message: `Historical scraping completed from ${startYear}/${startSemester} to ${currentYear}/${currentSemester}`,
      summary: {
        periodsProcessed: totalProcessed,
        periodsWithErrors: totalErrors,
        totalCourses,
        totalSections,
        totalMeetingTimes,
      },
      details: scrapingResults,
      timestamp: new Date().toISOString(),
    };

    console.log(`🎉 Historical scraping completed! Processed ${totalProcessed} periods with ${totalErrors} errors.`);
    res.json(response);

  } catch (error: any) {
    console.error("Error in historical scraping:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// Helper function to get semesters up to current
const getCurrentSemester = (currentSemester: number): number[] => {
  const semesters = [];
  if (currentSemester >= 10) semesters.push(10); // Spring
  if (currentSemester >= 20) semesters.push(20); // Summer
  if (currentSemester >= 30) semesters.push(30); // Fall
  return semesters;
};

// Export the new function
export { handleGetSubjects, handleGetCourses, handleGetAllHistoricalCourses};
