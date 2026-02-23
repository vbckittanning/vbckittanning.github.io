var l=(e,t,n)=>new Promise((i,s)=>{var d=r=>{try{a(n.next(r))}catch(c){s(c)}},o=r=>{try{a(n.throw(r))}catch(c){s(c)}},a=r=>r.done?i(r.value):Promise.resolve(r.value).then(d,o);a((n=n.apply(e,t)).next())});const YOUTUBE_CONFIG={apiKey:"AIzaSyDoEtuH5xxVXX1Cm-Ie1eSxRebUMWJEPp4",channelId:"UCApnT3KVVVX_-Qpr3pjblKg",maxResults:10};function showFetchError(e){console.error("Error fetching YouTube videos:",e),showError("sermonsGrid","Unable to load videos. Please try again later.")}function fetchYouTubeVideos(){return l(this,null,function*(){const e=YOUTUBE_CONFIG.apiKey;if(e==="YOUR_API_KEY_HERE")return console.error("YouTube API key not configured. Please add your API key to youtube-api.js"),showError("sermonsGrid","YouTube API key not configured. Please see setup instructions."),[];try{const t=yield fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${YOUTUBE_CONFIG.channelId}&key=${e}`);if(!t.ok)return showFetchError(`Channel API returned ${t.status}`),[];const n=yield t.json();if(!n.items||n.items.length===0)return showFetchError("Channel not found"),[];const i=n.items[0].contentDetails.relatedPlaylists.uploads,s=yield fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${i}&maxResults=${YOUTUBE_CONFIG.maxResults}&key=${e}`);return s.ok?(yield s.json()).items.map(o=>({id:o.snippet.resourceId.videoId,title:o.snippet.title,description:o.snippet.description,publishedAt:o.snippet.publishedAt,thumbnail:o.snippet.thumbnails.medium.url})):(showFetchError(`Videos API returned ${s.status}`),[])}catch(t){return showFetchError(t),[]}})}function formatSermonDate(e){const t=new Date(e),n={year:"numeric",month:"long",day:"numeric"};return t.toLocaleDateString("en-US",n)}function truncateDescription(e,t=150){return e.length<=t?e:e.substring(0,t).trim()+"..."}function createSermonCard(e){return`
        <div class="sermon-card">
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${e.id}" 
                    title="${e.title}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="lazy">
                </iframe>
            </div>
            <div class="sermon-info">
                <h3>${e.title}</h3>
                <p class="sermon-date">${formatSermonDate(e.publishedAt)}</p>
                <p class="sermon-description">${truncateDescription(e.description)}</p>
            </div>
        </div>
    `}function renderVideos(e){const t=document.getElementById("sermonsGrid");if(!t){console.error("Sermons grid element not found");return}if(e.length===0){t.innerHTML=`
            <div class="no-videos-container">
                <p>No sermons available at this time.</p>
                <p>Please check back later or visit our <a href="https://www.youtube.com/@victorybaptistchurchkittan6993/streams" target="_blank">YouTube channel</a>.</p>
            </div>
        `;return}t.innerHTML=e.map(n=>createSermonCard(n)).join("")}function initializeSermonsPage(){return l(this,null,function*(){if(document.getElementById("sermonsGrid")){showLoading("sermonsGrid","Loading sermons...");try{const t=yield fetchYouTubeVideos();renderVideos(t)}catch(t){console.error("Failed to initialize sermons page:",t),showError("sermonsGrid","An unexpected error occurred while loading sermons.","Check the browser console for more details.")}}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",initializeSermonsPage):initializeSermonsPage().then(()=>console.log("Sermons page initialization complete"));
