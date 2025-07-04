export interface MeetingTime {
  _id: string;
  sectionCRN: string;
  sectionType: string;
  days: string;
  time: string;
  room: string;
  instructor: string;
  term: string;
  year: number;
  semester: number;
}

export interface Section {
  _id: string;
  courseCode: string;
  crn: string;
  subject: string;
  course: string;
  section: string;
  credits: string;
  title: string;
  seatsAvailable: string;
  waitlist: string;
  additionalFees: string;
  repeatLimit: string;
  notes?: string;
  term: string;
  year: number;
  semester: number;
  meetingTimes: MeetingTime[];
}

export interface ApiResponse {
  success: boolean;
  sections: Section[];
  count: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    year?: number;
    semester?: number;
    subject?: string;
    instructor?: string;
    available?: boolean;
    courseCode?: string;
  };
  timestamp: string;
}

export interface SubjectsResponse {
  success: boolean;
  subjects: string[];
  count: number;
  timestamp: string;
}