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
  // Add new props for schedule management
  addedSections?: any[];
  currentTerm?: string;
  onOpenSaveModal?: () => void;
  onExportICS?: () => void;
}

const Filters = ({
  subjects,
  terms,
  instructorFilter,
  subjectFilter,
  courseCodeFilter,
  setInstructorFilter,
  setSubjectFilter,
  setCourseCodeFilter,
  onSearch,
  onClearFilters,
  setTerm,
  addedSections = [],
  onOpenSaveModal,
  onExportICS,
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
    <div className='p-6 space-y-6'>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Search Filters</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Find the perfect courses for your schedule</p>
        </div>
        
        {/* Save & Export Buttons - Top Right */}
        <div className="flex gap-2">
          {onOpenSaveModal && (
            <button
              onClick={onOpenSaveModal}            
              className='px-3 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white rounded-xl font-semibold text-sm transition-all duration-200 transform hover:cursor-pointer shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none'
              title={`Save Schedule (${addedSections.length} courses)`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
          )}
          
          {onExportICS && (
            <button
              onClick={onExportICS}
              disabled={addedSections.length === 0}
              className='px-3 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white rounded-xl font-semibold text-sm transition-all duration-200 transform hover:cursor-pointer shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none'
              title={`Export to Calendar (${addedSections.length} courses)`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Term and Subject Filters on Same Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Term Filter */}
        <div className="space-y-2">
          <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>Term</label>
          <div className="relative">
            <select
              onChange={(e) => setTerm(e.target.value)}
              className='w-full px-4 py-3 pr-10 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:border-gray-300 dark:hover:border-zinc-500 appearance-none cursor-pointer shadow-sm hover:shadow-md'
            >
              {terms.sort((a, b) => (a < b ? 1 : -1)).map((term) => (
                <option key={term} value={term}>
                  {formatTermDisplay(term)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Subject Filter */}
        <div className="space-y-2">
          <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>Subject</label>
          <div className="relative">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className='w-full px-4 py-3 pr-10 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:border-gray-300 dark:hover:border-zinc-500 appearance-none cursor-pointer shadow-sm hover:shadow-md'
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter with Toggle */}
      <div className="space-y-4">
        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300'>Search Type</label>

        {/* Toggle Buttons */}
        <div className='flex bg-gray-100 dark:bg-zinc-700 rounded-xl p-1 transition-colors duration-200'>
          <button
            onClick={() => setSearchType('course')}
            className={`flex-1 px-4 py-2 text-sm hover:cursor-pointer font-medium rounded-lg transition-all duration-200 ${
              searchType === 'course'
                ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Course Code
          </button>
          <button
            onClick={() => setSearchType('instructor')}
            className={`flex-1 px-4 py-2 text-sm hover:cursor-pointer font-medium rounded-lg transition-all duration-200 ${
              searchType === 'instructor'
                ? 'bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm transform scale-105'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Instructor
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={getCurrentSearchValue()}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder={
              searchType === 'course'
                ? "Enter course code (e.g., CPSC 1050)"
                : "Enter instructor name"
            }
            className='w-full px-4 py-3 pl-10 bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-zinc-600 hover:border-gray-300 dark:hover:border-zinc-500 shadow-sm hover:shadow-md'
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons - Remove the save button from here */}
      <div className='flex gap-3'>
        <button
          onClick={onSearch}
          className='flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 transform shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:cursor-pointer dark:focus:ring-offset-zinc-800'
        >
          Search Courses
        </button>
        
        <button
          onClick={onClearFilters}
          className='px-6 py-3 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-all duration-200 transform hover:cursor-pointer shadow-sm hover:shadow-md border border-gray-200 dark:border-zinc-600'
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Filters;