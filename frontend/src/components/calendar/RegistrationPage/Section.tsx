import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Section } from '../../../Types/Registration'
import { getCourseStatus, getStripeColor, formatDays, formatTime } from '../../../Utils/RegistrationUtils';
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";

interface SectionComponentProps {
  section: Section;
  isSelected: boolean;
  isAdded: boolean;
  onClick: (section: Section) => void;
  onMouseEnter: (section: Section) => void;
  onMouseLeave: () => void;
}

const SectionComponent = ({
  section,
  isSelected,
  isAdded,
  onClick,
  onMouseEnter,
  onMouseLeave
}: SectionComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getCourseStatus(section);
  const stripeColor = getStripeColor(status);
  const isCancelled = status === 'cancelled';

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 group ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      } ${
        isAdded ? 'bg-green-50 dark:bg-green-900/20' : ''
      } ${
        isCancelled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-zinc-700/50'
      }`}
      onClick={() => !isCancelled && onClick(section)}
      onMouseEnter={() => onMouseEnter(section)}
      onMouseLeave={onMouseLeave}
    >
      {/* Status Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${stripeColor} transition-all duration-200`}></div>

      <div className='p-4 pt-5'>
        <div className='flex items-start justify-between mb-2'>
          <div className="flex-1">
            <div className='font-bold text-gray-900 dark:text-white text-base mb-1'>
              <Link 
                to={`/courses/${section.courseCode}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {section.courseCode}
              </Link>
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-400 font-medium mb-1'>
              {section.title}
            </div>
            <div className='text-xs text-gray-500 dark:text-gray-500'>
              Section {section.section} • CRN: {section.crn}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status === 'cancelled' && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium rounded-full">
                CANCELLED
              </span>
            )}
            {status === 'online-tba' && (
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                ONLINE/TBA
              </span>
            )}
            {isAdded && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                ADDED
              </span>
            )}
            <button
              onClick={handleToggleExpand}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-600"
            >
              {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
            </button>
          </div>
        </div>

        <div className='mb-3'>
          <div className='flex items-center gap-4 text-sm'>
            <span className={`font-medium ${parseInt(section.seatsAvailable) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {section.seatsAvailable} seats available
            </span>
            {section.waitlist && section.waitlist !== '' && (
              <span className={`${section.waitlist === 'Cancelled' ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                Waitlist: {section.waitlist}
              </span>
            )}
          </div>
        </div>

        {section.meetingTimes.map((meeting, idx) => (
          <div key={idx} className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1'>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{formatDays(meeting.days)}</span>
            <span>{formatTime(meeting.time)}</span>
            <span className="text-gray-500 dark:text-gray-400">•</span>
            <span>{meeting.instructor}</span>
          </div>
        ))}

        {/* Extended Information - Dropdown */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700 transition-all duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 dark:text-white">Course Details</div>
                <div className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Credits:</span> {section.credits}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 dark:text-white">Additional Info</div>
                {section.additionalFees && section.additionalFees !== '' && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Fees:</span> {section.additionalFees}
                  </div>
                )}
                {section.repeatLimit && section.repeatLimit !== '' && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Repeat Limit:</span> {section.repeatLimit}
                  </div>
                )}
                {section.notes && section.notes !== '' && (
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Notes:</span> {section.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionComponent;