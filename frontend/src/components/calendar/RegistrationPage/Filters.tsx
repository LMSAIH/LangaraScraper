import { useState } from 'react';

interface FiltersProps {
  subjects: string[];
  terms: string[];
  instructorFilter: string;
  subjectFilter: string;
  courseCodeFilter: string;
  setInstructorFilter: (filter: string) => void;
  setSubjectFilter: (filter: string) => void;
  setCourseCodeFilter: (filter: string) => void;
  setTerm: (term: string) => void;
  setError: (error: string | null) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

const Filters = ({
  subjects,
  instructorFilter,
  subjectFilter,
  courseCodeFilter,
  setInstructorFilter,
  setSubjectFilter,
  setCourseCodeFilter,
  onSearch,
  onClearFilters,
  setTerm,
  terms
}: FiltersProps) => {

  const [searchType, setSearchType] = useState<'course' | 'instructor'>('course');

  // Function to format term display
  const formatTermDisplay = (term: string): string => {
    if (term.length === 6) {
      const year = term.substring(0, 4);
      const semester = term.substring(4, 6);
      
      let semesterName = '';
      switch (semester) {
        case '10':
          semesterName = 'Spring';
          break;
        case '20':
          semesterName = 'Summer';
          break;
        case '30':
          semesterName = 'Fall';
          break;
        default:
          semesterName = 'Unknown';
      }
      
      return `${semesterName} ${year}`;
    }
    return term; // Fallback to original term if format is unexpected
  };

  const handleSearchInputChange = (value: string) => {
    if (searchType === 'course') {
      setCourseCodeFilter(value);
      setInstructorFilter(''); // Clear the other filter
    } else {
      setInstructorFilter(value);
      setCourseCodeFilter(''); // Clear the other filter
    }
  };

  const getCurrentSearchValue = () => {
    return searchType === 'course' ? courseCodeFilter : instructorFilter;
  };

  return (
    <div className='mb-6 space-y-4'>

      {/* Term and Subject Filters on Same Row */}
      <div className='grid grid-cols-2 gap-4'>
        {/* Term Filter */}
        <div>
          <label className='block text-sm font-medium mb-2'>Select Term:</label>
          <select
            onChange={(e) => setTerm(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
          >
            {terms.sort((a, b) => (a < b ? 1 : -1)).map((term) => (
              <option key={term} value={term}>
                {formatTermDisplay(term)}
              </option>
            ))}
          </select>
        </div>

        {/* Subject Filter */}
        <div>
          <label className='block text-sm font-medium mb-2'>Filter by Subject:</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Filter with Toggle */}
      <div>
        <label className='block text-sm font-medium mb-2'>Search by:</label>

        {/* Toggle Buttons */}
        <div className='flex mb-2 border border-gray-300 rounded-md overflow-hidden'>
          <button
            onClick={() => setSearchType('course')}
            className={`flex-1 px-3 py-2 text-sm ${
              searchType === 'course'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Course Code
          </button>
          <button
            onClick={() => setSearchType('instructor')}
            className={`flex-1 px-3 py-2 text-sm ${
              searchType === 'instructor'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Instructor
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={getCurrentSearchValue()}
          onChange={(e) => handleSearchInputChange(e.target.value)}
          placeholder={
            searchType === 'course'
              ? "Enter course code (e.g., CPSC 1050)"
              : "Enter instructor name"
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>

      {/* Filter Buttons */}
      <div className='flex gap-2'>
        <button
          onClick={onSearch}
          className='flex-1 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600'
        >
          Search
        </button>
        <button
          onClick={onClearFilters}
          className='flex-1 px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600'
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Filters;