/**
 * @typedef {Object} Event
 * @property {string} id - Unique event identifier
 * @property {string} title - Event title
 * @property {string} date - Event start date in YYYY-MM-DD format
 * @property {string} [endDate] - Event end date in YYYY-MM-DD format (optional, for multi-day events)
 * @property {string} [time] - Event time (optional; omit for all-day events)
 * @property {string} description - Event description
 * @property {string} [location] - Event location (optional)
 * @property {string} [category] - Event category (service, study, fellowship, outreach, youth, special)
 * @property {string} [contactName] - Contact person name (optional)
 * @property {string} [contactEmail] - Contact email (optional)
 * @property {string} [contactPhone] - Contact phone (optional)
 * @property {Array<string>} [photos] - Event photos (optional)
 */

// Events Page Configuration
const EVENTS_CONFIG = {
    eventsPerPage: 5,
    dataPath: 'data/events/',
    manifestPath: 'data/events/manifest.json'
};

// State management
/** @type {Array<Event>} */
let currentPageEvents = [];
let currentPage = 1;
let totalFilteredFiles = 0;
let showPastEvents = false;

// Check if showing past events
function initializeViewMode() {
    const viewParam = getQueryParam('view');
    showPastEvents = viewParam === 'past';
    
    const pageParam = getQueryParam('page');
    currentPage = pageParam ? parseInt(pageParam, 10) : 1;
    if (currentPage < 1) currentPage = 1;
    
    updatePageTitle();
}

// Update page title based on view mode
function updatePageTitle() {
    const titleElement = document.querySelector('.events-hero .hero-title');
    const subtitleElement = document.querySelector('.events-hero .hero-subtitle');
    
    if (titleElement) {
        titleElement.textContent = showPastEvents ? 'Past Events' : 'Upcoming Events';
    }
    
    if (subtitleElement) {
        subtitleElement.textContent = showPastEvents 
            ? 'Look back at our previous events and activities'
            : 'Join us for upcoming services, studies, and fellowship';
    }
}

// Extract date from event filename (format: event-YYYY-MM-DD-slug.json)
function extractEventDate(filename) {
    return extractDateFromFilename(filename, /event-(\d{4}-\d{2}-\d{2})/);
}

// Check if event date has passed based on filename
function isEventFilePast(filename) {
    const dateStr = extractEventDate(filename);
    if (!dateStr) {
        console.warn(`Could not extract date from filename: ${filename}`);
        return false;
    }
    return isDatePast(dateStr);
}

// Filter function for individual event file (used by libs.js)
function filterEventFile(filename) {
    const isPast = isEventFilePast(filename);
    return showPastEvents ? isPast : !isPast;
}

// Sort function for event files (used by libs.js)
function sortEventFiles(a, b) {
    const dateA = new Date(extractEventDate(a));
    const dateB = new Date(extractEventDate(b));
    return showPastEvents ? dateB - dateA : dateA - dateB;
}

// Pagination now uses libs.js paginateArray

/**
 * Load only the events for the current page
 * @returns {Promise<Array<Event>>} Array of event objects for the current page
 */
async function loadPageEvents() {
    // Use the generic loadPaginatedJsonData from libs.js
    const result = await loadPaginatedJsonData({
        manifestPath: EVENTS_CONFIG.manifestPath,
        dataPath: EVENTS_CONFIG.dataPath,
        manifestKey: 'events',
        filterFn: filterEventFile,
        sortFn: sortEventFiles,
        page: currentPage,
        itemsPerPage: EVENTS_CONFIG.eventsPerPage
    });
    
    // Store total count for pagination
    totalFilteredFiles = result.total;
    
    return result.items;
}


/**
 * Create HTML for an event card
 * @param {Event} event - The event object to render
 * @returns {string} HTML string for the event card
 */
