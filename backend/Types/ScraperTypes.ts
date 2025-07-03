export interface BCTransferSubject {
  Id: number;
  Code: string;
  Title: string;
  CourseList: BCTransferCourse[]
}

export interface BCInstitution {
  Code: string,
  Id: number
  SubjectList: BCTransferSubject[]
}
export interface BCTransferAgreement{
  BCTransferCourseID: number,
  RecevingInstituion: BCInstitution,
  ReceivingSubject: BCTransferSubject,
  ReceivingCredits: number,
  SendingCredits: number,
  StartDate: number,
  EndDate: number
}

export interface BCTransferCourse{
  Id: number,
  Title: string,
  Credits: number,
  Subject: BCTransferSubject,
  ParentInstitution: BCInstitution
  Agreements: BCTransferAgreement[]
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
