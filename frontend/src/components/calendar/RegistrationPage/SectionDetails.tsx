import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Section } from '../../../Types/Registration';

interface SectionDetailsProps {
  section: Section;
  isAdded: boolean;
  onToggleSection: (section: Section) => void;
}

interface ProfessorInfo {
  name: string;
  department: string;
  avg_rating: number;
  avg_difficulty: number;
  num_ratings: number;
  would_take_again_percent: number;
}

const SectionDetails = ({ section }: SectionDetailsProps) => {

  const [professorsInfo, setProfessorsInfo] = useState<Record<string, ProfessorInfo>>({});
  const [loadingProfessors, setLoadingProfessors] = useState(false);

  // Extract unique professor names from all meeting times
  const extractProfessorNames = (section: Section): string[] => {
    const allProfessors = section.meetingTimes
      .map(meeting => meeting.instructor)
      .filter(instructor => instructor && !instructor.includes('TBA') && instructor.trim() !== '')
      .flatMap(instructor => instructor.split(','))
      .map(name => name.trim())
      .filter(name => name && !name.includes('TBA') && name.length > 0);

    // Remove duplicates
    const uniqueProfessors = [...new Set(allProfessors)];
    return uniqueProfessors;
  };

  // Fetch professor information
  useEffect(() => {
    const fetchProfessorsInfo = async () => {
      const professorNames = extractProfessorNames(section);

      if (professorNames.length === 0) {
        return;
      }

      setLoadingProfessors(true);
      try {
        const professorPromises = professorNames.map(async (name) => {
          try {
            const url = `http://localhost:3000/professors`;

            //DNT THIS, IT WILL BREAK DOWN OTHERWISE
            const cleanName = name.trim().replace(/\s+/g, ' '); 

            const response = await axios.get(url, {
              params: { name: cleanName }
            });

            return { name, info: response.data.professors[0] };

          } catch (error) {
            console.warn(`Failed to fetch info for professor: ${name}`, error);
            return null;
          }
        });

        const results = await Promise.all(professorPromises);
        const professorsMap: Record<string, ProfessorInfo> = {};

        results.forEach(result => {
          if (result) {
            professorsMap[result.name] = result.info;
          }
        });

        setProfessorsInfo(professorsMap);
      } catch (error) {
        console.error('Error fetching professors info:', error);
      } finally {
        setLoadingProfessors(false);
      }
    };

    fetchProfessorsInfo();
  }, [section]);

  const renderAllProfessors = () => {
    const professorNames = extractProfessorNames(section);

    if (professorNames.length === 0) {
      return <span className="text-gray-500">TBA</span>;
    }

    return (
      <div className="space-y-2">
        {professorNames.map((name, idx) => {
          const professorInfo = professorsInfo[name];

          if (professorInfo) {
            return (
              <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                <div className="font-medium text-gray-700 dark:text-gray-300">{name}</div>
                <div className="space-y-0.5 mt-1 text-xs">
                  <div>Rating: {professorInfo.avg_rating.toFixed(1)}/5 ({professorInfo.num_ratings} reviews)</div>
                  <div>Difficulty: {professorInfo.avg_difficulty.toFixed(1)}/5</div>
                  <div>Would take again: {professorInfo.would_take_again_percent}%</div>
                  <div className="text-gray-500 dark:text-gray-500">{professorInfo.department}</div>
                </div>
              </div>
            );
          } else if (loadingProfessors) {
            return (
              <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                {name} <span className="animate-pulse">(loading...)</span>
              </div>
            );
          } else {
            return (
              <div key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                {name} <span className="text-gray-400">(no ratings found)</span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className='text-sm space-y-4'>
      {/* Course Information Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Course Details */}
        <div className='space-y-2'>
          <div className='font-semibold text-gray-900 dark:text-white'>Course Details</div>
          <div className='space-y-1'>
            <div className='text-gray-600 dark:text-gray-400'>
              <span className='font-medium'>Credits:</span> {section.credits}
            </div>
            <div className='text-gray-600 dark:text-gray-400'>
              <span className='font-medium'>Section:</span> {section.section}
            </div>
            <div className='text-gray-600 dark:text-gray-400'>
              <span className='font-medium'>CRN:</span> {section.crn}
            </div>
            {section.additionalFees && (
              <div className='text-gray-600 dark:text-gray-400'>
                <span className='font-medium'>Additional Fees:</span> {section.additionalFees}
              </div>
            )}
            {section.notes && (
              <div className='text-gray-600 dark:text-gray-400'>
                <span className='font-medium'>Notes:</span> <span className='text-xs'>{section.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Instructors Information */}
        <div className='space-y-2'>
          <div className='font-semibold text-gray-900 dark:text-white'>Instructors</div>
          <div>
            {renderAllProfessors()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionDetails;