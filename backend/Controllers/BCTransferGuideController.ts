import axios from "axios";
import { BCTransferSubject } from "../Types/ScraperTypes";

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

export { getBCTransferSubjectIDs };
