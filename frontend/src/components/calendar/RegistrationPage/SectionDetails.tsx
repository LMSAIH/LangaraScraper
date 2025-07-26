import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Section } from '../../../Types/Registration';
import { formatDays, formatTime } from '../../../Utils/RegistrationUtils';

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
    console.log('Section meeting times:', section.meetingTimes);

    const allProfessors = section.meetingTimes
      .map(meeting => {
        console.log('Meeting instructor:', meeting.instructor);
        return meeting.instructor;
      })
      .filter(instructor => instructor && !instructor.includes('TBA') && instructor.trim() !== '')
      .flatMap(instructor => instructor.split(','))
      .map(name => name.trim())
      .filter(name => name && !name.includes('TBA') && name.length > 0);

    console.log('All professors before deduplication:', allProfessors);

    // Remove duplicates
    const uniqueProfessors = [...new Set(allProfessors)];
    console.log('Unique professors:', uniqueProfessors);

    return uniqueProfessors;
  };

  // Fetch professor information
  useEffect(() => {
    const fetchProfessorsInfo = async () => {
      const professorNames = extractProfessorNames(section);
      console.log('Extracted professor names:', professorNames);

      if (professorNames.length === 0) {
        console.log('No professor names found, skipping fetch');
        return;
      }

      setLoadingProfessors(true);
      try {
        const professorPromises = professorNames.map(async (name) => {
          try {
            console.log(`Fetching professor info for: "${name}"`);
            console.log(`Original name: "${name}"`);
            console.log(`Encoded name: "${encodeURIComponent(name)}"`);
         
            const url = `http://localhost:3000/professors`;
            console.log(`Full URL: ${url}`);
            
            const response = await axios.get(url, {
              params: { name: name }
            });

            console.log(`Response for ${name}:`, response);
            if (response.data.success && response.data.professors.length > 0) {
              return { name, info: response.data.professors[0] };
            }
            return null;
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

        console.log('Final professors map:', professorsMap);
        setProfessorsInfo(professorsMap);
      } catch (error) {
        console.error('Error fetching professors info:', error);
      } finally {
        setLoadingProfessors(false);
      }
    };

    fetchProfessorsInfo();
  }, [section]);

  // Render professor info
  const renderProfessorInfo = (instructorName: string) => {
    if (!instructorName || instructorName.includes('TBA')) {
      return <span className="text-gray-500">TBA</span>;
    }

    const professorNames = instructorName.split(',').map(name => name.trim());

    return (
      <div className="space-y-1">
        {professorNames.map((name, idx) => {
          const professorInfo = professorsInfo[name];

          if (professorInfo) {
            return (
              <div key={idx} className="text-xs bg-blue-50 dark:bg-blue-900/20 rounded p-2 border border-blue-200 dark:border-blue-700">
                <div className="font-medium text-blue-800 dark:text-blue-300">{name}</div>
                <div className="text-blue-600 dark:text-blue-400 space-y-0.5">
                  <div>⭐ {professorInfo.avg_rating.toFixed(1)}/5 ({professorInfo.num_ratings} reviews)</div>
                  <div>📊 Difficulty: {professorInfo.avg_difficulty.toFixed(1)}/5</div>
                  <div>🔄 Would take again: {professorInfo.would_take_again_percent}%</div>
                  <div className="text-xs text-blue-500 dark:text-blue-400">{professorInfo.department}</div>
                </div>
              </div>
            );
          } else if (loadingProfessors) {
            return (
              <div key={idx} className="text-xs text-gray-500">
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
    <div className='text-sm space-y-3'>
      {/* Course Information Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
            <div className='text-gray-600 dark:text-gray-400'>
              <span className='font-medium'>Seats Available:</span>
              <span className={`ml-1 ${parseInt(section.seatsAvailable) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {section.seatsAvailable}
              </span>
            </div>
            {section.waitlist && (
              <div className='text-gray-600 dark:text-gray-400'>
                <span className='font-medium'>Waitlist:</span>
                <span className={`ml-1 ${section.waitlist === 'Cancelled' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {section.waitlist}
                </span>
              </div>
            )}
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

        <div className='space-y-2'>
          <div className='font-semibold text-gray-900 dark:text-white'>Meeting Times & Instructors</div>
          {section.meetingTimes.map((meeting, idx) => (
            <div key={idx} className=' border-gray-200 dark:border-zinc-700'>
              <div className='space-y-1'>
                <div className='text-gray-600 dark:text-gray-400'>
                  <span className='font-medium'>Type:</span> {meeting.sectionType}
                </div>
                <div className='text-gray-600 dark:text-gray-400'>
                  <span className='font-medium'>Days:</span> {formatDays(meeting.days) || 'Online'}
                </div>
                <div className='text-gray-600 dark:text-gray-400'>
                  <span className='font-medium'>Time:</span> {formatTime(meeting.time)}
                </div>
                <div className='text-gray-600 dark:text-gray-400'>
                  <span className='font-medium'>Room:</span> {meeting.room}
                </div>
                <div className="space-y-1">
                  <div className='text-gray-600 dark:text-gray-400'>
                    <span className='font-medium'>Instructor:</span>
                  </div>
                  <div >
                    {renderProfessorInfo(meeting.instructor)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionDetails;