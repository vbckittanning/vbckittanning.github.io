/**
 * Generic Utility Library for JSON Data Loading
 * Provides reusable functions for loading and managing JSON-based content
 */

// ============================================================================
// QUERY STRING UTILITIES
// ============================================================================

/**
 * Get a query parameter value from the URL
 * @param {string} param - The parameter name to retrieve
 * @returns {string|null} The parameter value or null if not found
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Set a query parameter and reload the page
 * @param {string} param - The parameter name to set
 * @param {string|null} value - The parameter value (null to delete)
 */
function setQueryParam(param, value) {
    const url = new URL(window.location);
    if (value) {
        url.searchParams.set(param, value);
    } else {
        url.searchParams.delete(param);
    }
    window.location.href = url.toString();
}

/**
 * Build a URL with query parameters
 * @param {Object} params - Object with key-value pairs for query parameters
 * @returns {string} The constructed URL
 */
function buildUrlWithParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    });
    return url.toString();
}

// ============================================================================
// JSON LOADING UTILITIES
// ============================================================================

/**
 * Load a manifest file that contains a list of JSON filenames
 * @param {string} manifestPath - Path to the manifest JSON file
 * @param {string} arrayKey - The key in the manifest that contains the array of filenames (default: 'files')
 * @returns {Promise<Array<string>>} Array of filenames from the manifest
 */
async function loadManifest(manifestPath, arrayKey = 'files') {
    const response = await fetch(manifestPath);
    const manifest = await response.json();

    return manifest[arrayKey];
}

/**
 * Load a single JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object|null>} The parsed JSON object or null on error
 */
async function loadJsonFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.warn(`Failed to load ${filePath}: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        return null;
    }
}

/**
 * Load multiple JSON files in parallel
 * @param {Array<string>} filenames - Array of filenames to load
 * @param {string} basePath - Base directory path for the files
 * @returns {Promise<Array<Object>>} Array of loaded JSON objects (nulls filtered out)
 */
async function loadJsonFiles(filenames, basePath) {
    const promises = filenames.map(filename => 
        loadJsonFile(`${basePath}${filename}`)
    );
    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
}

/**
 * Load JSON files from a manifest with optional filtering and sorting
 * @param {Object} config - Configuration object
 * @param {string} config.manifestPath - Path to manifest file
 * @param {string} config.dataPath - Base path for data files
 * @param {string} config.manifestKey - Key in manifest containing filenames (default: 'files')
 * @param {Function} config.filterFn - Optional filter function for filenames
 * @param {Function} config.sortFn - Optional sort function for filenames
 * @param {number} config.page - Page number for pagination (1-indexed)
 * @param {number} config.itemsPerPage - Number of items per page
 * @returns {Promise<Object>} Object with {items: Array, total: number, totalPages: number}
 */
async function loadPaginatedJsonData(config) {
    const {
        manifestPath,
        dataPath,
        manifestKey = 'files',
        filterFn = null,
        sortFn = null,
        page = 1,
        itemsPerPage = 10
    } = config;

    let filenames;

    // Load manifest
    try {
        filenames = await loadManifest(manifestPath, manifestKey);
    }
    catch(error) {
        console.error('Error loading manifest:', error);
        filenames = [];
    }

    if (filenames.length === 0) {
        return { items: [], total: 0, totalPages: 0 };
    }

    // Apply filter if provided
    if (filterFn && typeof filterFn === 'function') {
        filenames = filenames.filter(filterFn);
    }

    // Apply sort if provided
    if (sortFn && typeof sortFn === 'function') {
        filenames = filenames.sort(sortFn);
    }

    // Calculate pagination
    const total = filenames.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageFilenames = filenames.slice(startIndex, endIndex);

    // Load only the files for this page
    const items = await loadJsonFiles(pageFilenames, dataPath);

    return {
        items,
        total,
        totalPages,
        currentPage: page,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, total)
    };
}

// ============================================================================
// FILENAME PARSING UTILITIES
// ============================================================================

/**
 * Extract a date from a filename using a regex pattern
 * @param {string} filename - The filename to parse
 * @param {RegExp} pattern - Regex pattern with a capture group for the date (default: YYYY-MM-DD)
 * @returns {string|null} The extracted date string or null
 */
function extractDateFromFilename(filename, pattern = /(\d{4}-\d{2}-\d{2})/) {
    const match = filename.match(pattern);
    return match ? match[1] : null;
}

/**
 * Check if a date string represents a past date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is in the past
 */
function isDatePast(dateString) {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateString);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
}

/**
 * Check if a date string represents a future date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is in the future
 */
function isDateFuture(dateString) {
    if (!dateString) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateString);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Get a paginated slice of an array
 * @param {Array} array - The array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Array} The paginated slice
 */
function paginateArray(array, page, itemsPerPage) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return array.slice(startIndex, endIndex);
}

/**
 * Calculate total pages for pagination
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Number of items per page
 * @returns {number} Total number of pages
 */
function calculateTotalPages(totalItems, itemsPerPage) {
    return Math.ceil(totalItems / itemsPerPage);
}

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/**
 * Format a date string for display
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(dateString, options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date at noon to avoid timezone issues
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.toLocaleDateString('en-US', options);
}

/**
 * Get month abbreviation from date string
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Three-letter month abbreviation
 */
function getMonthAbbreviation(dateString) {
    const month = dateString.split('-').map(Number)[1];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return monthNames[month - 1];
}

/**
 * Get day of the month from a date string
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {number} Day of the month
 */
function getDayOfMonth(dateString) {
    return dateString.split('-').map(Number)[2];
}

// ============================================================================
// SITE CONTENT UTILITIES
// ============================================================================

/**
 * @typedef {Object} SiteInfo
 * @property {Object} church
 * @property {string} church.name
 * @property {string} church.shortName
 * @property {Object} address
 * @property {string} address.street
 * @property {string} address.city
 * @property {string} address.state
 * @property {string} address.zip
 * @property {string} address.fullAddress
 * @property {Object} contact
 * @property {string} contact.email
 * @property {string} contact.phone
 * @property {string} contact.phoneRaw
 * @property {Array<ServiceTime>} serviceTimes
 * @property {Object} social
 * @property {string} social.youtube
 * @property {Object} copyright
 * @property {number} copyright.year
 * @property {string} copyright.text
 * @property {string} mapsUrl
 */

/**
 * @typedef {Object} ServiceTime
 * @property {string} day
 * @property {string} time
 * @property {string} description
 */

// ============================================================================
// SHARED UI UTILITIES
// ============================================================================

/**
 * Show loading state in a container
 * @param {string} containerId - ID of the container element
 * @param {string} message - Loading message to display
 */
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

/**
 * Show error message in a container
 * @param {string} containerId - ID of the container element
 * @param {string} message - Error message to display
 * @param {string} helpText - Optional help text
 */
function showError(containerId, message, helpText = '') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-container">
                <p class="error-message">${message}</p>
                ${helpText ? `<p class="error-help">${helpText}</p>` : ''}
            </div>
        `;
    }
}

