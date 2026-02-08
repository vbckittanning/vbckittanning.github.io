/**
 * Event Detail Page - Load event data from JSON
 */

async function loadEventDetail() {
    try {
        // Extract event ID from the filename
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop();
        const eventId = filename.replace('.html', '');
        
        const dataPath = '../data/events/';
        
        // Load event data from JSON file
        const response = await fetch(`${dataPath}${eventId}.json`);
        
        if (!response.ok) {
            throw new Error('Event not found');
        }
        
        const event = await response.json();
        
        // Populate page with event data
        populateEventDetails(event);
        
    } catch (error) {
        console.error('Error loading event:', error);
        showEventError();
    }
}

function populateEventDetails(event) {
    // Update page title
    document.title = `${event.title} - Victory Baptist Church Kittanning`;
    
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
}

function loadEventPhotos(photos) {
    const photoGrid = document.getElementById('photoGrid');
    if (!photoGrid) return;
    
    photoGrid.innerHTML = '';
    
    photos.forEach((photo, index) => {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.setAttribute('data-index', index);
        
        const img = document.createElement('img');
        img.src = photo.src || photo;
        img.alt = photo.alt || `Event photo ${index + 1}`;
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
        eventDescription.innerHTML = 'Sorry, we could not load the event details. Please <a href="../events.html">return to the events page</a>.';
    }
    
    if (eventMeta) {
        eventMeta.innerHTML = '';
    }
    
    if (eventInfo) {
        eventInfo.innerHTML = '<p>Event information unavailable.</p>';
    }
}
