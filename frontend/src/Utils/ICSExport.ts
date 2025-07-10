import type { Section, MeetingTime } from '../Types/Registration';

interface ICSEvent {
  summary: string;
  description: string;
  start: string;
  end: string;
  location: string;
  uid: string;
}

export class ICSExporter {
  private static formatDateTime(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private static parseTime(timeStr: string): { start: Date; end: Date } | null {
    console.log('Parsing time string:', timeStr);
    
    if (!timeStr || timeStr.toLowerCase().includes('tba') || timeStr.toLowerCase().includes('online') || timeStr === '-') {
      console.log('Time string is TBA, online, or empty');
      return null;
    }

    // First try 24-hour format without colons (like "0830-1220", "1430-1720")
    const time24Match = timeStr.match(/(\d{3,4})-(\d{3,4})/);
    if (time24Match) {
      console.log('Matched 24-hour format:', time24Match);
      const [, startTime, endTime] = time24Match;
      
      // Parse start time
      const startHour = Math.floor(parseInt(startTime) / 100);
      const startMin = parseInt(startTime) % 100;
      
      // Parse end time
      const endHour = Math.floor(parseInt(endTime) / 100);
      const endMin = parseInt(endTime) % 100;
      
      console.log('Parsed times:', { startHour, startMin, endHour, endMin });
      
      // Create dates
      const startDate = new Date();
      startDate.setHours(startHour, startMin, 0, 0);
      
      const endDate = new Date();
      endDate.setHours(endHour, endMin, 0, 0);
      
      console.log('Created dates:', { start: startDate, end: endDate });
      return { start: startDate, end: endDate };
    }

    // Then try colon format like "08:30-09:20" or "2:00-3:50 pm"
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*(am|pm)?/i);
    if (timeMatch) {
      console.log('Matched colon format:', timeMatch);
      const [, startHour, startMin, endHour, endMin, period] = timeMatch;
      
      let startHour24 = parseInt(startHour);
      let endHour24 = parseInt(endHour);

      // Handle AM/PM
      if (period) {
        const isPM = period.toLowerCase() === 'pm';
        if (isPM && startHour24 !== 12) startHour24 += 12;
        if (isPM && endHour24 !== 12) endHour24 += 12;
        if (!isPM && startHour24 === 12) startHour24 = 0;
        if (!isPM && endHour24 === 12) endHour24 = 0;
      }

      // Create dates
      const startDate = new Date();
      startDate.setHours(startHour24, parseInt(startMin), 0, 0);
      
      const endDate = new Date();
      endDate.setHours(endHour24, parseInt(endMin), 0, 0);

      console.log('Created dates from colon format:', { start: startDate, end: endDate });
      return { start: startDate, end: endDate };
    }

    console.log('No time format matched for:', timeStr);
    return null;
  }

  private static parseDays(daysStr: string): string[] {
    if (!daysStr || daysStr.toLowerCase().includes('tba')) return [];
    
    const dayMap: { [key: string]: string } = {
      'M': 'MO',
      'T': 'TU', 
      'W': 'WE',
      'R': 'TH',
      'F': 'FR',
      'S': 'SA',
      'U': 'SU'
    };

    return daysStr.split('').map(day => dayMap[day]).filter(Boolean);
  }

  private static generateUID(section: Section, meetingIndex: number): string {
    return `langara-${section.crn}-${meetingIndex}@langarascraper.com`;
  }

  private static createEvent(section: Section, meeting: MeetingTime, meetingIndex: number, term: string): ICSEvent | null {
    const timeInfo = this.parseTime(meeting.time);
    if (!timeInfo) return null;

    const days = this.parseDays(meeting.days);
    if (days.length === 0) return null;

    // Parse term to get semester start date (rough estimate)
    const year = parseInt(term.substring(0, 4));
    const semester = term.substring(4, 6);
    
    let semesterStart = new Date(year, 0, 1); // Default to January
    switch (semester) {
      case '10': // Spring
        semesterStart = new Date(year, 0, 15); // Mid January
        break;
      case '20': // Summer  
        semesterStart = new Date(year, 4, 1); // May
        break;
      case '30': // Fall
        semesterStart = new Date(year, 8, 1); // September
        break;
    }

    // Find the first occurrence of the first day
    const firstDay = days[0];
    const dayIndex = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].indexOf(firstDay);
    const startOfWeek = new Date(semesterStart);
    
    // Adjust to first occurrence of the day
    const dayDiff = (dayIndex - startOfWeek.getDay() + 7) % 7;
    startOfWeek.setDate(startOfWeek.getDate() + dayDiff);

    // Set the time
    const eventStart = new Date(startOfWeek);
    eventStart.setHours(timeInfo.start.getHours(), timeInfo.start.getMinutes(), 0, 0);
    
    const eventEnd = new Date(startOfWeek);
    eventEnd.setHours(timeInfo.end.getHours(), timeInfo.end.getMinutes(), 0, 0);

    return {
      summary: `${section.courseCode} - ${section.title}`,
      description: `Course: ${section.courseCode}\\nCRN: ${section.crn}\\nSection: ${section.section}\\nInstructor: ${meeting.instructor || 'TBA'}\\nCredits: ${section.credits}`,
      start: this.formatDateTime(eventStart),
      end: this.formatDateTime(eventEnd),
      location: meeting.room || 'TBA',
      uid: this.generateUID(section, meetingIndex)
    };
  }

  private static generateRRule(days: string[], term: string): string {
    // Calculate rough semester end (16 weeks from start)
    const year = parseInt(term.substring(0, 4));
    const semester = term.substring(4, 6);
    
    let semesterEnd = new Date(year, 11, 31); // Default to end of year
    switch (semester) {
      case '10': // Spring - ends in April
        semesterEnd = new Date(year, 3, 30);
        break;
      case '20': // Summer - ends in August
        semesterEnd = new Date(year, 7, 31);
        break;
      case '30': // Fall - ends in December
        semesterEnd = new Date(year, 11, 20);
        break;
    }

    const until = this.formatDateTime(semesterEnd);
    const byDay = days.join(',');
    
    return `FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${until}`;
  }

  public static exportToICS(sections: Section[], term: string): void {
    if (sections.length === 0) {
      alert('No courses selected to export');
      return;
    }

    const events: ICSEvent[] = [];

    sections.forEach(section => {
      section.meetingTimes.forEach((meeting, index) => {
        const event = this.createEvent(section, meeting, index, term);
        if (event) {
          events.push(event);
        }
      });
    });

    if (events.length === 0) {
      alert('No valid course times found to export');
      return;
    }

    // Generate ICS content
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LangaraScraper//Course Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n');

    events.forEach(event => {
      // Find the section and meeting for this event
      let meetingDays = '';
      for (const section of sections) {
        for (const meeting of section.meetingTimes) {
          if (event.summary.includes(section.courseCode)) {
            meetingDays = meeting.days;
            break;
          }
        }
        if (meetingDays) break;
      }
      
      const days = this.parseDays(meetingDays);
      const rrule = days.length > 0 ? this.generateRRule(days, term) : '';

      icsContent += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${event.uid}`,
        `DTSTART:${event.start}`,
        `DTEND:${event.end}`,
        `SUMMARY:${event.summary}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        rrule ? `RRULE:${rrule}` : '',
        'END:VEVENT'
      ].filter(line => line !== '').join('\r\n');
    });

    icsContent += '\r\nEND:VCALENDAR';

    // Download the file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `langara-schedule-${term}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  public static formatTermDisplay(term: string): string {
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
    return term;
  }
}
