import axios from "axios";
import { BCInstitution, BCTransferSubject } from "../Types/ScraperTypes";

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
    };
  } catch (error) {
    console.error("Error fetching institution info:", error);
    throw error;
  }
}

const getTransfersForInstitution = async(institutionTitle: string, subjectCode: string, subjectId: number ) => {

  const institution = await getInstitutionInfo(institutionTitle);
  let page = 1;//Uses 1 for the first page so we can grab the max amount
  const headers = {
    "institutionCode": institution.Id,
    "isMember": true,
    "isPublic": null,
    "pageNumber": page,
    "sender": institution.Code,
    "subjectCode": subjectCode,
    "subjectId": subjectId,
    "year": 2025 //I have no clue why the need the year as it shows past transfers
  }
}

export { getBCTransferSubjectIDs };
