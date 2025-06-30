export interface BCTransferSubject {
  Id: number;
  Code: string;
  Title: string;
}

export interface CourseSection {
  crn: string;
  subject: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  type: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
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
