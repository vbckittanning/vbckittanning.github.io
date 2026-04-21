var a=(t,e,n)=>new Promise((r,i)=>{var l=s=>{try{c(n.next(s))}catch(d){i(d)}},o=s=>{try{c(n.throw(s))}catch(d){i(d)}},c=s=>s.done?r(s.value):Promise.resolve(s.value).then(l,o);c((n=n.apply(t,e)).next())});const YOUTUBE_CONFIG={apiKey:"AIzaSyDoEtuH5xxVXX1Cm-Ie1eSxRebUMWJEPp4",channelId:"UCApnT3KVVVX_-Qpr3pjblKg",maxResults:10};function fetchLiveStream(){return a(this,null,function*(){const t=YOUTUBE_CONFIG.apiKey;if(t==="YOUR_API_KEY_HERE")return console.warn("YouTube API key not configured. Live stream check skipped."),null;try{const e=yield fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${YOUTUBE_CONFIG.channelId}&eventType=live&type=video&maxResults=1&fields=items(id/videoId,snippet/title)&key=${t}`);if(!e.ok)return null;const n=yield e.json();return!n.items||n.items.length===0?null:{id:n.items[0].id.videoId,title:n.items[0].snippet.title}}catch(e){return console.error("Error checking for live stream:",e),null}})}function showFetchError(t){console.error("Error fetching YouTube videos:",t),showError("sermonsGrid","Unable to load videos. Please try again later.")}function fetchYouTubeVideos(){return a(this,null,function*(){const t=YOUTUBE_CONFIG.apiKey;if(t==="YOUR_API_KEY_HERE")return console.error("YouTube API key not configured. Please add your API key to youtube-api.js"),showError("sermonsGrid","YouTube API key not configured. Please see setup instructions."),[];try{const e=yield fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CONFIG.channelId}&key=${t}`);if(!e.ok)return showFetchError(`Channel API returned ${e.status}`),[];const n=yield e.json();if(!n.items||n.items.length===0)return showFetchError("Channel not found"),[];const r=n.items[0].contentDetails.relatedPlaylists.uploads,i=yield fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${r}&maxResults=${YOUTUBE_CONFIG.maxResults}&key=${t}`);return i.ok?(yield i.json()).items.map(o=>({id:o.snippet.resourceId.videoId,title:o.snippet.title,description:o.snippet.description,publishedAt:o.snippet.publishedAt,thumbnail:o.snippet.thumbnails.medium.url})):(showFetchError(`Videos API returned ${i.status}`),[])}catch(e){return showFetchError(e),[]}})}function escapeHtml(t){const e=document.createElement("div");return e.textContent=String(t),e.innerHTML}function formatSermonDate(t){const e=new Date(t),n={year:"numeric",month:"long",day:"numeric"};return e.toLocaleDateString("en-US",n)}function truncateDescription(t,e=150){return t.length<=e?t:t.substring(0,e).trim()+"..."}function createSermonCard(t,e=!1){const n=escapeHtml(t.id),r=escapeHtml(t.title),i=escapeHtml(truncateDescription(t.description)),l=formatSermonDate(t.publishedAt);return`
        <div class="sermon-card${e?" sermon-card--live":""}">
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${n}" 
                    title="${r}${e?" (Live)":""}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
            <div class="sermon-info">
                ${e?`
        <div class="sermon-live-badge" role="status">
            <span class="live-dot" aria-hidden="true"></span>
            Live
        </div>
    `:""}
                <h3>${r}</h3>
                <p class="sermon-date">${l}</p>
                <p class="sermon-description">${i}</p>
            </div>
        </div>
    `}function renderVideos(t,e=null){const n=document.getElementById("sermonsGrid");if(!n){console.error("Sermons grid element not found");return}if(t.length===0){n.innerHTML=`
            <div class="no-videos-container">
                <p>No sermons available at this time.</p>
                <p>Please check back later or visit our <a href="https://www.youtube.com/@victorybaptistchurchkittan6993/streams" target="_blank">YouTube channel</a>.</p>
            </div>
        `;return}const r=e?e.id:null;n.innerHTML=t.map(i=>createSermonCard(i,i.id===r)).join("")}function initializeSermonsPage(){return a(this,null,function*(){if(document.getElementById("sermonsGrid")){showLoading("sermonsGrid","Loading sermons...");try{const[e,n]=yield Promise.all([fetchYouTubeVideos(),fetchLiveStream()]);renderVideos(e,n)}catch(e){console.error("Failed to initialize sermons page:",e),showError("sermonsGrid","An unexpected error occurred while loading sermons.","Check the browser console for more details.")}}})}function initializeLiveBanner(){return a(this,null,function*(){const t=document.getElementById("liveBanner");if(!t)return;const e=document.getElementById("liveBannerClose");e&&e.addEventListener("click",()=>{t.hidden=!0});try{const n=yield fetchLiveStream();if(n){const r=document.getElementById("liveBannerLink");r&&(r.href=`https://www.youtube.com/watch?v=${n.id}`,r.setAttribute("aria-label",`Watch live stream: ${n.title}`)),t.hidden=!1}}catch(n){console.error("Error initializing live banner:",n)}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{initializeSermonsPage(),initializeLiveBanner()}):(initializeSermonsPage(),initializeLiveBanner());
