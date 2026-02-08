/**
 * Event Detail Page - Load event data from JSON
 */

async function loadEventDetail() {
        // Extract event ID from the filename
    const pathname = window.location.pathname;
    const filename = pathname.split('/').pop();
    const eventId = filename.replace('.html', '');

    const dataPath = '../data/events/';

    // Load event data from JSON file
    const response = await fetch(`${dataPath}${eventId}.json`);

    if (!response.ok) {
        showEventError();
    }

    const event = await response.json();

    // Populate page with event data
    populateEventDetails(event);
}

function populateEventDetails(event) {
    // Update page title and meta tags
    const pageTitle = `${event.title} - Victory Baptist Church Kittanning`;
    document.title = pageTitle;
    
    // Get current page URL
    const currentUrl = window.location.href;
    
    // Update meta tags
    const metaDescription = document.getElementById('meta-description');
    if (metaDescription) {
        metaDescription.setAttribute('content', event.description);
    }
    
    const metaOgTitle = document.getElementById('meta-og-title');
    if (metaOgTitle) {
        metaOgTitle.setAttribute('content', pageTitle);
    }
    
    const metaOgDescription = document.getElementById('meta-og-description');
    if (metaOgDescription) {
        metaOgDescription.setAttribute('content', event.description);
    }
    
    const metaOgUrl = document.getElementById('meta-og-url');
    if (metaOgUrl) {
        metaOgUrl.setAttribute('content', currentUrl);
    }
    
    const metaCanonical = document.getElementById('meta-canonical');
    if (metaCanonical) {
        metaCanonical.setAttribute('href', currentUrl);
    }
    
    // Update breadcrumb
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = event.title;
    }
    
    // Update event title
    const eventTitle = document.getElementById('event-title');
    if (eventTitle) {
        eventTitle.textContent = event.title;
    }
    
    // Update event meta (date, time, location)
    const eventMeta = document.getElementById('event-meta');
    if (eventMeta) {
        const formattedDate = formatEventDate(event.date);
        
        eventMeta.innerHTML = `
            <span class="event-detail-date">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${formattedDate}
            </span>
            <span class="event-detail-time">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${event.time}
            </span>
            <span class="event-detail-location">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}" target="_blank" rel="noopener noreferrer">${event.location}</a>
            </span>
        `;
    }
    
    // Update description
    const eventDescription = document.getElementById('event-description');
    if (eventDescription) {
        eventDescription.textContent = event.description;
    }
    
    // Update event info card
    const eventInfo = document.getElementById('event-info');
    if (eventInfo) {
        const categoryClass = `category-${event.category}`;
        const categoryName = capitalizeFirstLetter(event.category);
        
        eventInfo.innerHTML = `
            <div class="info-item">
                <strong>Category:</strong>
                <span class="event-category ${categoryClass}">${categoryName}</span>
            </div>
            <div class="info-item">
                <strong>Contact:</strong>
                <span>${event.contactName || 'Church Office'}</span>
            </div>
        `;
    }
    
    // Load photos if available
    if (event.photos && event.photos.length > 0) {
        loadEventPhotos(event.photos);
    } else {
        // Hide photos section if no photos
        const photosSection = document.querySelector('.event-photos-section');
        if (photosSection) {
            photosSection.style.display = 'none';
        }
    }
    
    // Render calendar options
    renderCalendarOptions(event);
}

// Photo pagination state
let allPhotos = [];
let currentPhotoPage = 1;
const photosPerPage = 6;

function loadEventPhotos(photos) {
    allPhotos = photos;
    currentPhotoPage = 1;
    
    renderPhotoPage();
    renderPhotoPagination();
}

function renderPhotoPage() {
    const photoGrid = document.getElementById('photoGrid');
    if (!photoGrid) return;
    
    photoGrid.innerHTML = '';
    
    const startIndex = (currentPhotoPage - 1) * photosPerPage;
    const endIndex = Math.min(startIndex + photosPerPage, allPhotos.length);
    const pagePhotos = allPhotos.slice(startIndex, endIndex);
    
    pagePhotos.forEach((photo, pageIndex) => {
        const actualIndex = startIndex + pageIndex;
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-index', actualIndex.toString());
        
        const img = document.createElement('img');
        img.src = photo.src || photo;
        img.alt = photo.alt || `Event photo ${actualIndex + 1}`;
        img.loading = 'lazy';
        
        photoItem.appendChild(img);
        photoGrid.appendChild(photoItem);
    });
    
    // Initialize lightbox after photos are loaded
    if (window.Lightbox) {
        setTimeout(() => {
            window.lightboxInstance = new window.Lightbox();
        }, 100);
    }
}

