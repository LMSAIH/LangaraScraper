import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput } from '@fullcalendar/core'
import { useMemo, useCallback } from 'react'

interface MeetingTime {
    _id: string;
    sectionCRN: string;
    sectionType: string;
    days: string;
    time: string;
    room: string;
    instructor: string;
    term: string;
    year: number;
    semester: number;
}

interface Section {
    _id: string;
    courseCode: string;
    crn: string;
    subject: string;
    course: string;
    section: string;
    credits: string;
    title: string;
    seatsAvailable: string;
    waitlist: string;
    additionalFees: string;
    repeatLimit: string;
    notes?: string;
    term: string;
    year: number;
    semester: number;
    meetingTimes: MeetingTime[];
}

interface CalendarProps {
    selectedSection: Section | null;
    hoveredSection: Section | null;
    onAddSection: (section: Section) => void;
    addedSections: Section[];
    onRemoveSection: (crn: string) => void;
}

export default function Calendar({
    selectedSection,
    hoveredSection,
    onAddSection,
    addedSections,
    onRemoveSection
}: CalendarProps) {

    // Generate colors based on subject
    const getColorForCourse = useCallback((subject: string): string => {
        const colors = [
            '#3788d8', '#8e44ad', '#e74c3c', '#f39c12',
            '#27ae60', '#16a085', '#2c3e50', '#e67e22',
            '#9b59b6', '#34495e', '#1abc9c', '#f1c40f'
        ];

        let hash = 0;
        for (let i = 0; i < subject.length; i++) {
            hash = subject.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }, []);

    // Convert section to events
    const convertSectionToEvents = useCallback((section: Section, isGhost = false): EventInput[] => {
        const events: EventInput[] = [];

        section.meetingTimes.forEach((meeting) => {
            // Skip online/TBA courses
            if (meeting.days === '-------' || meeting.time === '-') return;

            // Parse days (MTWRFSU format)
            const dayMap: { [key: string]: number } = {
                'M': 1, 'T': 2, 'W': 3, 'R': 4, 'F': 5, 'S': 6, 'U': 0
            };

            const activeDays: number[] = [];
            const dayChars = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];

            meeting.days.split('').forEach((char, index) => {
                if (char !== '-') {
                    activeDays.push(dayMap[dayChars[index]]);
                }
            });

            // Parse time (format: HHMM-HHMM)
            if (meeting.time.length === 9 && meeting.time.includes('-')) {
                const [startTime, endTime] = meeting.time.split('-');
                const startHour = parseInt(startTime.slice(0, 2));
                const startMin = parseInt(startTime.slice(2, 4));
                const endHour = parseInt(endTime.slice(0, 2));
                const endMin = parseInt(endTime.slice(2, 4));

                const color = getColorForCourse(section.subject);

                // Create recurring events for each day of the week
                activeDays.forEach((dayOfWeek) => {
                    events.push({
                        id: `${section.crn}-${meeting._id}-${dayOfWeek}${isGhost ? '-ghost' : ''}`,
                        title: `${section.courseCode} - ${meeting.sectionType}`,
                        daysOfWeek: [dayOfWeek],
                        startTime: `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`,
                        endTime: `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`,
                        extendedProps: {
                            courseCode: section.courseCode,
                            section: section.section,
                            instructor: meeting.instructor,
                            room: meeting.room,
                            sectionType: meeting.sectionType,
                            crn: section.crn,
                            sectionData: section,
                            isGhost
                        },
                        backgroundColor: isGhost ? 'transparent' : color,
                        borderColor: color,
                        textColor: isGhost ? color : '#ffffff',
                        classNames: isGhost ? ['ghost-event'] : [],
                        display: isGhost ? 'background' : 'block'
                    });
                });
            }
        });

        return events;
    }, [getColorForCourse]);

    // All events (added sections + ghost events)
    const events: EventInput[] = useMemo(() => {
        let allEvents: EventInput[] = [];

        // Add events for all added sections
        addedSections.forEach((section) => {
            allEvents = [...allEvents, ...convertSectionToEvents(section)];
        });

        // Add ghost events for hovered section
        if (hoveredSection && !addedSections.find(s => s.crn === hoveredSection.crn)) {
            const ghostEvents = convertSectionToEvents(hoveredSection, true);
            allEvents = [...allEvents, ...ghostEvents];
        }

        return allEvents;
    }, [addedSections, hoveredSection, convertSectionToEvents]);

    // Event click handler
    const handleEventClick = useCallback((info: any) => {
        const section = info.event.extendedProps.sectionData;
        const isGhost = info.event.extendedProps.isGhost;
        const crn = info.event.extendedProps.crn;

        if (isGhost) {
            // If it's a ghost event, add the section
            onAddSection(section);
        } else {
            // If it's a regular event, show confirmation and remove
            const confirmRemove = window.confirm(
                `Remove ${section.courseCode} (Section ${section.section}, CRN ${crn}) from your schedule?`
            );

            if (confirmRemove) {
                onRemoveSection(crn);
            }
        }
    }, [onAddSection, onRemoveSection]);

    const formatEventContent = (eventInfo: any) => {
        const isGhost = eventInfo.event.extendedProps.isGhost;
        const courseCode = eventInfo.event.extendedProps.courseCode;
        const sectionType = eventInfo.event.extendedProps.sectionType;
        const room = eventInfo.event.extendedProps.room;
        const instructor = eventInfo.event.extendedProps.instructor;
        const crn = eventInfo.event.extendedProps.crn;

        return (
            <div className={`relative h-full w-full overflow-hidden ${isGhost
                    ? 'bg-white/90 border-2 border-dashed border-blue-400 rounded-md shadow-sm backdrop-blur-sm'
                    : 'bg-gradient-to-br from-white/20 to-white/10 rounded-md shadow-lg backdrop-blur-sm border border-white/30'
                }`}>
                <div className="p-2 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex-shrink-0">
                        <div className={`font-bold text-sm leading-tight ${isGhost ? 'text-blue-700' : 'text-white drop-shadow-sm'
                            }`}>
                            {courseCode}
                        </div>
                        <div className={`text-xs font-medium ${isGhost ? 'text-blue-600' : 'text-white/90 drop-shadow-sm'
                            }`}>
                            {sectionType}  
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow flex flex-col justify-center">
                        <div className={`text-xs ${isGhost ? 'text-gray-700' : 'text-white/85 drop-shadow-sm'
                            }`}>
                            {room}
                        </div>
                        <div className={`text-xs ${isGhost ? 'text-gray-600' : 'text-white/80 drop-shadow-sm'
                            }`}>
                            {instructor.length > 15 ? instructor.substring(0, 15) + '...' : instructor}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 flex items-center justify-between mb-5">
                        <div className={`text-xs font-mono ${isGhost ? 'text-gray-500' : 'text-white/70 drop-shadow-sm'
                            }`}>
                            {crn}
                        </div>
                    </div>
                </div>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 ${isGhost
                        ? 'bg-blue-50/50'
                        : 'bg-black/20'
                    } rounded-md pointer-events-none`}></div>
            </div>
        );
    };

    return (
        <div className="h-full">

            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                events={events}
                eventContent={formatEventContent}
                height="80vh"
                eventClick={handleEventClick}
                eventMouseEnter={(info) => {
                    info.el.style.cursor = 'pointer';
                    info.el.style.zIndex = '10';
                }}
                eventMouseLeave={(info) => {
                    info.el.style.zIndex = '1';
                }}
                allDaySlot={false}
                slotDuration="00:30:00"
                slotMinTime={'08:00:00'}
                slotMaxTime={'20:30:00'}
                hiddenDays={[0]}
                timeZone='local'
                headerToolbar={{
                    left: '',
                    center: '',
                    right: ''
                }}
                navLinks={false}
            />
        </div>
    );
}