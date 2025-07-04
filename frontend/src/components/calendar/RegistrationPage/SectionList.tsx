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
    <div className='max-h-96 overflow-y-auto border border-gray-200 rounded-lg'>
      {loading && (
        <div className='p-4 text-center'>Loading courses...</div>
      )}

      {error && (
        <div className='p-4 text-red-600 text-center'>{error}</div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className='p-4 text-center text-gray-500'>No courses found</div>
      )}

      {!loading && !error && sections.map((section) => (
        <SectionComponent
          key={section._id}
          section={section}
          isSelected={selectedSection?._id === section._id}
          isAdded={addedSections.some(s => s.crn === section.crn)}
          onClick={onSectionClick}
          onMouseEnter={onSectionHover}
          onMouseLeave={onSectionLeave}
        />
      ))}
    </div>
  );
};

export default SectionList;