import type { Section } from '../Types/Registration';

// Helper function to determine course status
export const getCourseStatus = (section: Section): 'cancelled' | 'online-tba' | 'normal' => {
  const hasOnlineMeetings = section.meetingTimes.some(
    meeting => meeting.sectionType === 'WWW' ||
      meeting.room === 'WWW' ||
      meeting.days === '-------' ||
      meeting.time === '-'
  );

  const hasTBAInstructor = section.meetingTimes.some(
    meeting => meeting.instructor.includes('TBA') || meeting.instructor.includes('. TBA')
  );

  const isCancelled = section.seatsAvailable === 'Cancel' || section.notes === '**Cancelled**';

  if (isCancelled) return 'cancelled';
  if (hasOnlineMeetings || hasTBAInstructor) return 'online-tba';
  return 'normal';
};

// Get stripe color based on status
export const getStripeColor = (status: string): string => {
  switch (status) {
    case 'cancelled': return 'bg-red-500';
    case 'online-tba': return 'bg-yellow-500';
    case 'normal': return 'bg-green-500';
    default: return 'bg-green-500';
  }
};

// Format days from API format to readable format
export const formatDays = (days: string): string => {
  const dayMap = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];
  return days.split('').map((char, index) =>
    char === '-' ? '' : dayMap[index]
  ).filter(Boolean).join('');
};

// Format time from API format to readable format
export const formatTime = (time: string): string => {
  if (time === '-') return 'Online/TBA';
  if (time.length === 8) {
    const start = `${time.slice(0, 2)}:${time.slice(2, 4)}`;
    const end = `${time.slice(4, 6)}:${time.slice(6, 8)}`;
    return `${start} - ${end}`;
  }
  return time;
};

// Handler functions for section management
export const createSectionHandlers = (
  setSections: React.Dispatch<React.SetStateAction<Section[]>>,
  setSelectedSection: React.Dispatch<React.SetStateAction<Section | null>>,
  setHoveredSection: React.Dispatch<React.SetStateAction<Section | null>>,
  setAddedSections: React.Dispatch<React.SetStateAction<Section[]>>,
  addedSections: Section[]
) => {
  const handleAddSection = (section: Section) => {
    if (!addedSections.find(s => s.crn === section.crn)) {
      setAddedSections(prev => [...prev, section]);
    }
  };

  const handleRemoveSection = (crn: string) => {
    setAddedSections(prev => prev.filter(s => s.crn !== crn));
  };

  const handleSectionHover = (section: Section) => {
    setHoveredSection(section);
  };

  const handleSectionLeave = () => {
    setHoveredSection(null);
  };

  return {
    handleAddSection,
    handleRemoveSection,
    handleSectionHover,
    handleSectionLeave
  };
};

// Handler functions for search and pagination
export const createSearchHandlers = (
  instructorFilter: string,
  subjectFilter: string,
  courseCodeFilter: string,
  yearFilter: number,
  semesterFilter: number,
  setInstructorFilter: React.Dispatch<React.SetStateAction<string>>,
  setSubjectFilter: React.Dispatch<React.SetStateAction<string>>,
  setCourseCodeFilter: React.Dispatch<React.SetStateAction<string>>,
  setPagination: React.Dispatch<React.SetStateAction<any>>,
  getSections: (instructor?: string, subject?: string, courseCode?: string, year?: number, semester?: number, page?: number) => Promise<void>
) => {

  const handleSearch = () => {
    setPagination((prev: any) => ({ ...prev, page: 1 }));
    getSections(instructorFilter, subjectFilter, courseCodeFilter, yearFilter, semesterFilter, 1);
  };

  const handleClearFilters = () => {
    setInstructorFilter('');
    setSubjectFilter('');
    setCourseCodeFilter('');
    setPagination((prev: any) => ({ ...prev, page: 1 }));
    getSections('', '', '', yearFilter, semesterFilter, 1);
  };

  const handlePageChange = (newPage: number) => {
    getSections(instructorFilter, subjectFilter, courseCodeFilter, yearFilter, semesterFilter, newPage);
  };

  return {
    handleSearch,
    handleClearFilters,
    handlePageChange
  };
};
