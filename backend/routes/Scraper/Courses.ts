import axios from "axios";
import { Router, Request, Response } from "express";
import * as cheerio from "cheerio";

interface CourseSection {
  crn: string;
  subject: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  type: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
  seatsAvailable: string;
  waitlist: string;
  additionalFees: string;
  repeatLimit: string;
  notes?: string;
}

interface CourseData {
  courseCode: string;
  subject: string;
  sections: CourseSection[];
}

const router = Router();

const getSubjects = async (year: number, semester: number) => {
  const url = `https://swing.langara.bc.ca/prod/hzgkfcls.P_Sel_Crse_Search?term=${year}${semester}`;

  try {
    const response = await axios.get(url);
    const subjects = response.data;

    const $ = cheerio.load(subjects);

    const subjectList: string[] = [];

    $('select[name="sel_subj"] option').each((index, element) => {
      const code = $(element).attr("value");

      if (code) {
        subjectList.push(code);
      }
    });

    return subjectList;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw new Error("Failed to fetch subjects");
  }
};

const getCourses = async (
  year: number,
  semester: number,
  subjects: string[]
) => {
  const url = "https://swing.langara.bc.ca/prod/hzgkfcls.P_GetCrse";

  const formData = new URLSearchParams();

  formData.append("term_in", `${year}${semester}`);
  formData.append("sel_subj", "dummy");
  formData.append("sel_day", "dummy");
  formData.append("sel_schd", "dummy");
  formData.append("sel_insm", "dummy");
  formData.append("sel_camp", "dummy");
  formData.append("sel_levl", "dummy");
  formData.append("sel_sess", "dummy");
  formData.append("sel_instr", "dummy");
  formData.append("sel_ptrm", "dummy");
  formData.append("sel_attr", "dummy");
  formData.append("sel_dept", "dummy");
  formData.append("sel_crse", "");
  formData.append("sel_title", "%");
  formData.append("sel_dept", "%");
  formData.append("begin_hh", "0");
  formData.append("begin_mi", "0");
  formData.append("begin_ap", "a");
  formData.append("end_hh", "0");
  formData.append("end_mi", "0");
  formData.append("end_ap", "a");
  formData.append("sel_incl_restr", "Y");
  formData.append("sel_incl_preq", "Y");
  formData.append("SUB_BTN", "Get Courses");

  subjects.forEach((subject) => {
    formData.append("sel_subj", subject);
  });

  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw new Error("Failed to fetch courses");
  }
};

const parseCourseData = (html: string): CourseData[] => {
  const $ = cheerio.load(html);
  const courses: CourseData[] = [];
  let currentCourse: CourseData = {
    courseCode: "",
    subject: "",
    sections: [],
  };

  $("table.dataentrytable tr").each((index, row) => {
    const $row = $(row);

    // Check if this is a course header row (e.g., "ABST 1100")
    const courseHeaderCell = $row.find('td[colspan="19"].dedefault b');
    if (courseHeaderCell.length > 0) {
      const courseCode = courseHeaderCell.text().trim();

      if (courseCode && /^[A-Z]{2,4}\s\d{4}$/.test(courseCode)) {
        // Save previous course if exists
        if (currentCourse && currentCourse.sections.length > 0) {
          courses.push(currentCourse);
        }

        // Start new course
        const [subject, courseNumber] = courseCode.split(" ");
        currentCourse = {
          courseCode: courseCode,
          subject: subject,
          sections: [],
        };
      }
      return;
    }

    // Check if this is a section data row
    const cells = $row.find("td");
    if (cells.length >= 19 && currentCourse) {
      const seatsAvail = $(cells[1]).text().trim();
      const waitlist = $(cells[2]).text().trim();
      const crn = $(cells[4]).text().trim();
      const subject = $(cells[5]).text().trim();
      const course = $(cells[6]).text().trim();
      const section = $(cells[7]).text().trim();
      const credits = $(cells[8]).text().trim();
      const title = $(cells[9]).text().trim();
      const additionalFees = $(cells[10]).text().trim();
      const repeatLimit = $(cells[11]).text().trim();
      const type = $(cells[12]).text().trim();
      const days = $(cells[13]).text().trim();
      const time = $(cells[14]).text().trim();
      const room = $(cells[17]).text().trim();
      const instructor = $(cells[18]).text().trim();

      // Only add if we have essential data (CRN is a good indicator)
      if (crn && /^\d+$/.test(crn)) {
        const courseSection: CourseSection = {
          crn,
          subject,
          course,
          section,
          credits,
          title,
          type,
          days,
          time,
          room,
          instructor,
          seatsAvailable: seatsAvail,
          waitlist,
          additionalFees,
          repeatLimit,
        };

        currentCourse.sections.push(courseSection);
      }
    }

    // Check for notes row (usually spans multiple columns)
    const notesCell = $row.find('td[colspan="6"] em');
    if (
      notesCell.length > 0 &&
      currentCourse &&
      currentCourse.sections.length > 0
    ) {
      const notes = notesCell.text().trim();
      const lastSection =
        currentCourse.sections[currentCourse.sections.length - 1];
      lastSection.notes = notes;
    }
  });

  // Don't forget the last course
  if (currentCourse && currentCourse.sections.length > 0) {
    courses.push(currentCourse);
  }

  return courses;
};

router.get("/subjects", async (req: Request, res: Response): Promise<void> => {
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
});

router.post("/courses", async (req: Request, res: Response): Promise<void> => {
  const { year, semester } = req.body;

  if (!year || !semester) {
    res.status(400).json({
      error: "Year, semester, and subject are required",
      example: {
        year: 2025,
        semester: 30,
      },
    });
    return;
  }

  try {
    const subjects = await getSubjects(Number(year), Number(semester));

    console.log(year, semester, subjects[3]);
    const coursesHtml = await getCourses(
      Number(year),
      Number(semester),
      subjects
    );

    // Parse the HTML to extract course information
    const $ = cheerio.load(coursesHtml);

    const courseData = parseCourseData(coursesHtml);

    // You can customize this parsing based on the actual HTML structure
    res.json({
      success: true,
      year: Number(year),
      semester: Number(semester),
      totalCourses: courseData.length,
      totalSections: courseData.reduce(
        (sum, course) => sum + course.sections.length,
        0
      ),
      courses: courseData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export { router };
