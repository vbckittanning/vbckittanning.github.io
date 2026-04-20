// YouTube API Configuration
const YOUTUBE_CONFIG = {
    apiKey: 'AIzaSyDoEtuH5xxVXX1Cm-Ie1eSxRebUMWJEPp4',
    channelId: 'UCApnT3KVVVX_-Qpr3pjblKg', // Victory Baptist Church Kittanning
    maxResults: 10
};

// Fetch the current live stream for the channel, if any
async function fetchLiveStream() {
    const apiKey = YOUTUBE_CONFIG.apiKey;

    if (apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('YouTube API key not configured. Live stream check skipped.');
        return null;
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CONFIG.channelId}&eventType=live&type=video&maxResults=1&fields=items(id/videoId,snippet/title)&key=${apiKey}`
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (!data.items || data.items.length === 0) return null;

        return {
            id: data.items[0].id.videoId,
            title: data.items[0].snippet.title
        };
    } catch (error) {
        console.error('Error checking for live stream:', error);
        return null;
    }
}

// Log error and show user-facing message
function showFetchError(detail) {
    console.error('Error fetching YouTube videos:', detail);
    showError('sermonsGrid', 'Unable to load videos. Please try again later.');
}

// Fetch videos from YouTube channel
async function fetchYouTubeVideos() {
    const apiKey = YOUTUBE_CONFIG.apiKey;
    
    if (apiKey === 'YOUR_API_KEY_HERE') {
        console.error('YouTube API key not configured. Please add your API key to youtube-api.js');
        showError('sermonsGrid', 'YouTube API key not configured. Please see setup instructions.');
        return [];
    }

    try {
        const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CONFIG.channelId}&key=${apiKey}`
        );
        
        if (!channelResponse.ok) {
            showFetchError(`Channel API returned ${channelResponse.status}`);
            return [];
        }
        
        const /** @type {{items: Array<{contentDetails: {relatedPlaylists: {uploads: string}}}>}} */ channelData = await channelResponse.json();
        
        if (!channelData.items || channelData.items.length === 0) {
            showFetchError('Channel not found');
            return [];
        }
        
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        
        const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${YOUTUBE_CONFIG.maxResults}&key=${apiKey}`
        );
        
        if (!videosResponse.ok) {
            showFetchError(`Videos API returned ${videosResponse.status}`);
            return [];
        }
        
        const videosData = await videosResponse.json();
        
        return videosData.items.map(/** @param {{snippet: {resourceId: {videoId: string}, title: string, description: string, publishedAt: string, thumbnails: {medium: {url: string}}}}} item */ item => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.medium.url
        }));
        
    } catch (error) {
        showFetchError(error);
        return [];
    }
}

// Format date for display
function formatSermonDate(dateString) {
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
function createSermonCard(video, isLive = false) {
    const liveBadgeHtml = isLive ? `
        <div class="sermon-live-badge" role="status">
            <span class="live-dot" aria-hidden="true"></span>
            Live
        </div>
    ` : '';

    return `
        <div class="sermon-card${isLive ? ' sermon-card--live' : ''}">
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${video.id}" 
                    title="${video.title}${isLive ? ' (Live)' : ''}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
            <div class="sermon-info">
                ${liveBadgeHtml}
                <h3>${video.title}</h3>
                <p class="sermon-date">${formatSermonDate(video.publishedAt)}</p>
                <p class="sermon-description">${truncateDescription(video.description)}</p>
            </div>
        </div>
    `;
}

// Render videos to the page
function renderVideos(videos, liveStream = null) {
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

    const liveVideoId = liveStream ? liveStream.id : null;
    grid.innerHTML = videos.map(video =>
        createSermonCard(video, video.id === liveVideoId)
    ).join('');
}

// Initialize the sermons page
async function initializeSermonsPage() {
    // Check if we're on the sermons page
    const sermonsGrid = document.getElementById('sermonsGrid');
    if (!sermonsGrid) {
        return; // Not on sermons page
    }
    
    showLoading('sermonsGrid', 'Loading sermons...');
    
    try {
        const [videos, liveStream] = await Promise.all([
            fetchYouTubeVideos(),
            fetchLiveStream()
        ]);
        renderVideos(videos, liveStream);
    } catch (error) {
        console.error('Failed to initialize sermons page:', error);
        showError('sermonsGrid', 'An unexpected error occurred while loading sermons.', 'Check the browser console for more details.');
    }
}

// Initialize the live banner on the home page
async function initializeLiveBanner() {
    const banner = document.getElementById('liveBanner');
    if (!banner) return;

    const closeBtn = document.getElementById('liveBannerClose');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.hidden = true;
        });
    }

    try {
        const liveStream = await fetchLiveStream();

        if (liveStream) {
            const link = document.getElementById('liveBannerLink');
            if (link) {
                link.href = `https://www.youtube.com/watch?v=${liveStream.id}`;
                link.setAttribute('aria-label', `Watch live stream: ${liveStream.title}`);
            }
            banner.hidden = false;
        }
    } catch (error) {
        console.error('Error initializing live banner:', error);
    }
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeSermonsPage();
        initializeLiveBanner();
    });
} else {
    initializeSermonsPage();
    initializeLiveBanner();
}
