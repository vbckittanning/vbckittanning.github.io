/**
 * Lightbox Photo Gallery
 * Mobile-friendly photo viewer with keyboard navigation
 */

class Lightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightbox-image');
        this.lightboxCaption = document.getElementById('lightbox-caption');
        this.lightboxCounter = document.getElementById('lightbox-counter');
        this.closeBtn = this.lightbox.querySelector('.lightbox-close');
        this.prevBtn = this.lightbox.querySelector('.lightbox-prev');
        this.nextBtn = this.lightbox.querySelector('.lightbox-next');
        
        this.photos = [];
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        // Get all photo items
        const photoItems = document.querySelectorAll('.photo-item');
        
        photoItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                this.photos.push({
                    src: img.src,
                    alt: img.alt || `Photo ${index + 1}`
                });
                
                // Add click event to open lightbox
                item.addEventListener('click', () => this.open(index));
                
                // Add keyboard support for photo items
                item.setAttribute('tabindex', '0');
                item.setAttribute('role', 'button');
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.open(index);
                    }
                });
            }
        });
        
        // Event listeners for lightbox controls
        this.closeBtn.addEventListener('click', () => this.close());
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Close on background click
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.close();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.close();
                    break;
                case 'ArrowLeft':
                    this.prev();
                    break;
                case 'ArrowRight':
                    this.next();
                    break;
            }
        });
        
        // Touch support for mobile swipe
        this.addTouchSupport();
    }
    
    open(index) {
        this.currentIndex = index;
        this.updateImage();
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Focus on close button for accessibility
        setTimeout(() => {
            this.closeBtn.focus();
        }, 100);
    }
    
    close() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Return focus to the photo item that was clicked
        const photoItems = document.querySelectorAll('.photo-item');
        if (photoItems[this.currentIndex]) {
            photoItems[this.currentIndex].focus();
        }
    }
    
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length;
        this.updateImage();
    }
    
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.photos.length;
        this.updateImage();
    }
    
    updateImage() {
        const photo = this.photos[this.currentIndex];
        
        // Fade out
        this.lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            this.lightboxImage.src = photo.src;
            this.lightboxImage.alt = photo.alt;
            this.lightboxCaption.textContent = photo.alt;
            this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`;
            
            // Fade in
            this.lightboxImage.style.opacity = '1';
        }, 150);
    }
    
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        this.lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next image
                    this.next();
                } else {
                    // Swipe right - previous image
                    this.prev();
                }
            }
        };
    }
}

// Initialize lightbox when DOM is ready
// Only auto-initialize if NOT on an event detail page (which loads photos dynamically)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('lightbox') && !window.location.pathname.includes('/events/')) {
            new Lightbox();
        }
    });
} else {
    if (document.getElementById('lightbox') && !window.location.pathname.includes('/events/')) {
        new Lightbox();
    }
}

// Expose Lightbox class globally for dynamic initialization
window.Lightbox = Lightbox;
