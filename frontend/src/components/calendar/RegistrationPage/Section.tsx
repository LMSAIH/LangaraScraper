import type { Section } from '../../../Types/Registration'
import { getCourseStatus, getStripeColor, formatDays, formatTime } from '../../../Utils/RegistrationUtils';

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
  const status = getCourseStatus(section);
  const stripeColor = getStripeColor(status);
  const isCancelled = status === 'cancelled';

  return (
    <div
      className={`relative border-b cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      } ${
        isAdded ? 'bg-green-50 border-green-200' : ''
      } ${
        isCancelled ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      onClick={() => !isCancelled && onClick(section)}
      onMouseEnter={() => onMouseEnter(section)}
      onMouseLeave={onMouseLeave}
    >
      {/* Status Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${stripeColor}`}></div>

      <div className='p-3 pt-4'>
        <div className='font-semibold text-sm flex items-center justify-between'>
          <span>{section.courseCode}</span>
          <div className='flex items-center gap-2'>
            {status === 'cancelled' && (
              <span className="text-red-600 text-xs">CANCELLED</span>
            )}
            {status === 'online-tba' && (
              <span className="text-yellow-600 text-xs">ONLINE/TBA</span>
            )}
          </div>
        </div>
        <div className='text-xs text-gray-600'>{section.title}</div>
        <div className='text-xs text-gray-500'>
          Section {section.section} • CRN: {section.crn}
        </div>
        <div className='text-xs'>
          <span className={`${parseInt(section.seatsAvailable) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {section.seatsAvailable} seats available
          </span>
          {section.waitlist && section.waitlist !== '' && (
            <span className={`ml-2 ${section.waitlist === 'Cancelled' ? 'text-red-600' : 'text-orange-600'}`}>
              • Waitlist: {section.waitlist}
            </span>
          )}
        </div>
        {section.meetingTimes.map((meeting, idx) => (
          <div key={idx} className='text-xs text-gray-500 mt-1'>
            {formatDays(meeting.days)} {formatTime(meeting.time)} • {meeting.instructor}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionComponent;