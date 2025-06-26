import { getSubjects } from './langara'; // Uncomment if you need to use getSubjects
import axios from 'axios';
import { Cheerio } from 'cheerio';
export interface BCTransferSubject {
    Id: number;
    Code: string;
    Title: string;
    }

export async function getBCTransferSubjectIDs(institutionID: number){
    const getSubjectsURL = `https://ws.bctransferguide.ca/api/custom/ui/v1.7/agreementws/GetSubjects?institutionID=${institutionID}&sending=true`;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
    try {
        const response = await axios.get(getSubjectsURL, { headers });

        response.data.forEach((subject: BCTransferSubject) => {
            console.log(
                subject.Id + ", "+ subject.Code  + ", "+  subject.Title
            );
        });

    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }

}

