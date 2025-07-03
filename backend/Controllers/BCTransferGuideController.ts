import axios from "axios";
import { BCInstitution, BCTransferSubject, BCTransferAgreement, BCTransferCourse } from "../Types/ScraperTypes";

const getBCTransferSubjectIDs = async (institutionID: number) => {
  const getSubjectsURL = `https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetSubjects?institutionID=${institutionID}&sending=true`;

  try {

    const response = await axios.get(getSubjectsURL);

    response.data.forEach((subject: BCTransferSubject) => {
      console.log(subject.Id + ", " + subject.Code + ", " + subject.Title);
    });
    
    return response.data.map((subject: BCTransferSubject) => ({
      id: subject.Id,
      code: subject.Code,
      title: subject.Title
    }));

  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
}

const getInstitutionInfo = async(InstitutionTitle: string): Promise<BCInstitution> => {
  const getInstituionsUrl = 'https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetFromInstitutions?countryId=40&internalOnly=true'
  
  try{

     const response = await axios.get(getInstituionsUrl);

    const rawInstitution = response.data.find((inst: any) => inst.Title === InstitutionTitle);
    
    if (!rawInstitution) {
      throw new Error(`Institution "${InstitutionTitle}" not found`);
    }

    return {//Clean up so we only store necessary information
      Id: rawInstitution.Id,
      Code: rawInstitution.Code,
      SubjectList: []
    };
  } catch (error) {
    console.error("Error fetching institution info:", error);
    throw error;
  }
}

const fetchNonce = async(): Promise<string> => {
  const fetchURL = `https://www.bctransferguide.ca/transfer-options/search-courses/`
  
  const response = await axios.get(fetchURL);
  const nonceMatch = response.data.match(/id="c2c-search-filters" nonce="([^"]+)"/);
  if (!nonceMatch) {
    throw new Error("Nonce not found");
  }
  return nonceMatch[1];
}

const getTransfersForInstitution = async(institutionTitle: string) => {
  try{
    const institution = await getInstitutionInfo(institutionTitle);
    const subjects = await getBCTransferSubjectIDs(institution.Id);

    const wpnonce = await fetchNonce();

    subjects.forEach((subject: BCTransferSubject) => {
      getTransfersForSubject(institution, subject, wpnonce);
      //Do something with the transfer data for each subject or smth

    });
  } catch(error){
    console.error("Error fetching transfers:", error);
    throw error;
  }
  
}

const getTransfersForSubject = async(institution: BCInstitution,subject: BCTransferSubject, wpnonce: string) => {
  try{
    const fetchTransferURL = `https://www.bctransferguide.ca/wp-json/bctg-search/course-to-course/search-from?_wpnonce=${wpnonce}`
    
    let page: number = 1;//Uses 1 for the first page so we can grab the max amount
    const requestData = {
      sender: institution.Id,
      institutionCode: institution.Code,
      subjectId: subject.Id,
      subjectCode: subject.Code,//"MATH" "CPSC"
      year: 2025,
      pageNumber: page,
      isMember: true,//Every institution in BC is a member, iF we want to do cross-provincial this will need to be changed
      isPublic: null//Not every institution is public but I guess the api doesn't care???
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const firstResponse = await axios.post(fetchTransferURL, requestData, config)
    const pagesTotal = firstResponse.data.totalPages;


    for (page = 1; page <= pagesTotal; page++){
      //Save the transfer data / fetch it
      let response = await axios.post(fetchTransferURL,requestData, config)
      
    }

  } catch(error){

  }
}

const getTransfersForCourse = async(courseNumber: number, subjectCode: string, subjectId: number, institutionCode: string,institutionId: number, wpnonce: string){
  try{
    const fetchTransferURL = `https://www.bctransferguide.ca/wp-json/bctg-search/course-to-course/search-from?_wpnonce=${wpnonce}`
    let page: number = 1;//Uses 1 for the first page so we can grab the max amount
    const requestData = {
      courseNumber: courseNumber,
      institutionCode: institutionCode,
      isMember: true,//Every institution in BC is a member, iF we want to do cross-provincial this will need to be changed
      isPublic: null,//Not every institution is public but I guess the api doesn't care???
      pageNumber: page,
      sender: institutionId,
      subjectCode: subjectCode,//"MATH" "CPSC"
      subjectId: subjectId, //Unique for BCTransfer, CPSC = 531
      year: 2025
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    const firstResponse = await axios.post(fetchTransferURL, requestData, config)
    const pagesTotal = firstResponse.data.totalPages;

    if (firstResponse === pagesTotal){
      return firstResponse.data.courses[0].agreements;
    } else{
      //Have to scan through multiple pages
    }

  } catch (error){

  }
}
export { getTransfersForInstitution };
