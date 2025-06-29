import axios from "axios";
import { Router, Request, Response } from "express";
import * as cheerio from "cheerio";

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

const getCourses = async (year: number, semester: number, subject: string) => {
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
  formData.append("sel_subj", subject); 
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
      subjects[0]
    );

    // Parse the HTML to extract course information
    const $ = cheerio.load(coursesHtml);

    // You can customize this parsing based on the actual HTML structure
    res.send(coursesHtml);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export { router };