function renderPhotoPagination() {
    const totalPages = Math.ceil(allPhotos.length / photosPerPage);
    
    // Only show pagination if more than one page
    if (totalPages <= 1) return;
    
    const photosSection = document.querySelector('.event-photos-section');
    if (!photosSection) return;
    
    // Remove existing pagination if present
    const existingPagination = photosSection.querySelector('.photo-pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'photo-pagination';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'photo-page-btn';
    prevBtn.innerHTML = '← Previous';
    prevBtn.disabled = currentPhotoPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPhotoPage > 1) {
            currentPhotoPage--;
            renderPhotoPage();
            renderPhotoPagination();
            scrollToPhotos();
        }
    });
    paginationDiv.appendChild(prevBtn);
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'photo-page-info';
    pageInfo.textContent = `${currentPhotoPage} of ${totalPages}`;
    paginationDiv.appendChild(pageInfo);
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'photo-page-btn';
    nextBtn.innerHTML = 'Next →';
    nextBtn.disabled = currentPhotoPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPhotoPage < totalPages) {
            currentPhotoPage++;
            renderPhotoPage();
            renderPhotoPagination();
            scrollToPhotos();
        }
    });
    paginationDiv.appendChild(nextBtn);
    
    photosSection.appendChild(paginationDiv);
}

function scrollToPhotos() {
    const photosSection = document.querySelector('.event-photos-section');
    if (photosSection) {
        photosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderCalendarOptions(event) {
    const calendarSection = document.getElementById('eventCalendarSection');
    if (!calendarSection) return;
    
    const calendarIcons = calendarSection.querySelector('.calendar-icons');
    if (!calendarIcons) return;

    calendarIcons.innerHTML = `
        <a href="#" data-event='${JSON.stringify(event).replace(/'/g, "&#39;")}' class="calendar-icon google-calendar" title="Add to Google Calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3.01 4.9 3.01 6L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm7 6H7v-2h5v2zm4 0h-2v-2h2v2zm0 4h-2v-2h2v2zm-4 0H7v-2h5v2z" fill="#4285F4"/>
                <path d="M12 14H7v-2h5v2z" fill="#EA4335"/>
                <path d="M16 14h-2v-2h2v2z" fill="#FBBC04"/>
                <path d="M16 18h-2v-2h2v2z" fill="#34A853"/>
                <path d="M12 18H7v-2h5v2z" fill="#4285F4"/>
            </svg>
        </a>
        <a href="#" data-event='${JSON.stringify(event).replace(/'/g, "&#39;")}' class="calendar-icon outlook-calendar" title="Add to Outlook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M24 12.5v7.1c0 .8-.7 1.4-1.5 1.4H13v-9h11v.5z" fill="#0078D4"/>
                <path d="M13 3v9H2V4.5C2 3.7 2.7 3 3.5 3H13z" fill="#0078D4"/>
                <path d="M13 12H2v7.5c0 .8.7 1.5 1.5 1.5H13v-9z" fill="#0364B8"/>
                <path d="M24 4.5V12H13V3h9.5c.8 0 1.5.7 1.5 1.5z" fill="#28A8EA"/>
                <path d="M9.5 7C7.6 7 6 8.6 6 10.5S7.6 14 9.5 14s3.5-1.6 3.5-3.5S11.4 7 9.5 7zm0 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="white"/>
            </svg>
        </a>
        <a href="#" data-event='${JSON.stringify(event).replace(/'/g, "&#39;")}' class="calendar-icon apple-calendar" title="Add to Apple Calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
        </a>
    `;

    attachCalendarListeners();
}

function formatEventDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showEventError() {
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const eventMeta = document.getElementById('event-meta');
    const eventInfo = document.getElementById('event-info');
    
    if (eventTitle) {
        eventTitle.textContent = 'Event Not Found';
    }
    
    if (eventDescription) {
        eventDescription.innerHTML = 'Sorry, we could not load the event details. Please <a href="../../events.html">return to the events page</a>.';
    }
    
    if (eventMeta) {
        eventMeta.innerHTML = '';
    }
    
    if (eventInfo) {
        eventInfo.innerHTML = '<p>Event information unavailable.</p>';
    }
}
