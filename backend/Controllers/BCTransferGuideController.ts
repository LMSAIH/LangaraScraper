import axios from "axios";
import mongoose from "mongoose";
import { Request, Response} from "express";
import { CourseTransferData as DBTransferData } from "../Models/CourseTransferData"
import { BCTransferAgreement} from "../Types/ScraperTypes";

const handleGetUniqueCourseTransfer = async (
  req: Request, 
  res: Response
): Promise<void> => {
  const {courseNumber, subjectCode, institutionCode } = req.query;
  
  if (!courseNumber || !subjectCode || !institutionCode){
    res.status(400).json({ error: "courseNumber, subjectCode, and institutionCode are required" });
    return;
  }

  try {
    const transfers = await getTransfersForCourse(Number(courseNumber), String(subjectCode), String(institutionCode));
    res.json({ transferAgreements: transfers });
  } catch (error) {
    console.error("error fetching transfer agreements", error);
    res.status(500).json({ error: "Internal Server Error"});
    return;
  }
};

//Needs redis implementation, Note this can throw an error so it should be put into redis ASAP
const fetchNonce = async(): Promise<string> => {
  const fetchURL = `https://www.bctransferguide.ca/transfer-options/search-courses/`
  
  const response = await axios.get(fetchURL);
  const nonceMatch = response.data.match(/id="c2c-search-filters" nonce="([^"]+)"/);
  if (!nonceMatch) {
    throw new Error("Nonce not found");
  }
  return nonceMatch[1];
}

