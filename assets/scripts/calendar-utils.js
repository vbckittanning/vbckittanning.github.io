// ============================================================================
// CALENDAR UTILITIES - Shared library for adding events to calendars
// ============================================================================

/** Zero-pad a number to 2 digits */
const pad = (n) => String(n).padStart(2, '0');

/**
 * Format date and time for calendar services
 * @param {string} date - Start date in YYYY-MM-DD format
 * @param {string} [time] - Time string (e.g., "7:00 PM", "10:45 AM-12:00 PM"). Omit for all-day events.
 * @param {string} [endDate] - End date in YYYY-MM-DD format (optional, for multi-day events)
 * @returns {Object} Object with start and end datetime strings in EST, and allDay flag
 */
function parseEventDateTime(date, time, endDate) {
    // Parse the start date
    const [year, month, day] = date.split('-').map(Number);
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;

    // Determine the end date string (defaults to start date)
    const endDateStr = endDate || date;
    const [eYear, eMonth, eDay] = endDateStr.split('-').map(Number);
    const endDateFormatted = `${eYear}-${pad(eMonth)}-${pad(eDay)}`;

    // If no time provided, return as all-day event
    if (!time) {
        const startDateObj = new Date(`${dateStr}T00:00:00`);
        // All-day end date is exclusive, so add 1 day past the end date
        const endDateObj = new Date(`${endDateFormatted}T00:00:00`);
        endDateObj.setDate(endDateObj.getDate() + 1);
        return { start: startDateObj, end: endDateObj, allDay: true };
    }
    
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
    const startTimeStr = `${pad(startTime.hours)}:${pad(startTime.minutes)}:00`;
    const endTimeStr = `${pad(endTime.hours)}:${pad(endTime.minutes)}:00`;
    
    // Start time uses start date, end time uses end date (for multi-day timed events)
    const startDateObj = new Date(`${dateStr}T${startTimeStr}`);
    const endDateObj = new Date(`${endDateFormatted}T${endTimeStr}`);
    
    return { start: startDateObj, end: endDateObj, allDay: false };
}

/**
 * Format date for ICS format (YYYYMMDDTHHMMSS)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
function formatICSDate(date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/**
 * Format date for ICS all-day format (YYYYMMDD)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string (date only)
 */
function formatICSDateOnly(date) {
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

/**
 * Generate Google Calendar URL
 * @param {Object} event - Event object with title, date, time, description, location
 * @returns {string} Google Calendar URL
 */
function generateGoogleCalendarUrl(event) {
    const { start, end, allDay } = parseEventDateTime(event.date, event.time, event.endDate);
    
    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: allDay
            ? `${formatICSDateOnly(start)}/${formatICSDateOnly(end)}`
            : `${formatICSDate(start)}/${formatICSDate(end)}`,
        details: event.description || '',
        location: event.location || ''
    });

    if (!allDay) {
        params.set('ctz', 'America/New_York');
    }
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Outlook.com Calendar URL
 * @param {Object} event - Event object with title, date, time, description, location
 * @returns {string} Outlook Calendar URL
 */
function generateOutlookCalendarUrl(event) {
    const { start, end, allDay } = parseEventDateTime(event.date, event.time, event.endDate);
    
    const formatOutlookDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const formatOutlookDateOnly = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: event.title,
        startdt: allDay ? formatOutlookDateOnly(start) : formatOutlookDate(start),
        enddt: allDay ? formatOutlookDateOnly(end) : formatOutlookDate(end),
        body: event.description || '',
        location: event.location || '',
        allday: allDay ? 'true' : 'false'
    });
    
    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate ICS file content for Apple Calendar and desktop clients
 * @param {Object} event - Event object with title, date, time, description, location
 * @returns {string} ICS file content
 */
function generateICSFile(event) {
    const { start, end, allDay } = parseEventDateTime(event.date, event.time, event.endDate);
    
    // Escape special characters in ICS format
    const escape = (str) => {
        if (!str) return '';
        return str.replace(/\\/g, '\\\\')
                  .replace(/;/g, '\\;')
                  .replace(/,/g, '\\,')
                  .replace(/\n/g, '\\n');
    };

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Victory Baptist Church//Events//EN'
    ];

    // Only include timezone block for timed events
    if (!allDay) {
        lines.push(
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
            'END:VTIMEZONE'
        );
    }

    lines.push(
        'BEGIN:VEVENT',
        `UID:${event.id || Date.now()}@victorybaptistchurch.com`,
        `DTSTAMP:${formatICSDate(new Date())}`
    );

    if (allDay) {
        lines.push(
            `DTSTART;VALUE=DATE:${formatICSDateOnly(start)}`,
            `DTEND;VALUE=DATE:${formatICSDateOnly(end)}`
        );
    } else {
        lines.push(
            `DTSTART;TZID=America/New_York:${formatICSDate(start)}`,
            `DTEND;TZID=America/New_York:${formatICSDate(end)}`
        );
    }

    lines.push(
        `SUMMARY:${escape(event.title)}`,
        `DESCRIPTION:${escape(event.description || '')}`
    );

    if (event.location) {
        lines.push(`LOCATION:${escape(event.location)}`);
    }

    lines.push(
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
    );

    return lines.join('\r\n');
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
 * Generate calendar icons HTML for an event
 * @param {Object} event - Event object
 * @returns {string} HTML string for Google, Outlook, and Apple calendar links
 */
function generateCalendarIconsHtml(event) {
    const eventJson = JSON.stringify(event).replace(/'/g, "&#39;");
    return `
        <a href="#" data-event='${eventJson}' class="calendar-icon google-calendar" title="Add to Google Calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3.01 4.9 3.01 6L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm7 6H7v-2h5v2zm4 0h-2v-2h2v2zm0 4h-2v-2h2v2zm-4 0H7v-2h5v2z" fill="#4285F4"/>
                <path d="M12 14H7v-2h5v2z" fill="#EA4335"/>
                <path d="M16 14h-2v-2h2v2z" fill="#FBBC04"/>
                <path d="M16 18h-2v-2h2v2z" fill="#34A853"/>
                <path d="M12 18H7v-2h5v2z" fill="#4285F4"/>
            </svg>
        </a>
        <a href="#" data-event='${eventJson}' class="calendar-icon outlook-calendar" title="Add to Outlook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M24 12.5v7.1c0 .8-.7 1.4-1.5 1.4H13v-9h11v.5z" fill="#0078D4"/>
                <path d="M13 3v9H2V4.5C2 3.7 2.7 3 3.5 3H13z" fill="#0078D4"/>
                <path d="M13 12H2v7.5c0 .8.7 1.5 1.5 1.5H13v-9z" fill="#0364B8"/>
                <path d="M24 4.5V12H13V3h9.5c.8 0 1.5.7 1.5 1.5z" fill="#28A8EA"/>
                <path d="M9.5 7C7.6 7 6 8.6 6 10.5S7.6 14 9.5 14s3.5-1.6 3.5-3.5S11.4 7 9.5 7zm0 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="white"/>
            </svg>
        </a>
        <a href="#" data-event='${eventJson}' class="calendar-icon apple-calendar" title="Add to Apple Calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
        </a>
    `;
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