// ============================================================================
// FOOTER RENDERING
// ============================================================================

/**
 * Load and render footer content from site-info.json
 * @param {string} siteInfoPath - Path to site-info.json file (default: 'data/site-info.json')
 * @returns {Promise<void>}
 */
async function renderFooter(siteInfoPath = 'data/site-info.json') {
    try {
        /** @type {SiteInfo} */
        const siteInfo = await loadJsonFile(siteInfoPath);
        if (!siteInfo) {
            console.error('Failed to load site info');
            return;
        }

        // Find footer content container
        const footerContent = document.querySelector('.footer-content');
        if (!footerContent) {
            console.warn('Footer content container not found');
            return;
        }

        // Build service times HTML
        let serviceTimesHtml = '';
        if (siteInfo.serviceTimes && siteInfo.serviceTimes.length > 0) {
            serviceTimesHtml = siteInfo.serviceTimes.map(service => `
                <div class="service-time">
                    <span class="day">${service.day}${service.day ? ':' : ''}</span>
                    <span class="time">${service.time}</span>
                    <span class="description">${service.description}</span>
                </div>
            `).join('');
        }

        // Render footer sections
        footerContent.innerHTML = `
            <div class="footer-section">
                <h3>${siteInfo.church.name}</h3>
                <a href="${siteInfo.address.mapsUrl}" target="_blank" rel="noopener noreferrer">
                    <p>${siteInfo.address.street}</p>
                    <p>${siteInfo.address.city}, ${siteInfo.address.state} ${siteInfo.address.zip}</p>                
                </a>
            </div>
            <div class="footer-section">
                <h3>Service Times</h3>
                <div class="service-times">
                    ${serviceTimesHtml}
                </div>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <p>Email: <a href="mailto:${siteInfo.contact.email}">${siteInfo.contact.email}</a></p>
                <p>Phone: <a href="tel:${siteInfo.contact.phoneRaw}">${siteInfo.contact.phone}</a></p>
            </div>
        `;

        // Update copyright if footer-bottom exists
        const footerBottom = document.querySelector('.footer-bottom p');
        if (footerBottom && siteInfo.copyright) {
            footerBottom.textContent = `© ${siteInfo.copyright.year} ${siteInfo.copyright.text}`;
        }
    } catch (error) {
        console.error('Error rendering footer:', error);
    }
}
