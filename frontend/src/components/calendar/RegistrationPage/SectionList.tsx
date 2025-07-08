import type { Section } from '../../../Types/Registration';
import SectionComponent from './Section';

interface SectionListProps {
  sections: Section[];
  selectedSection: Section | null;
  addedSections: Section[];
  loading: boolean;
  error: string | null;
  onSectionClick: (section: Section) => void;
  onSectionHover: (section: Section) => void;
  onSectionLeave: () => void;
}

const SectionList = ({
  sections,
  selectedSection,
  addedSections,
  loading,
  error,
  onSectionClick,
  onSectionHover,
  onSectionLeave
}: SectionListProps) => {
  return (
    <div className='max-h-96 overflow-y-auto'>
      {loading && (
        <div className='p-8 text-center'>
          <div className="inline-flex items-center justify-center w-8 h-8">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className='mt-3 text-gray-600 dark:text-gray-400 font-medium'>Loading courses...</p>
        </div>
      )}

      {error && (
        <div className='p-8 text-center'>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mb-3">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className='text-red-600 dark:text-red-400 font-medium'>{error}</p>
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className='p-8 text-center'>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-zinc-700 rounded-full mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className='text-gray-500 dark:text-gray-400 font-medium'>No courses found</p>
          <p className='text-sm text-gray-400 dark:text-gray-500 mt-1'>Try adjusting your search filters</p>
        </div>
      )}

      {!loading && !error && sections.map((section, index) => (
        <div
          key={section._id}
          className={`transition-all duration-200 ${
            index !== sections.length - 1 ? 'border-b border-gray-200 dark:border-zinc-700' : ''
          }`}
        >
          <SectionComponent
            section={section}
            isSelected={selectedSection?._id === section._id}
            isAdded={addedSections.some(s => s.crn === section.crn)}
            onClick={onSectionClick}
            onMouseEnter={onSectionHover}
            onMouseLeave={onSectionLeave}
          />
        </div>
      ))}
    </div>
  );
};

export default SectionList;