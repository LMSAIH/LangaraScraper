
interface FiltersProps {
  subjects: string[];
  instructorFilter: string;
  subjectFilter: string;
  courseCodeFilter: string;
  setInstructorFilter: (filter: string) => void;
  setSubjectFilter: (filter: string) => void;
  setCourseCodeFilter: (filter: string) => void;
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
  onClearFilters
}: FiltersProps) => {
  return (
    <div className='mb-6 space-y-4'>
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

      {/* Course Code Filter */}
      <div>
        <label className='block text-sm font-medium mb-2'>Filter by Course Code:</label>
        <input
          type="text"
          value={courseCodeFilter}
          onChange={(e) => setCourseCodeFilter(e.target.value)}
          placeholder="Enter course code (e.g., CPSC 1050)"
          className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm'
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>

      {/* Instructor Filter */}
      <div>
        <label className='block text-sm font-medium mb-2'>Filter by Instructor:</label>
        <input
          type="text"
          value={instructorFilter}
          onChange={(e) => setInstructorFilter(e.target.value)}
          placeholder="Enter instructor name"
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