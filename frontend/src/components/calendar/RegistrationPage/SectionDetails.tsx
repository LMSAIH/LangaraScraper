import type { Section } from '../../../Types/Registration';
import { getCourseStatus, getStripeColor, formatDays, formatTime } from '../../../Utils/RegistrationUtils';

interface SectionDetailsProps {
  section: Section;
  isAdded: boolean;
  onToggleSection: (section: Section) => void;
}

const SectionDetails = ({ section, isAdded, onToggleSection }: SectionDetailsProps) => {
  const status = getCourseStatus(section);
  const stripeColor = getStripeColor(status);
  const isCancelled = status === 'cancelled';

  return (
    <div className='mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden'>
      {/* Status Stripe for Selected Course */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${stripeColor}`}></div>

      <div className='pt-2'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='font-semibold text-lg'>{section.courseCode}</h3>
          <div className='flex items-center gap-2'>
            {status === 'cancelled' && (
              <span className="text-red-600 text-sm font-medium">CANCELLED</span>
            )}
            {status === 'online-tba' && (
              <span className="text-yellow-600 text-sm font-medium">ONLINE/TBA</span>
            )}
          </div>
        </div>
        <p className='text-sm text-gray-600 mb-2'>{section.title}</p>
        <div className='text-sm space-y-1'>
          <div><strong>Credits:</strong> {section.credits}</div>
          <div><strong>Section:</strong> {section.section}</div>
          <div><strong>CRN:</strong> {section.crn}</div>
          <div><strong>Seats Available:</strong>
            <span className={`ml-1 ${parseInt(section.seatsAvailable) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {section.seatsAvailable}
            </span>
          </div>
          {section.waitlist && (
            <div><strong>Waitlist:</strong>
              <span className={`ml-1 ${section.waitlist === 'Cancelled' ? 'text-red-600' : 'text-orange-600'}`}>
                {section.waitlist}
              </span>
            </div>
          )}
          {section.additionalFees && (
            <div><strong>Additional Fees:</strong> {section.additionalFees}</div>
            )}
          {section.notes && (
            <div><strong>Notes:</strong> <span className='text-xs'>{section.notes}</span></div>
            
          )}
        </div>

        <div className='mt-3'>
          <strong className='text-sm'>Meeting Times:</strong>
          {section.meetingTimes.map((meeting, idx) => (
            <div key={idx} className='text-sm mt-1 pl-2 border-l-2 border-blue-200'>
              <div><strong>Type:</strong> {meeting.sectionType}</div>
              <div><strong>Days:</strong> {formatDays(meeting.days) || 'Online'}</div>
              <div><strong>Time:</strong> {formatTime(meeting.time)}</div>
              <div><strong>Room:</strong> {meeting.room}</div>
              <div><strong>Instructor:</strong> {meeting.instructor}</div>
            
            </div>
          ))}
        </div>

        {/* Toggle button for added/not added sections */}
        {!isCancelled && (
          <button
            onClick={() => onToggleSection(section)}
            className={`mt-3 w-full px-4 py-2 rounded-md text-sm transition-colors ${
              isAdded
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isAdded ? 'Remove from Schedule' : 'Add to Schedule'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionDetails;