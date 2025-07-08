export interface BCTransferSingleAgreement{
  type: 'single';
  SendingCourseNumber: number;
  SendingInstitutionCode: string;
  SendingSubject: string;
  SendingCredits: number;
  ReceivingCourseNumber: string;
  RecevingInstitutionCode: string;
  ReceivingSubject: string;
  ReceivingCredits: number;
  StartDate: number;
  EndDate?: number;
  details?: string;
}

export interface BCTransferBundleAgreement{
  type: 'bundle';
  SendingCourseNumber: string[];
  SendingInstitutionCode: string;
  SendingSubject: string[];
  SendingCredits: number[];
  ReceivingCourseNumber: string[];
  RecevingInstitutionCode: string;
  ReceivingSubject: string[];
  ReceivingCredits: number[];
  StartDate: number;
  EndDate?: number;
  details?: string;
}

export type BCTransferAgreement = 
BCTransferSingleAgreement |
BCTransferBundleAgreement;

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

export interface CourseInfo {
  courseCode: string;
  title?: string;
  description?: string;
  attributes: string[];
}