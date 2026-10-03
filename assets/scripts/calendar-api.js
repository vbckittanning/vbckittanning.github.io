async function fetchCurrentEvents() {
    const now = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2); // Add 2 months

    const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(SITE_CONFIG.CalendarId)}/events?` +
        `key=${encodeURIComponent(SITE_CONFIG.GCloudApiKey)}` +
        `&timeMin=${encodeURIComponent(now.toISOString())}` +
        `&timeMax=${encodeURIComponent(maxDate.toISOString())}` +
        `&singleEvents=true` +
        `&orderBy=startTime`;

    const response = await fetch(url);
    const events = await response.json();

    return events.items;
}
