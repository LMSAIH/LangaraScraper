export interface BCTransferSubject {
  Id: number;
  Code: string;
  Title: string;
}

export interface BCInstitution {
  Code: string,
  Id: number
}

export interface MeetingTime {
  SectionType: string;
  Days: string;
  Time: string;
  Room: string;
  Instructor: string;
}

export interface CourseSection {
  crn: string;
  subject: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  data: MeetingTime[]; 
  seatsAvailable: string;
  waitlist: string;
  additionalFees: string;
  repeatLimit: string;
  notes?: string;
}

export interface CourseData {
  courseCode: string;
  subject: string;
  sections: CourseSection[];
}