function createEventCard(event) {
    const categoryClass = getCategoryClass(event.category);
    const categoryName = getCategoryName(event.category);
    
    // Link all events to the generic event detail page
    const eventPageUrl = `event-details.html?id=${encodeURIComponent(event.id)}`;
    const titleHtml = `<a href="${eventPageUrl}" class="event-title-link"><h3 class="event-title">${event.title}</h3></a>`;
    
    return `
        <div class="event-card">
            <div class="event-date-badge">
                <div class="event-month">${getMonthAbbreviation(event.date)}</div>
                <div class="event-day">${getDayOfMonth(event.date)}</div>
            </div>
            <div class="event-content">
                <div class="event-header">
                    ${titleHtml}
                    ${event.category ? `<span class="event-category ${categoryClass}">${categoryName}</span>` : ''}
                </div>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${event.endDate ? formatDateRange(event.date, event.endDate) : formatDate(event.date)}</span>
                    </div>
                    ${event.time ? `
                    <div class="event-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>${event.time}</span>
                    </div>
                    ` : ''}
                    ${event.location ? `
                    <div class="event-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" target="_blank" class="event-location-link">${event.location}</a>
                    </div>
                    ` : ''}
                </div>
                <p class="event-description">${event.description}</p>
                ${event.contactName || event.contactEmail || event.contactPhone ? `
                <div class="event-contact">
                    <strong>Contact:</strong> 
                    ${event.contactName ? event.contactName : ''}
                    ${event.contactEmail ? `<a href="mailto:${event.contactEmail}">${event.contactEmail}</a>` : ''}
                    ${event.contactPhone ? `<a href="tel:${event.contactPhone.replace(/\D/g, '')}">${event.contactPhone}</a>` : ''}
                </div>
                ` : ''}
                <div class="event-calendar-section">
                    <span class="calendar-label">Add to Calendar:</span>
                    <div class="calendar-icons">
                        ${generateCalendarIconsHtml(event)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Calculate total pages (uses libs.js)
function getTotalPages() {
    return calculateTotalPages(totalFilteredFiles, EVENTS_CONFIG.eventsPerPage);
}

// Build URL with page parameter
function buildPageUrl(page) {
    const url = new URL(window.location);
    if (page > 1) {
        url.searchParams.set('page', page);
    } else {
        url.searchParams.delete('page');
    }
    if (showPastEvents) {
        url.searchParams.set('view', 'past');
    }
    return url.toString();
}

// Render pagination controls
function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    
    if (!paginationContainer || totalPages <= 1) {
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // Previous button
    if (currentPage > 1) {
        html += `<a href="${buildPageUrl(currentPage - 1)}" class="pagination-btn">Previous</a>`;
    }
    
    // Page numbers
    html += '<div class="pagination-numbers">';
    
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 || 
            i === totalPages || 
            (i >= currentPage - 2 && i <= currentPage + 2)
        ) {
            const activeClass = i === currentPage ? 'active' : '';
            if (i === currentPage) {
                html += `<span class="pagination-number ${activeClass}">${i}</span>`;
            } else {
                html += `<a href="${buildPageUrl(i)}" class="pagination-number ${activeClass}">${i}</a>`;
            }
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="pagination-ellipsis">...</span>';
        }
    }
    
    html += '</div>';
    
    // Next button
    if (currentPage < totalPages) {
        html += `<a href="${buildPageUrl(currentPage + 1)}" class="pagination-btn">Next</a>`;
    }
    
    html += '</div>';
    
    paginationContainer.innerHTML = html;
}


// Render events to the page
function renderEvents() {
    const grid = document.getElementById('eventsGrid');
    const viewToggle = document.getElementById('viewToggle');
    
    if (!grid) {
        console.error('Events grid element not found');
        return;
    }
    
    // Update view toggle
    if (viewToggle) {
        const linkText = showPastEvents ? 'View Upcoming Events' : 'View Past Events';
        const linkUrl = showPastEvents ? 'events.html' : 'events.html?view=past';
        viewToggle.innerHTML = `<a href="${linkUrl}" class="view-toggle-link">${linkText}</a>`;
    }
    
    if (totalFilteredFiles === 0) {
        grid.innerHTML = `
            <div class="no-events-container">
                <p>No ${showPastEvents ? 'past' : 'upcoming'} events at this time.</p>
                ${!showPastEvents ? '<p>Check back soon for new events!</p>' : ''}
            </div>
        `;
        renderPagination(0);
        return;
    }
    
    const totalPages = getTotalPages();
    
    grid.innerHTML = currentPageEvents.map(event => createEventCard(event)).join('');
    renderPagination(totalPages);
    
    // Attach calendar icon event listeners
    attachCalendarListeners();
    
    // Update results info
    const resultsInfo = document.getElementById('resultsInfo');
    if (resultsInfo) {
        const startIndex = (currentPage - 1) * EVENTS_CONFIG.eventsPerPage + 1;
        const endIndex = Math.min(currentPage * EVENTS_CONFIG.eventsPerPage, totalFilteredFiles);
        resultsInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalFilteredFiles} events`;
    }
}

// Note: showLoading and showError are now in libs.js as shared utilities

// Initialize the events page
async function initializeEventsPage() {
    const eventsGrid = document.getElementById('eventsGrid');
    if (!eventsGrid) {
        return;
    }
    
    initializeViewMode();
    showLoading('eventsGrid', 'Loading events...');
    
    try {
        // loadPageEvents only loads the events for the current page
        currentPageEvents = await loadPageEvents();
        renderEvents();
    } catch (error) {
        console.error('Failed to initialize events page:', error);
        showError('eventsGrid', 'An unexpected error occurred while loading events.');
    }
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventsPage);
} else {
    initializeEventsPage()
        .then(() => console.log('Event loading complete'));
}
