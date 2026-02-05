# libs.js Documentation

A reusable JavaScript utility library for loading and managing JSON-based content in static websites.

## Overview

`libs.js` provides generic functions for:
- Loading manifest files
- Loading JSON files individually or in batches
- Pagination with lazy loading
- Query string management
- Date parsing and formatting
- Filename parsing utilities

## Installation

Add the script to your HTML file before any scripts that use it:

```html
<script src="assets/scripts/libs.js"></script>
<script src="assets/scripts/your-app.js"></script>
```

## Core Functions

### Query String Utilities

#### `getQueryParam(param)`
Get a query parameter value from the URL.

```javascript
const view = getQueryParam('view'); // Returns 'past' from ?view=past
const page = getQueryParam('page'); // Returns '2' from ?page=2
```

#### `setQueryParam(param, value)`
Set a query parameter and reload the page.

```javascript
setQueryParam('page', 2); // Navigates to ?page=2
setQueryParam('view', null); // Removes the 'view' parameter
```

#### `buildUrlWithParams(params)`
Build a URL with multiple query parameters.

```javascript
const url = buildUrlWithParams({ view: 'past', page: 2 });
// Returns: current-page.html?view=past&page=2
```

### JSON Loading Utilities

#### `loadManifest(manifestPath, arrayKey)`
Load a manifest file that contains a list of JSON filenames.

```javascript
// Manifest file: data/posts/manifest.json
// { "posts": ["post-1.json", "post-2.json"] }

const files = await loadManifest('data/posts/manifest.json', 'posts');
// Returns: ["post-1.json", "post-2.json"]
```

#### `loadJsonFile(filePath)`
Load a single JSON file.

```javascript
const post = await loadJsonFile('data/posts/post-1.json');
// Returns: { id: 1, title: "My Post", ... }
```

#### `loadJsonFiles(filenames, basePath)`
Load multiple JSON files in parallel.

```javascript
const files = ['post-1.json', 'post-2.json', 'post-3.json'];
const posts = await loadJsonFiles(files, 'data/posts/');
// Returns: [{ id: 1, ... }, { id: 2, ... }, { id: 3, ... }]
```

#### `loadPaginatedJsonData(config)`
Load JSON files from a manifest with filtering, sorting, and pagination.

**Configuration Object:**
- `manifestPath` (string): Path to manifest file
- `dataPath` (string): Base path for data files
- `manifestKey` (string): Key in manifest containing filenames (default: 'files')
- `filterFn` (function): Optional filter function for filenames
- `sortFn` (function): Optional sort function for filenames
- `page` (number): Page number for pagination (1-indexed)
- `itemsPerPage` (number): Number of items per page

**Returns:**
```javascript
{
  items: Array,        // Loaded JSON objects for current page
  total: number,       // Total number of items after filtering
  totalPages: number,  // Total number of pages
  currentPage: number, // Current page number
  startIndex: number,  // Starting index (1-indexed)
  endIndex: number     // Ending index
}
```

**Example:**
```javascript
const result = await loadPaginatedJsonData({
    manifestPath: 'data/posts/manifest.json',
    dataPath: 'data/posts/',
    manifestKey: 'posts',
    filterFn: (filename) => filename.includes('2026'),
    sortFn: (a, b) => b.localeCompare(a), // Reverse alphabetical
    page: 1,
    itemsPerPage: 10
});

console.log(result.items);      // Array of 10 post objects
console.log(result.total);      // Total posts matching filter
console.log(result.totalPages); // Number of pages
```

### Filename Parsing Utilities

#### `extractDateFromFilename(filename, pattern)`
Extract a date from a filename using a regex pattern.

```javascript
// Default pattern matches YYYY-MM-DD
const date = extractDateFromFilename('post-2026-03-15-title.json');
// Returns: "2026-03-15"

// Custom pattern
const date = extractDateFromFilename('post_20260315.json', /(\d{8})/);
// Returns: "20260315"
```

#### `isDatePast(dateString)`
Check if a date string represents a past date.

```javascript
isDatePast('2025-12-25'); // Returns: true (if today is after Dec 25, 2025)
isDatePast('2027-01-01'); // Returns: false (if today is before Jan 1, 2027)
```

#### `isDateFuture(dateString)`
Check if a date string represents a future date.

```javascript
isDateFuture('2027-01-01'); // Returns: true (if today is before Jan 1, 2027)
isDateFuture('2025-12-25'); // Returns: false (if today is after Dec 25, 2025)
```

### Array Utilities

#### `paginateArray(array, page, itemsPerPage)`
Get a paginated slice of an array.

```javascript
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const page1 = paginateArray(items, 1, 5); // [1, 2, 3, 4, 5]
const page2 = paginateArray(items, 2, 5); // [6, 7, 8, 9, 10]
const page3 = paginateArray(items, 3, 5); // [11, 12]
```

