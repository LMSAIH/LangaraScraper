import axios from "axios";
import * as cheerio from "cheerio";
import { ICourseInfo } from "../../Models/CourseInfo";
import { CourseAttribute, CourseDescription } from "../../Types/ScraperTypes";
import { CourseData } from "../../Models/CourseData";

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
        return courseAttributes;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw new Error("Failed to fetch attributes");
  }

}

const getCourseDescription = async (startYear: number) => {
    try {
        let courseCodes: string[] = [];

        // If startYear is provided, get course codes from startYear to current year, otherwise get all course codes
        if(startYear) {
          const currentYear = new Date().getFullYear();
          courseCodes = await CourseData.find({
            year: { $gte: startYear, $lte: currentYear }
          }).distinct('courseCode');
          
        } else {
            courseCodes = await CourseData.distinct('courseCode');
        }
        
        const courseDescriptions: CourseDescription[] = [];

        // For each course code, navigate to the individual course page
        for (const courseCode of courseCodes) {
            const [subject, courseNumber] = courseCode.split(" ");
            const courseUrl = `https://langara.ca/programs-courses/${subject}-${courseNumber}`;
            
            try {
              let courseResponse = null;
              try {
                courseResponse = await axios.get(courseUrl);
              } catch (error: any) {
                if(error.response.status === 404) {
                  courseDescriptions.push({
                    courseCode: courseCode,
                    title: "Course not found",  
                    description: "This course is no longer offered."
                  });
                  continue;
                }
              }
              if(!courseResponse) {
                continue;
              }
              const $course = cheerio.load(courseResponse.data);
              
              let title = $course('h1').text().trim();
              let description = $course(".field--name-field-description .field__item").text().trim();

              courseDescriptions.push({
                  courseCode: courseCode,
                  title: title,
                  description: description
              });
                
            } catch (error) {                
                console.error(`Error fetching description for ${courseCode}:`, error);
                throw new Error(`Failed to fetch description for ${courseCode}`);
            }
        }
        return courseDescriptions;
    } catch (error) {
        console.error("Error fetching course descriptions:", error);
        throw new Error("Failed to fetch course descriptions");
    }
};

// Merge course descriptions and attributes into CourseInfo objects from a specidic date 
const getCourseInfo = async (startYear: number): Promise<ICourseInfo[]> => {
    // Get descriptions and attributes

    const [descriptions, attributes] = await Promise.all([
        getCourseDescription(startYear),
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
            updatedAt: new Date(),
        } as ICourseInfo;
    });
    return merged;

};

const getCurrentSemester = (): number => {
    const currentMonth = new Date().getMonth() + 1;
    let currentSemester = 0;
    if(currentMonth < 4) currentSemester = 10;
    else if(currentMonth < 8) currentSemester = 20;
    else currentSemester = 30;
    return currentSemester;
}

// Export the function
export { getCourseInfo, getCurrentSemester};
