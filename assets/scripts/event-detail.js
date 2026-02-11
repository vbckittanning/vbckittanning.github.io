/**
 * Event Detail Page - Load event data from JSON
 */

async function loadEventDetail() {
    // Read event ID from query string (?id=event-2026-01-22-game-night)
    const eventId = getQueryParam('id');

    if (!eventId) {
        showEventError();
        return;
    }

    const dataPath = 'data/events/';

    // Load event data from JSON file
    const response = await fetch(`${dataPath}${eventId}.json`);

    if (!response.ok) {
        showEventError();
        return;
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
        const formattedDate = event.endDate ? formatDateRange(event.date, event.endDate) : formatEventDate(event.date);
        
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
            ${event.time ? `
            <span class="event-detail-time">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${event.time}
            </span>
            ` : ''}
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
        const categoryClass = getCategoryClass(event.category);
        const categoryName = getCategoryName(event.category);
        
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
const photosPerPage = 10;

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

    calendarIcons.innerHTML = generateCalendarIconsHtml(event);

    attachCalendarListeners();
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
