var D=(t,e,a)=>new Promise((n,o)=>{var s=r=>{try{i(a.next(r))}catch(l){o(l)}},d=r=>{try{i(a.throw(r))}catch(l){o(l)}},i=r=>r.done?n(r.value):Promise.resolve(r.value).then(s,d);i((a=a.apply(t,e)).next())});const pad=t=>String(t).padStart(2,"0");function parseEventDateTime(t,e,a){const[n,o,s]=t.split("-").map(Number),d=`${n}-${pad(o)}-${pad(s)}`,i=a||t,[r,l,g]=i.split("-").map(Number),f=`${r}-${pad(l)}-${pad(g)}`;if(!e){const $=new Date(`${d}T00:00:00`),u=new Date(`${f}T00:00:00`);return u.setDate(u.getDate()+1),{start:$,end:u,allDay:!0}}const m=$=>{const u=$.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);if(!u)return null;let v=parseInt(u[1]);const P=parseInt(u[2]),E=u[3].toUpperCase();return E==="PM"&&v!==12&&(v+=12),E==="AM"&&v===12&&(v=0),{hours:v,minutes:P}},p=e.match(/(.+?)\s*-\s*(.+)/);let c,h;p?(c=m(p[1]),h=m(p[2])):(c=m(e),c&&(h={hours:c.hours+1,minutes:c.minutes})),c||(c={hours:12,minutes:0},h={hours:13,minutes:0}),h||(h={hours:c.hours+1,minutes:c.minutes});const T=`${pad(c.hours)}:${pad(c.minutes)}:00`,w=`${pad(h.hours)}:${pad(h.minutes)}:00`,S=new Date(`${d}T${T}`),y=new Date(`${f}T${w}`);return{start:S,end:y,allDay:!1}}function formatICSDate(t){return`${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}T${pad(t.getHours())}${pad(t.getMinutes())}${pad(t.getSeconds())}`}function formatICSDateOnly(t){return`${t.getFullYear()}${pad(t.getMonth()+1)}${pad(t.getDate())}`}function generateGoogleCalendarUrl(t){const{start:e,end:a,allDay:n}=parseEventDateTime(t.date,t.time,t.endDate),o=new URLSearchParams({action:"TEMPLATE",text:t.title,dates:n?`${formatICSDateOnly(e)}/${formatICSDateOnly(a)}`:`${formatICSDate(e)}/${formatICSDate(a)}`,details:t.description||"",location:t.location||""});return n||o.set("ctz","America/New_York"),`https://calendar.google.com/calendar/render?${o.toString()}`}function generateOutlookCalendarUrl(t){const{start:e,end:a,allDay:n}=parseEventDateTime(t.date,t.time,t.endDate),o=i=>{const r=i.getFullYear(),l=String(i.getMonth()+1).padStart(2,"0"),g=String(i.getDate()).padStart(2,"0"),f=String(i.getHours()).padStart(2,"0"),m=String(i.getMinutes()).padStart(2,"0"),p=String(i.getSeconds()).padStart(2,"0");return`${r}-${l}-${g}T${f}:${m}:${p}`},s=i=>{const r=i.getFullYear(),l=String(i.getMonth()+1).padStart(2,"0"),g=String(i.getDate()).padStart(2,"0");return`${r}-${l}-${g}`};return`https://outlook.live.com/calendar/0/deeplink/compose?${new URLSearchParams({path:"/calendar/action/compose",rru:"addevent",subject:t.title,startdt:n?s(e):o(e),enddt:n?s(a):o(a),body:t.description||"",location:t.location||"",allday:n?"true":"false"}).toString()}`}function generateICSFile(t){const{start:e,end:a,allDay:n}=parseEventDateTime(t.date,t.time,t.endDate),o=d=>d?d.replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n"):"",s=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Victory Baptist Church//Events//EN"];return n||s.push("BEGIN:VTIMEZONE","TZID:America/New_York","BEGIN:DAYLIGHT","TZOFFSETFROM:-0500","TZOFFSETTO:-0400","TZNAME:EDT","DTSTART:19700308T020000","RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU","END:DAYLIGHT","BEGIN:STANDARD","TZOFFSETFROM:-0400","TZOFFSETTO:-0500","TZNAME:EST","DTSTART:19701101T020000","RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU","END:STANDARD","END:VTIMEZONE"),s.push("BEGIN:VEVENT",`UID:${t.id||Date.now()}@victorybaptistchurch.com`,`DTSTAMP:${formatICSDate(new Date)}`),n?s.push(`DTSTART;VALUE=DATE:${formatICSDateOnly(e)}`,`DTEND;VALUE=DATE:${formatICSDateOnly(a)}`):s.push(`DTSTART;TZID=America/New_York:${formatICSDate(e)}`,`DTEND;TZID=America/New_York:${formatICSDate(a)}`),s.push(`SUMMARY:${o(t.title)}`,`DESCRIPTION:${o(t.description||"")}`),t.location&&s.push(`LOCATION:${o(t.location)}`),s.push("STATUS:CONFIRMED","END:VEVENT","END:VCALENDAR"),s.join(`\r
`)}function downloadICSFile(t){const e=generateICSFile(t),a=new Blob([e],{type:"text/calendar;charset=utf-8"}),n=URL.createObjectURL(a),o=document.createElement("a");o.href=n,o.download=`${t.title.replace(/[^a-z0-9]/gi,"_")}.ics`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(n)}function generateCalendarIconsHtml(t){const e=JSON.stringify(t).replace(/'/g,"&#39;");return`
        <a href="#" data-event='${e}' class="calendar-icon google-calendar" title="Add to Google Calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 4 3.01 4.9 3.01 6L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5zm7 6H7v-2h5v2zm4 0h-2v-2h2v2zm0 4h-2v-2h2v2zm-4 0H7v-2h5v2z" fill="#4285F4"/>
                <path d="M12 14H7v-2h5v2z" fill="#EA4335"/>
                <path d="M16 14h-2v-2h2v2z" fill="#FBBC04"/>
                <path d="M16 18h-2v-2h2v2z" fill="#34A853"/>
                <path d="M12 18H7v-2h5v2z" fill="#4285F4"/>
            </svg>
        </a>
        <a href="#" data-event='${e}' class="calendar-icon outlook-calendar" title="Add to Outlook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M24 12.5v7.1c0 .8-.7 1.4-1.5 1.4H13v-9h11v.5z" fill="#0078D4"/>
                <path d="M13 3v9H2V4.5C2 3.7 2.7 3 3.5 3H13z" fill="#0078D4"/>
                <path d="M13 12H2v7.5c0 .8.7 1.5 1.5 1.5H13v-9z" fill="#0364B8"/>
                <path d="M24 4.5V12H13V3h9.5c.8 0 1.5.7 1.5 1.5z" fill="#28A8EA"/>
                <path d="M9.5 7C7.6 7 6 8.6 6 10.5S7.6 14 9.5 14s3.5-1.6 3.5-3.5S11.4 7 9.5 7zm0 5.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="white"/>
            </svg>
        </a>
        <a href="#" data-event='${e}' class="calendar-icon apple-calendar" title="Add to Apple Calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
        </a>
    `}function attachCalendarListeners(){document.querySelectorAll(".google-calendar").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=JSON.parse(t.getAttribute("data-event")),n=generateGoogleCalendarUrl(a);window.open(n,"_blank")})}),document.querySelectorAll(".outlook-calendar").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=JSON.parse(t.getAttribute("data-event")),n=generateOutlookCalendarUrl(a);window.open(n,"_blank")})}),document.querySelectorAll(".apple-calendar").forEach(t=>{t.addEventListener("click",e=>{e.preventDefault();const a=JSON.parse(t.getAttribute("data-event"));downloadICSFile(a)})})}const EVENTS_CONFIG={eventsPerPage:5,dataPath:"data/events/",manifestPath:"data/events/manifest.json"};let currentPageEvents=[],currentPage=1,totalFilteredFiles=0,showPastEvents=!1;function initializeViewMode(){showPastEvents=getQueryParam("view")==="past";const e=getQueryParam("page");currentPage=e?parseInt(e,10):1,currentPage<1&&(currentPage=1),updatePageTitle()}function updatePageTitle(){const t=document.querySelector(".events-hero .hero-title"),e=document.querySelector(".events-hero .hero-subtitle");t&&(t.textContent=showPastEvents?"Past Events":"Upcoming Events"),e&&(e.textContent=showPastEvents?"Look back at our previous events and activities":"Join us for upcoming services, studies, and fellowship")}function extractEventDate(t){return extractDateFromFilename(t,/event-(\d{4}-\d{2}-\d{2})/)}function isEventFilePast(t){const e=extractEventDate(t);return e?isDatePast(e):(console.warn(`Could not extract date from filename: ${t}`),!1)}function filterEventFile(t){const e=isEventFilePast(t);return showPastEvents?e:!e}function sortEventFiles(t,e){const a=new Date(extractEventDate(t)),n=new Date(extractEventDate(e));return showPastEvents?n-a:a-n}function loadPageEvents(){return D(this,null,function*(){const t=yield loadPaginatedJsonData({manifestPath:EVENTS_CONFIG.manifestPath,dataPath:EVENTS_CONFIG.dataPath,manifestKey:"events",filterFn:filterEventFile,sortFn:sortEventFiles,page:currentPage,itemsPerPage:EVENTS_CONFIG.eventsPerPage});return totalFilteredFiles=t.total,t.items})}function createEventCard(t){const e=getCategoryClass(t.category),a=getCategoryName(t.category),o=`<a href="${`event-details.html?id=${encodeURIComponent(t.id)}`}" class="event-title-link"><h3 class="event-title">${t.title}</h3></a>`;return`
        <div class="event-card">
            <div class="event-date-badge">
                <div class="event-month">${getMonthAbbreviation(t.date)}</div>
                <div class="event-day">${getDayOfMonth(t.date)}</div>
            </div>
            <div class="event-content">
                <div class="event-header">
                    ${o}
                    ${t.category?`<span class="event-category ${e}">${a}</span>`:""}
                </div>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${t.endDate?formatDateRange(t.date,t.endDate):formatDate(t.date)}</span>
                    </div>
                    ${t.time?`
                    <div class="event-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>${t.time}</span>
                    </div>
                    `:""}
                    ${t.location?`
                    <div class="event-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.location)}" target="_blank" class="event-location-link">${t.location}</a>
                    </div>
                    `:""}
                </div>
                <p class="event-description">${t.description}</p>
                ${t.contactName||t.contactEmail||t.contactPhone?`
                <div class="event-contact">
                    <strong>Contact:</strong> 
                    ${t.contactName?t.contactName:""}
                    ${t.contactEmail?`<a href="mailto:${t.contactEmail}">${t.contactEmail}</a>`:""}
                    ${t.contactPhone?`<a href="tel:${t.contactPhone.replace(/\D/g,"")}">${t.contactPhone}</a>`:""}
                </div>
                `:""}
                <div class="event-calendar-section">
                    <span class="calendar-label">Add to Calendar:</span>
                    <div class="calendar-icons">
                        ${generateCalendarIconsHtml(t)}
                    </div>
                </div>
            </div>
        </div>
    `}function getTotalPages(){return calculateTotalPages(totalFilteredFiles,EVENTS_CONFIG.eventsPerPage)}function buildPageUrl(t){const e=new URL(window.location);return t>1?e.searchParams.set("page",t):e.searchParams.delete("page"),showPastEvents&&e.searchParams.set("view","past"),e.toString()}function renderPagination(t){const e=document.getElementById("pagination");if(!e||t<=1){e&&(e.innerHTML="");return}let a='<div class="pagination-controls">';currentPage>1&&(a+=`<a href="${buildPageUrl(currentPage-1)}" class="pagination-btn">Previous</a>`),a+='<div class="pagination-numbers">';for(let n=1;n<=t;n++)if(n===1||n===t||n>=currentPage-2&&n<=currentPage+2){const o=n===currentPage?"active":"";n===currentPage?a+=`<span class="pagination-number ${o}">${n}</span>`:a+=`<a href="${buildPageUrl(n)}" class="pagination-number ${o}">${n}</a>`}else(n===currentPage-3||n===currentPage+3)&&(a+='<span class="pagination-ellipsis">...</span>');a+="</div>",currentPage<t&&(a+=`<a href="${buildPageUrl(currentPage+1)}" class="pagination-btn">Next</a>`),a+="</div>",e.innerHTML=a}function renderEvents(){const t=document.getElementById("eventsGrid"),e=document.getElementById("viewToggle");if(!t){console.error("Events grid element not found");return}if(e){const o=showPastEvents?"View Upcoming Events":"View Past Events",s=showPastEvents?"events.html":"events.html?view=past";e.innerHTML=`<a href="${s}" class="view-toggle-link">${o}</a>`}if(totalFilteredFiles===0){t.innerHTML=`
            <div class="no-events-container">
                <p>No ${showPastEvents?"past":"upcoming"} events at this time.</p>
                ${showPastEvents?"":"<p>Check back soon for new events!</p>"}
            </div>
        `,renderPagination(0);return}const a=getTotalPages();t.innerHTML=currentPageEvents.map(o=>createEventCard(o)).join(""),renderPagination(a),attachCalendarListeners();const n=document.getElementById("resultsInfo");if(n){const o=(currentPage-1)*EVENTS_CONFIG.eventsPerPage+1,s=Math.min(currentPage*EVENTS_CONFIG.eventsPerPage,totalFilteredFiles);n.textContent=`Showing ${o}-${s} of ${totalFilteredFiles} events`}}function initializeEventsPage(){return D(this,null,function*(){if(document.getElementById("eventsGrid")){initializeViewMode(),showLoading("eventsGrid","Loading events...");try{currentPageEvents=yield loadPageEvents(),renderEvents()}catch(e){console.error("Failed to initialize events page:",e),showError("eventsGrid","An unexpected error occurred while loading events.")}}})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",initializeEventsPage):initializeEventsPage().then(()=>console.log("Event loading complete"));