const handleSaveToDB = async (
  data: BCTransferAgreement[]
) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Delete all existing transfer data
      const transferDeleteResult = await DBTransferData.deleteMany({});

      // Insert new data
      const transferInsertResult =
        data.length > 0
          ? await DBTransferData.insertMany(data)
          : [];

      console.log(
        `Deleted: ${transferDeleteResult.deletedCount} transfers`
      );
      console.log(
        `Inserted: ${transferInsertResult.length} transfers`
      );
    });
  } catch (error) {
    console.error('Error saving transfer data to database:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Helper function to process individual agreements
const processAgreement = (agreement: any, courseNumber: number, subjectCode: string, institutionCode: string, agreementsList: BCTransferAgreement[]) => {
  let agreementDetails: string = agreement.Detail;
  
  //Not every course has an End Date
  const varEndDate = agreement.EndDate === null ? null : agreement.EndDate;

  //Handle bundle course transfers
  if (agreementDetails.includes("=")){
    const [fromPart, toPart] = agreementDetails.split('=').map(part => part.trim());
    let fromCourseNumbers: string[]  = [];
    let fromCourseSubjects: string[] = [];
    let fromCourseCredits: number[] = [];
    let toCourseNumbers: string[]  = [];
    let toCourseSubjects: string[] = [];
    let toCourseCredits: number[] = [];

    // Parse the "from" part (left side of =)
    const fromCourses = fromPart.split('&').map(course => course.trim());
    const firstCourseMatch = fromCourses[0].match(/([A-Z]+)\s+([A-Z]+)\s+(\d+|[X1-9]+)\s+\((\d+)\)/);
    const secondCourseMatch = fromCourses[1]?.match(/([A-Z]+)\s+([A-Z]+)\s+(\d+|[X1-9]+)\s+\((\d+)\)/);
    
    if (firstCourseMatch && secondCourseMatch) {
      fromCourseSubjects.push(firstCourseMatch[2], secondCourseMatch[2]);
      fromCourseNumbers.push(firstCourseMatch[3],secondCourseMatch[3]);
      fromCourseCredits.push(parseInt(firstCourseMatch[4]), parseInt(secondCourseMatch[4]));
    }

    // Parse the "to" part (right side of =)
    const toCourses = toPart.split('&').map(course => course.trim());
    const ThirdCourseMatch = toCourses[0].match(/([A-Z]+)\s+([A-Z]+)\s+(\d+|[X1-9]+)\s+\((\d+)\)/);
    const FourthCourseMatch = toCourses[1]?.match(/([A-Z]+)\s+([A-Z]+)\s+(\d+|[X1-9]+)\s+\((\d+)\)/);
    
    if (ThirdCourseMatch && FourthCourseMatch) {
      toCourseSubjects.push(ThirdCourseMatch[2], FourthCourseMatch[2]);
      toCourseNumbers.push(ThirdCourseMatch[3],FourthCourseMatch[3]);
      toCourseCredits.push(parseInt(ThirdCourseMatch[4]), parseInt(FourthCourseMatch[4]));
    }

    agreementsList.push({
      SendingCourseNumber: fromCourseNumbers,
      SendingInstitutionCode: institutionCode,
      SendingSubject: fromCourseSubjects,
      SendingCredits: fromCourseCredits,
      RecevingInstitutionCode: agreement.RcvrInstitutionCode,
      ReceivingSubject: toCourseSubjects,
      ReceivingCredits: toCourseCredits,
      ReceivingCourseNumber: toCourseNumbers,
      StartDate: agreement.StartDate,
      EndDate: varEndDate,
    } as BCTransferAgreement);
  } 
  //Handle general prereq fufillments, SFU's Q fufillment
  else if (agreementDetails.includes('&')){
    const courseMatch = agreementDetails.match(/([A-Z]+)\s+([A-Z]+)\s+(\d+|[X1-9]+)\s+\((\d+)\)/);
    if (courseMatch) {
      const receivingSubject = courseMatch[2];
      const receivingCourseNumber = courseMatch[3];
      const receivingCredits = parseInt(courseMatch[4]);
      agreementsList.push({
        SendingCourseNumber: [String(courseNumber)],
        SendingInstitutionCode: institutionCode,
        SendingSubject: [subjectCode],
        SendingCredits: [agreement.SndrCourseCredit],
        RecevingInstitutionCode: agreement.RcvrInstitutionCode,
        ReceivingSubject: [receivingSubject],
        ReceivingCredits: [receivingCredits],
        ReceivingCourseNumber: [receivingCourseNumber],
        StartDate: agreement.StartDate,
        EndDate: varEndDate,
        details: agreement.Condition,
      } as BCTransferAgreement);
    }
  }
  //single transfer
  else{
    //Handle Courses that don't transfer
    if (agreementDetails === "No credit"){
      agreementsList.push({
        SendingCourseNumber: [String(courseNumber)],
        SendingInstitutionCode: institutionCode,
        SendingSubject: [subjectCode],
        SendingCredits: [agreement.SndrCourseCredit],
        RecevingInstitutionCode: agreement.RcvrInstitutionCode,
        ReceivingSubject: ["No Credit"],  
        ReceivingCredits: [0],
        ReceivingCourseNumber: ["No Credit"],
        StartDate: agreement.StartDate,
        EndDate: varEndDate,
      } as BCTransferAgreement);
    }
    //Courses that transfer as a 1-to-1
    else{
      const courseMatch = agreementDetails.match(/([A-Z]+)\s+([A-Z]+)\s+(\d+|[X1-9]+)\s+\((\d+)\)/);
      if (courseMatch) {
        const receivingSubject = courseMatch[2];
        const receivingCourseNumber = courseMatch[3];
        const receivingCredits = parseInt(courseMatch[4]);
        agreementsList.push({
          SendingCourseNumber: [String(courseNumber)],
          SendingInstitutionCode: institutionCode,
          SendingSubject: [subjectCode],
          SendingCredits: [agreement.SndrCourseCredit],
          RecevingInstitutionCode: agreement.RcvrInstitutionCode,
          ReceivingSubject: [receivingSubject],
          ReceivingCredits: [receivingCredits],
          ReceivingCourseNumber: [receivingCourseNumber],
          StartDate: agreement.StartDate,
          EndDate: varEndDate,
        } as BCTransferAgreement);
      }
    }
  }
};

const getTransfersForCourse = async(courseNumber: number, subjectCode: string, institutionCode: string): Promise<BCTransferAgreement[]> =>{
  
  const wpnonce = await fetchNonce();
  try{
      
    try{//Fetch institute info
        const getInstituionsURL = 'https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetFromInstitutions?countryId=40&internalOnly=true'

        const response = await axios.get(getInstituionsURL);
        const rawInstitution = response.data.find((inst: any) => inst.Code === institutionCode);
        if (!rawInstitution) {
          throw new Error(`Institution by '"${institutionCode}"' not found`);
        }
        var institutionID = rawInstitution.Id; // Langara = 15, UBC = 27, SFU = 24

    }catch(error){
      console.log("Error fetching course's institution ",error);
      throw error;
    }

    try{//Fetch subject info
      const getSubjectsURL = `https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetSubjects?institutionID=${institutionID}&sending=true`;
      const subjectsListResponse = await axios.get(getSubjectsURL)
      const subject = subjectsListResponse.data.find((subj: any) => subj.Code === subjectCode);
      if (!subject) {
        throw new Error(`Subject code '${subjectCode}' not found`);
      }
      var subjectId = subject.Id;
    } catch(error){
        console.log("Error fetching course's subject ",error);
        throw error;
    }
    try{
      const fetchTransferURL = `https://www.bctransferguide.ca/wp-json/bctg-search/course-to-course/search-from?_wpnonce=${wpnonce}`
      let page: number = 1;//Uses 1 for the first page so we can grab the max amount
      const requestData = {
      courseNumber: courseNumber,
      institutionCode: institutionCode,
      isMember: true,//Every institution in BC is a member, iF we want to do cross-provincial this will need to be changed
      isPublic: null,//Not every institution is public but I guess the api doesn't care???
      pageNumber: page,
      sender: institutionID,
      subjectCode: subjectCode,//"MATH" "CPSC"
      subjectId: subjectId, //Unique for BCTransfer, CPSC = 531
      year: 2025 //Can change for it to get autoset
      }; 
      const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      };
      const firstResponse = await axios.post(fetchTransferURL, requestData, config)
      if (!firstResponse){
        throw new Error(`Transfer Data for: '${subjectCode} ${courseNumber}' not found`);
      }

      const pagesTotal = firstResponse.data.totalPages;
      var agreementsList: BCTransferAgreement[] = [];
      
      // Always process first page (already fetched)
      for (const agreement of firstResponse.data.courses[0].agreements) {
        processAgreement(agreement, courseNumber, subjectCode, institutionCode, agreementsList);
      }

      // If there are multiple pages, fetch and process remaining pages
      if (pagesTotal > 1) {
        for (let currentPage = 2; currentPage <= pagesTotal; currentPage++) {
          const pageRequestData = {
            ...requestData,
            pageNumber: currentPage
          };

          const pageResponse = await axios.post(fetchTransferURL, pageRequestData, config);
          
          if (pageResponse && pageResponse.data.courses && pageResponse.data.courses[0]) {
            for (const agreement of pageResponse.data.courses[0].agreements) {
              processAgreement(agreement, courseNumber, subjectCode, institutionCode, agreementsList);
            }
          }
        }
      }
      return agreementsList as BCTransferAgreement[];
    }catch(error){
      console.log("Error fetching course-to-course info ",error);
      throw error;
    }
  } catch (error){
    console.log("Error fetching transfer agreements ",error);
    throw error;
  }
}

const updateTransfersForSchool = async(institutionCode: string) => {
  try {
    const wpnonce = await fetchNonce();

    const getInstitutionIdURL = `https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetFromInstitutions?countryId=40&internalOnly=true`;

    const institutionId = (await axios.get(getInstitutionIdURL)).data.find(
      (institution: any) => institution.Code === institutionCode)
      .Id;

    const getSubjectsURL = `https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetSubjects?institutionID=${institutionId}&sending=true`;

    const subjectsResponse = await axios.get(getSubjectsURL);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    const fetchTransfersURL = `https://www.bctransferguide.ca/wp-json/bctg-search/course-to-course/search-from?_wpnonce=${wpnonce}`;

    let allAgreements: BCTransferAgreement[] = [];

    for (const subj of subjectsResponse.data) { //For each subject in a college, fetch all transfers for the subject's courses
      let pageNum: number = 1;
      const requestPayload = {
        "sender": institutionId,
        "institutionCode": institutionCode,
        "subjectId": subj.Id,
        "subjectCode": subj.Code,
        "year": 2025,
        "pageNumber": pageNum,
        "isPublic": null,
        "isMember": true
      };
      
      let fetchTransfersResponse = await axios.post(fetchTransfersURL, requestPayload, config);
      
      for (let currentPage: number = pageNum; currentPage <= fetchTransfersResponse.data.totalPages; currentPage++) {//For each page 
        if (currentPage > 1) {
          requestPayload.pageNumber = currentPage;
          fetchTransfersResponse = await axios.post(fetchTransfersURL, requestPayload, config);
        }

        for (const course of fetchTransfersResponse.data.courses) {//For each course on the page
          for (const transfer of course.agreements) {//For each transfer agreement of a course
            processAgreement(transfer, transfer.SndrCourseNumber, subj.Code, institutionCode, allAgreements);
          }
        }
      }

      console.log(`Processed ${subj.Code} - found ${allAgreements.length} total agreements so far`);
    }

    // Save all agreements to database
    if (allAgreements.length > 0) {
      await handleSaveToDB(allAgreements);
      console.log(`Successfully saved ${allAgreements.length} transfer agreements for ${institutionCode}`);
    } else {
      console.log(`No transfer agreements found for ${institutionCode}`);
    }

    return allAgreements;
  } catch (error) {
    console.error(`Error updating transfers for school ${institutionCode}:`, error);
    throw error;
  }
};

export { handleGetUniqueCourseTransfer, updateTransfersForSchool };
