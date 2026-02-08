// ============================================================================
// CALENDAR UTILITIES - Shared library for adding events to calendars
// ============================================================================

/**
 * Format date and time for calendar services
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time string (e.g., "7:00 PM", "10:45 AM-12:00 PM")
 * @returns {Object} Object with start and end datetime strings in EST
 */
function parseEventDateTime(date, time) {
    // Parse the date
    const [year, month, day] = date.split('-').map(Number);
    
    // Helper to parse a single time string
    const parseTime = (timeStr) => {
        const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!match) return null;
        
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const meridiem = match[3].toUpperCase();
        
        // Convert to 24-hour format
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        if (meridiem === 'AM' && hours === 12) hours = 0;
        
        return { hours, minutes };
    };
    
    // Check if time range is provided (e.g., "10:45 AM-12:00 PM")
    const rangeMatch = time.match(/(.+?)\s*-\s*(.+)/);
    
    let startTime, endTime;
    
    if (rangeMatch) {
        // Time range provided
        startTime = parseTime(rangeMatch[1]);
        endTime = parseTime(rangeMatch[2]);
    } else {
        // Single time provided
        startTime = parseTime(time);
        if (startTime) {
            // Default duration: 1 hour
            endTime = {
                hours: startTime.hours + 1,
                minutes: startTime.minutes
            };
        }
    }
    
    // Default to noon if parsing failed
    if (!startTime) {
        startTime = { hours: 12, minutes: 0 };
        endTime = { hours: 13, minutes: 0 };
    }
    if (!endTime) {
        endTime = {
            hours: startTime.hours + 1,
            minutes: startTime.minutes
        };
    }
    
    // Create dates in EST timezone
    // Build ISO string for EST time and parse it
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;
    const startTimeStr = `${pad(startTime.hours)}:${pad(startTime.minutes)}:00`;
    const endTimeStr = `${pad(endTime.hours)}:${pad(endTime.minutes)}:00`;
    
    // Create date strings in EST format (no timezone conversion)
    const startDate = new Date(`${dateStr}T${startTimeStr}`);
    const endDate = new Date(`${dateStr}T${endTimeStr}`);
    
    return { start: startDate, end: endDate };
}

/**
 * Format date for ICS format (YYYYMMDDTHHMMSS)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatICSDate(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Generate Google Calendar URL
 * @param {Object} event - Event object with title, date, time, description, location
 * @returns {string} Google Calendar URL
 */
function generateGoogleCalendarUrl(event) {
    const { start, end } = parseEventDateTime(event.date, event.time);
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
        details: event.description || '',
        location: event.location || '',
        ctz: 'America/New_York'
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com Calendar URL
 * @param {Object} event - Event object with title, date, time, description, location
 * @returns {string} Outlook Calendar URL
 */
function generateOutlookCalendarUrl(event) {
    const { start, end } = parseEventDateTime(event.date, event.time);
    
    const formatOutlookDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };
    
    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: event.title,
        startdt: formatOutlookDate(start),
        enddt: formatOutlookDate(end),
        body: event.description || '',
        location: event.location || '',
        allday: 'false'
    });
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS file content for Apple Calendar and desktop clients
 * @param {Object} event - Event object with title, date, time, description, location
 * @returns {string} ICS file content
 */
function generateICSFile(event) {
    const { start, end } = parseEventDateTime(event.date, event.time);
    
    // Escape special characters in ICS format
    const escape = (str) => {
        if (!str) return '';
        return str.replace(/\\/g, '\\\\')
                  .replace(/;/g, '\\;')
                  .replace(/,/g, '\\,')
                  .replace(/\n/g, '\\n');
    };

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Victory Baptist Church//Events//EN',
        'BEGIN:VTIMEZONE',
        'TZID:America/New_York',
        'BEGIN:DAYLIGHT',
        'TZOFFSETFROM:-0500',
        'TZOFFSETTO:-0400',
        'TZNAME:EDT',
        'DTSTART:19700308T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
        'END:DAYLIGHT',
        'BEGIN:STANDARD',
        'TZOFFSETFROM:-0400',
        'TZOFFSETTO:-0500',
        'TZNAME:EST',
        'DTSTART:19701101T020000',
        'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
        'END:STANDARD',
        'END:VTIMEZONE',
        'BEGIN:VEVENT',
        `UID:${event.id || Date.now()}@victorybaptistchurch.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART;TZID=America/New_York:${formatICSDate(start)}`,
        `DTEND;TZID=America/New_York:${formatICSDate(end)}`,
        `SUMMARY:${escape(event.title)}`,
        `DESCRIPTION:${escape(event.description || '')}`,
        event.location ? `LOCATION:${escape(event.location)}` : '',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(line => line).join('\r\n');
}

/**
 * Download ICS file
 * @param {Object} event - Event object
 */
function downloadICSFile(event) {
    const icsContent = generateICSFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Attach event listeners to calendar icons
 */
function attachCalendarListeners() {
    document.querySelectorAll('.google-calendar').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const eventData = JSON.parse(link.getAttribute('data-event'));
            const url = generateGoogleCalendarUrl(eventData);
            window.open(url, '_blank');
        });
    });
    
    document.querySelectorAll('.outlook-calendar').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const eventData = JSON.parse(link.getAttribute('data-event'));
            const url = generateOutlookCalendarUrl(eventData);
            window.open(url, '_blank');
        });
    });
    
    document.querySelectorAll('.apple-calendar').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const eventData = JSON.parse(link.getAttribute('data-event'));
            downloadICSFile(eventData);
        });
    });
}