#### `calculateTotalPages(totalItems, itemsPerPage)`
Calculate total pages for pagination.

```javascript
calculateTotalPages(25, 10); // Returns: 3
calculateTotalPages(30, 10); // Returns: 3
calculateTotalPages(31, 10); // Returns: 4
```

### Date Formatting Utilities

#### `formatDate(dateString, options)`
Format a date string for display.

```javascript
// Default format: "Monday, March 15, 2026"
formatDate('2026-03-15');

// Custom format
formatDate('2026-03-15', { month: 'short', day: 'numeric', year: 'numeric' });
// Returns: "Mar 15, 2026"
```

#### `getMonthAbbreviation(dateString)`
Get three-letter month abbreviation.

```javascript
getMonthAbbreviation('2026-03-15'); // Returns: "MAR"
getMonthAbbreviation('2026-12-25'); // Returns: "DEC"
```

#### `getDayOfMonth(dateString)`
Get day of the month as a number.

```javascript
getDayOfMonth('2026-03-15'); // Returns: 15
getDayOfMonth('2026-12-25'); // Returns: 25
```

## Complete Example: Blog Posts

Here's a complete example of using `libs.js` for a blog system:

### 1. Create Manifest File
```json
// data/posts/manifest.json
{
  "posts": [
    "post-2026-03-15-first-post.json",
    "post-2026-03-10-second-post.json",
    "post-2026-02-20-third-post.json"
  ]
}
```

### 2. Create Post Files
```json
// data/posts/post-2026-03-15-first-post.json
{
  "id": "post-2026-03-15-first-post",
  "title": "My First Post",
  "date": "2026-03-15",
  "content": "This is my first blog post!",
  "author": "John Doe"
}
```

### 3. Create JavaScript Logic
```javascript
// blog.js
const BLOG_CONFIG = {
    manifestPath: 'data/posts/manifest.json',
    dataPath: 'data/posts/',
    postsPerPage: 5
};

// Extract date from post filename
function extractPostDate(filename) {
    return extractDateFromFilename(filename, /post-(\d{4}-\d{2}-\d{2})/);
}

// Filter for published posts only
function filterPublishedPosts(filename) {
    const date = extractPostDate(filename);
    return date && !isDateFuture(date);
}

// Sort posts by date (newest first)
function sortPostsByDate(a, b) {
    const dateA = new Date(extractPostDate(a));
    const dateB = new Date(extractPostDate(b));
    return dateB - dateA;
}

// Load posts for current page
async function loadPosts() {
    const page = parseInt(getQueryParam('page') || '1', 10);
    
    const result = await loadPaginatedJsonData({
        manifestPath: BLOG_CONFIG.manifestPath,
        dataPath: BLOG_CONFIG.dataPath,
        manifestKey: 'posts',
        filterFn: filterPublishedPosts,
        sortFn: sortPostsByDate,
        page: page,
        itemsPerPage: BLOG_CONFIG.postsPerPage
    });
    
    return result;
}

// Render posts
async function renderBlog() {
    const result = await loadPosts();
    
    result.items.forEach(post => {
        console.log(`${post.title} - ${formatDate(post.date)}`);
    });
    
    console.log(`Showing ${result.startIndex}-${result.endIndex} of ${result.total} posts`);
}

renderBlog();
```

## Benefits

1. **Reusable**: Use the same functions across multiple pages (events, blog, sermons, etc.)
2. **Performance**: Lazy loading with pagination reduces bandwidth
3. **Maintainable**: Centralized utility functions, easier to update
4. **Flexible**: Generic functions work with any JSON structure
5. **Static-friendly**: No server-side code required

## Events Page Example

The events page uses `libs.js` like this:

```javascript
// events.js uses these libs.js functions:
- getQueryParam() - Get view and page from URL
- loadPaginatedJsonData() - Load events with filtering/sorting/pagination
- extractDateFromFilename() - Parse dates from event filenames
- isDatePast() - Check if event is in the past
- formatDate() - Display formatted dates
- getMonthAbbreviation() - Show month on date badge
- getDayOfMonth() - Show day on date badge
- calculateTotalPages() - Calculate pagination
```

This reduces `events.js` from ~400 lines to ~350 lines by removing duplicated utility code.

## Future Use Cases

You can use `libs.js` for:
- **Sermons**: Load sermon data from JSON files
- **Blog posts**: Create a blog system
- **Testimonials**: Display rotating testimonials
- **Staff directory**: Load staff member profiles
- **Photo galleries**: Load image metadata
- **Prayer requests**: Manage prayer request submissions
- **Any JSON-based content!**
