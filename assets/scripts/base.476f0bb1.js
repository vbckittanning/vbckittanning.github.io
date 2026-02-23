var g=(t,e,n)=>new Promise((s,o)=>{var c=a=>{try{r(n.next(a))}catch(l){o(l)}},u=a=>{try{r(n.throw(a))}catch(l){o(l)}},r=a=>a.done?s(a.value):Promise.resolve(a.value).then(c,u);r((n=n.apply(t,e)).next())});function getQueryParam(t){return new URLSearchParams(window.location.search).get(t)}function loadManifest(t,e="files"){return g(this,null,function*(){return(yield(yield fetch(t)).json())[e]})}function loadJsonFile(t){return g(this,null,function*(){try{const e=yield fetch(t);return e.ok?yield e.json():(console.warn(`Failed to load ${t}: ${e.status}`),null)}catch(e){return console.error(`Error loading ${t}:`,e),null}})}function loadJsonFiles(t,e){return g(this,null,function*(){const n=t.map(o=>loadJsonFile(`${e}${o}`));return(yield Promise.all(n)).filter(o=>o!==null)})}function loadPaginatedJsonData(t){return g(this,null,function*(){const{manifestPath:e,dataPath:n,manifestKey:s="files",filterFn:o=null,sortFn:c=null,page:u=1,itemsPerPage:r=10}=t;let a;try{a=yield loadManifest(e,s)}catch(L){console.error("Error loading manifest:",L),a=[]}if(a.length===0)return{items:[],total:0,totalPages:0};o&&typeof o=="function"&&(a=a.filter(o)),c&&typeof c=="function"&&(a=a.sort(c));const l=a.length,d=Math.ceil(l/r),m=(u-1)*r,f=m+r,v=a.slice(m,f);return{items:yield loadJsonFiles(v,n),total:l,totalPages:d,currentPage:u,startIndex:m+1,endIndex:Math.min(f,l)}})}function extractDateFromFilename(t,e=/(\d{4}-\d{2}-\d{2})/){const n=t.match(e);return n?n[1]:null}function isDatePast(t){if(!t)return!1;const e=new Date;e.setHours(0,0,0,0);const n=new Date(t);return n.setHours(0,0,0,0),n<e}function formatEventDate(t){return formatDate(t,{year:"numeric",month:"long",day:"numeric"})}function getCategoryClass(t){return{service:"category-service",study:"category-study",fellowship:"category-fellowship",outreach:"category-outreach",youth:"category-youth",special:"category-special"}[t]||"category-service"}function getCategoryName(t){return{service:"Worship Service",study:"Bible Study",fellowship:"Fellowship",outreach:"Outreach",youth:"Youth",special:"Special Event"}[t]||"Event"}function calculateTotalPages(t,e){return Math.ceil(t/e)}function formatDate(t,e={weekday:"long",year:"numeric",month:"long",day:"numeric"}){const[n,s,o]=t.split("-").map(Number);return new Date(n,s-1,o,12,0,0).toLocaleDateString("en-US",e)}function formatDateRange(t,e){if(!e||t===e)return formatDate(t);const[n,s,o]=t.split("-").map(Number),[c,u,r]=e.split("-").map(Number),a=new Date(n,s-1,o,12,0,0),l=new Date(c,u-1,r,12,0,0),d=a.toLocaleDateString("en-US",{month:"long"}),m=l.toLocaleDateString("en-US",{month:"long"});return n===c&&s===u?`${d} ${o}-${r}, ${n}`:n===c?`${d} ${o} - ${m} ${r}, ${n}`:`${d} ${o}, ${n} - ${m} ${r}, ${c}`}function getMonthAbbreviation(t){const e=t.split("-").map(Number)[1];return["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][e-1]}function getDayOfMonth(t){return t.split("-").map(Number)[2]}function showLoading(t,e="Loading..."){const n=document.getElementById(t);n&&(n.innerHTML=`
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${e}</p>
            </div>
        `)}function showError(t,e,n=""){const s=document.getElementById(t);s&&(s.innerHTML=`
            <div class="error-container">
                <p class="error-message">${e}</p>
                ${n?`<p class="error-help">${n}</p>`:""}
            </div>
        `)}function renderFooter(t="data/site-info.json"){return g(this,null,function*(){try{const e=yield loadJsonFile(t);if(!e){console.error("Failed to load site info");return}const n=document.querySelector(".footer-content");if(!n){console.warn("Footer content container not found");return}let s="";e.serviceTimes&&e.serviceTimes.length>0&&(s=e.serviceTimes.map(c=>`
                <div class="service-time">
                    <span class="day">${c.day}${c.day?":":""}</span>
                    <span class="time">${c.time}</span>
                    <span class="description">${c.description}</span>
                </div>
            `).join("")),n.innerHTML=`
            <div class="footer-section">
                <h3>${e.church.name}</h3>
                <a href="${e.address.mapsUrl}" target="_blank" rel="noopener noreferrer">
                    <p>${e.address.street}</p>
                    <p>${e.address.city}, ${e.address.state} ${e.address.zip}</p>                
                </a>
            </div>
            <div class="footer-section">
                <h3>Service Times</h3>
                <div class="service-times">
                    ${s}
                </div>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <p>Email: <a href="mailto:${e.contact.email}">${e.contact.email}</a></p>
                <p>Phone: <a href="tel:${e.contact.phoneRaw}">${e.contact.phone}</a></p>
            </div>
        `;const o=document.querySelector(".footer-bottom p");o&&e.copyright&&(o.textContent=`\xA9 ${e.copyright.year} ${e.copyright.text}`)}catch(e){console.error("Error rendering footer:",e)}})}document.addEventListener("DOMContentLoaded",function(){const t=document.getElementById("hamburger"),e=document.getElementById("nav"),n=document.querySelectorAll(".nav-list a");t.addEventListener("click",function(){t.classList.toggle("active"),e.classList.toggle("active")}),n.forEach(i=>{i.addEventListener("click",function(){t.classList.remove("active"),e.classList.remove("active")})}),document.addEventListener("click",function(i){const h=e.contains(i.target),y=t.contains(i.target);!h&&!y&&e.classList.contains("active")&&(t.classList.remove("active"),e.classList.remove("active"))});const s=document.querySelectorAll(".carousel-item"),o=document.querySelectorAll(".indicator"),c=document.getElementById("prevBtn"),u=document.getElementById("nextBtn");let r=0,a;function l(i){s.forEach((h,y)=>{h.classList.remove("active"),o[y].classList.remove("active")}),i>=s.length?r=0:i<0?r=s.length-1:r=i,s[r].classList.add("active"),o[r].classList.add("active")}function d(){l(r+1)}function m(){l(r-1)}function f(){v(),a=setInterval(d,5e3)}function v(){a&&(clearInterval(a),a=null)}c&&c.addEventListener("click",function(){v(),m(),f()}),u&&u.addEventListener("click",function(){v(),d(),f()}),o.forEach((i,h)=>{i.addEventListener("click",function(){v(),l(h),f()})});const p=document.querySelector(".carousel");if(p){let y=function(){h<i-50&&d(),h>i+50&&m()};var L=y;p.addEventListener("mouseenter",v),p.addEventListener("mouseleave",f),p.addEventListener("touchstart",v),p.addEventListener("touchend",function(){setTimeout(f,3e3)}),f();let i=0,h=0;p.addEventListener("touchstart",function($){i=$.changedTouches[0].screenX}),p.addEventListener("touchend",function($){h=$.changedTouches[0].screenX,y()})}});
