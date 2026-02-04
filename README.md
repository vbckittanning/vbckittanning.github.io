# Victory Baptist Church Kittanning - Website

A modern, responsive landing page for Victory Baptist Church Kittanning.

## Features

- **Responsive Design**: Mobile-first design that adapts beautifully to tablets and desktops
- **Mobile Navigation**: Hamburger menu for mobile devices that expands to full navigation on desktop
- **Hero Section**: Eye-catching hero section with church background imagery
- **Event Carousel**: Responsive carousel component for displaying current events and announcements
- **Modern UI**: Clean, professional design with smooth animations and transitions

## Getting Started

Simply open `index.html` in your web browser to view the website.

## Customization

### Adding Your Church Photo

Replace the hero section background in `styles.css` (line 149) with your actual church photo:

```css
.hero {
    background-image: url('path-to-your-church-photo.jpg');
}
```

### Updating Carousel Content

Edit the carousel items in `index.html` (starting at line 38) to add your own events and announcements. Each carousel item supports:
- Custom icons (SVG)
- Event title
- Time/date information
- Description text
- Call-to-action button

### Modifying Colors

Update the color scheme in `styles.css` by changing the CSS variables (lines 9-16):

```css
:root {
    --secondary-color: #c41e3a; /* Red accent color */
    --primary-color: #2c3e50; /* Dark blue/gray */
    --text-dark: #333;
    --text-light: #fff;
    --bg-light: #f8f9fa;
}
```

### Contact Information

Update the footer contact details in `index.html` (starting at line 118).

## File Structure

```
victory-baptist/
├── index.html      # Main HTML file
├── styles.css      # All styling and responsive design
├── script.js       # JavaScript for navigation and carousel
└── README.md       # This file
```

## Browser Support

Works on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Features Breakdown

### Navigation
- Hamburger menu on mobile (< 768px)
- Expanded horizontal menu on desktop
- Smooth transitions and animations
- Auto-closes when clicking outside or on a link

### Carousel
- Auto-rotates every 5 seconds
- Manual controls (previous/next buttons)
- Touch/swipe support on mobile devices
- Indicator dots for navigation
- Pauses on hover/touch

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

## Next Steps

1. Add your actual church photo to the hero section
2. Update carousel content with your current events
3. Fill in contact information in the footer
4. Add additional pages (About, Ministries, etc.) as needed
5. Consider adding a contact form
6. Integrate with a backend for dynamic content management

---

Built with ❤️ for Victory Baptist Church Kittanning
