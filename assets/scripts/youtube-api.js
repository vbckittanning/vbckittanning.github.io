// YouTube API Configuration
// IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual YouTube Data API v3 key
const YOUTUBE_CONFIG = {
    apiKey: 'YOUR_API_KEY_HERE',
    channelId: 'UCvictorybaptistchurchkittan6993', // Extracted from your channel URL
    maxResults: 10
};

// Fetch videos from YouTube channel
async function fetchYouTubeVideos() {
    const apiKey = YOUTUBE_CONFIG.apiKey;
    
    if (apiKey === 'YOUR_API_KEY_HERE') {
        console.error('YouTube API key not configured. Please add your API key to youtube-api.js');
        showError('YouTube API key not configured. Please see setup instructions.');
        return [];
    }

    try {
        // First, get the uploads playlist ID
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CONFIG.channelId}&key=${apiKey}`
        );
        
        if (!channelResponse.ok) {
            throw new Error(`Channel API error: ${channelResponse.status}`);
        }
        
        const channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('Channel not found');
        }
        
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        
        // Fetch videos from the uploads playlist
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${YOUTUBE_CONFIG.maxResults}&key=${apiKey}`
        );
        
        if (!videosResponse.ok) {
            throw new Error(`Videos API error: ${videosResponse.status}`);
        }
        
        const videosData = await videosResponse.json();
        
        return videosData.items.map(item => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.medium.url
        }));
        
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        showError('Unable to load videos. Please try again later.');
        return [];
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Truncate description to specified length
function truncateDescription(description, maxLength = 150) {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
}

// Create HTML for a sermon card
function createSermonCard(video) {
    return `
        <div class="sermon-card">
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${video.id}" 
                    title="${video.title}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
            <div class="sermon-info">
                <h3>${video.title}</h3>
                <p class="sermon-date">${formatDate(video.publishedAt)}</p>
                <p class="sermon-description">${truncateDescription(video.description)}</p>
            </div>
        </div>
    `;
}

// Show loading state
function showLoading() {
    const grid = document.getElementById('sermonsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading sermons...</p>
            </div>
        `;
    }
}

// Show error message
function showError(message) {
    const grid = document.getElementById('sermonsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-container">
                <p class="error-message">${message}</p>
                <p class="error-help">Check the browser console for more details.</p>
            </div>
        `;
    }
}

// Render videos to the page
function renderVideos(videos) {
    const grid = document.getElementById('sermonsGrid');
    
    if (!grid) {
        console.error('Sermons grid element not found');
        return;
    }
    
    if (videos.length === 0) {
        grid.innerHTML = `
            <div class="no-videos-container">
                <p>No sermons available at this time.</p>
                <p>Please check back later or visit our <a href="https://www.youtube.com/@victorybaptistchurchkittan6993/streams" target="_blank">YouTube channel</a>.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = videos.map(video => createSermonCard(video)).join('');
}

// Initialize the sermons page
async function initializeSermonsPage() {
    // Check if we're on the sermons page
    const sermonsGrid = document.getElementById('sermonsGrid');
    if (!sermonsGrid) {
        return; // Not on sermons page
    }
    
    showLoading();
    
    try {
        const videos = await fetchYouTubeVideos();
        renderVideos(videos);
    } catch (error) {
        console.error('Failed to initialize sermons page:', error);
        showError('An unexpected error occurred while loading sermons.');
    }
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSermonsPage);
} else {
    initializeSermonsPage();
}
