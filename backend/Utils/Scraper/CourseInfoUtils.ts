import axios from "axios";
import * as cheerio from "cheerio";
import { CourseInfo } from "../../Models/CourseInfo";
import { getCourses, getSubjects } from "./ScraperUtils";
import { CourseInfo as CourseInfoModel, ICourseInfo } from "../../Models/CourseInfo";
import { get } from "http";

interface CourseAttribute {
    courseCode: string;
    attributes: string[];
}

const getAttributes = async () : Promise<CourseAttribute[]> => {
    const url = "https://swing.langara.bc.ca/prod/hzgkcald.P_DispCrseAttr";
    
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        
        const attributesOptions = ["2AR", "2SC", "HUM", "LSC", "SCI", "SOC", "UT"];
        
        let courseAttributes: CourseAttribute[] = [];
        // Find the main table with course attributes
        $("table tr").each((index, row) => {
            const $row = $(row);
            const cells = $row.find("td");
            const courseCode = $(cells[0]).text().trim();  
            const attributes: string[] = [];
        
            if (/^[A-Z]{2,4}\s\d{4}$/.test(courseCode) && cells.length >= 8) {
            
              // Check if the course has any attributes
              attributesOptions.forEach((attribute, index) => {
                if ($(cells[index + 1]).text().trim() === "Y") attributes.push(attribute);
              });        

              courseAttributes.push({
                courseCode: courseCode,
                attributes: attributes
              });
            }
        });
        console.log("Got attributes", courseAttributes.length);
        return courseAttributes;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw new Error("Failed to fetch attributes");
  }

}

export interface CourseDescription {
    courseCode: string;
    title?: string;
    description?: string;
}

const getCourseDescription = async (year: number , semester: number) => {
    try {
        // Get all subjects first
        const subjects = await getSubjects(year, semester);
        
        // Use the existing getCourses function to get course data
        const courseDataHtml = await getCourses(year, semester, subjects);
        const $ = cheerio.load(courseDataHtml);
        
        const courseDescriptions: CourseDescription[] = [];
        const allCourseCodes: string[] = [];

        // Extract course codes from the course header rows
        $("table.dataentrytable tr").each((index, row) => {
            const $row = $(row);
            const courseHeaderCell = $row.find('td[colspan="19"].dedefault b');
            
            if (courseHeaderCell.length > 0) {
                const courseCode = courseHeaderCell.text().trim();
                
                if (courseCode && /^[A-Z]{2,4}\s\d{4}$/.test(courseCode)) {
                    allCourseCodes.push(courseCode);
                }
            }
        });
        console.log("Got course codes", allCourseCodes.length);
        // For each course code, navigate to the individual course page
        for (const courseCode of allCourseCodes) {
            const [subject, courseNumber] = courseCode.split(" ");
            const courseUrl = `https://langara.ca/programs-courses/${subject}-${courseNumber}`;
            
            try {
              const courseResponse = await axios.get(courseUrl);
              const $course = cheerio.load(courseResponse.data);
              
              const title = $course('h1').text().trim();

              const description = $course(".field--name-field-description .field__item").text().trim();

              courseDescriptions.push({
                  courseCode: courseCode,
                  title: title,
                  description: description
              });
              
                
                // Add a small delay to avoid overwhelming the server
                //await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Error fetching description for ${courseCode}:`, error);
                throw new Error(`Failed to fetch description for ${courseCode}`);
            }
        }
        console.log("Got descriptions", courseDescriptions.length);
        return courseDescriptions;
    } catch (error) {
        console.error("Error fetching course descriptions:", error);
        throw new Error("Failed to fetch course descriptions");
    }
};

// Merge course descriptions and attributes into CourseInfo objects
const getCourseInfo = async (year: number, semester: number): Promise<ICourseInfo[]> => {
    // Get descriptions and attributes
    const [descriptions, attributes] = await Promise.all([
        getCourseDescription(year, semester),
        getAttributes()
    ]);

    // Map attributes by courseCode for quick lookup
    const attrMap = new Map<string, string[]>();
    for (const attr of attributes) {
        attrMap.set(attr.courseCode, attr.attributes);
    }

    // Merge into CourseInfo objects
    const merged: ICourseInfo[] = descriptions.map(desc => {
        return {
            courseCode: desc.courseCode,
            title: desc.title,
            description: desc.description,
            attributes: attrMap.get(desc.courseCode) || [],
            createdAt: new Date(),
            updatedAt: new Date(),
        } as ICourseInfo;
    });
    console.log("Got course info", merged.length);
    return merged;

};
getCourseInfo(2025, 30);
// Export the function
export { getCourseInfo };