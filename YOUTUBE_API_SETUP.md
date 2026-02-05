# YouTube API Setup Guide

Your sermons page is now configured to automatically load videos from your YouTube channel using the YouTube Data API v3. Follow these steps to complete the setup.

## Step 1: Get a YouTube Data API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select an existing one)
   - Click "Select a project" at the top
   - Click "New Project"
   - Name it: "Victory Baptist Church Website"
   - Click "Create"

3. **Enable YouTube Data API v3**
   - In the search bar, type "YouTube Data API v3"
   - Click on "YouTube Data API v3"
   - Click "Enable"

4. **Create API Credentials**
   - Click "Create Credentials" button
   - Select "API Key"
   - Copy the API key that appears
   - (Optional) Click "Restrict Key" to add security restrictions:
     - Under "Application restrictions", select "HTTP referrers"
     - Add your website domain (e.g., `yourdomain.com/*`)
     - Under "API restrictions", select "Restrict key"
     - Choose "YouTube Data API v3"
     - Click "Save"

## Step 2: Add Your API Key to the Website

1. **Open the file**: `assets/scripts/youtube-api.js`

2. **Find this line** (near the top):
   ```javascript
   apiKey: 'YOUR_API_KEY_HERE',
   ```

3. **Replace** `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   apiKey: 'AIzaSyC-your-actual-api-key-here',
   ```

4. **Save the file**

## Step 3: Verify Channel ID

The channel ID has been extracted from your YouTube URL. If videos don't load, you may need to verify it:

1. **Current channel ID in the code**: `UCvictorybaptistchurchkittan6993`

2. **To verify your channel ID**:
   - Go to your YouTube channel
   - Click on your profile icon
   - Click "Settings"
   - Click "Advanced settings"
   - Your Channel ID will be displayed

3. **If different**, update the `channelId` in `assets/scripts/youtube-api.js`:
   ```javascript
   channelId: 'YOUR_ACTUAL_CHANNEL_ID',
   ```

## Step 4: Test the Integration

1. Open `sermons.html` in your web browser
2. You should see:
   - A loading spinner initially
   - Then your latest 10 videos from YouTube
   - Each video with title, date, and description

## Troubleshooting

### Videos Not Loading?

**Check the browser console** (Press F12, go to Console tab):

1. **Error: "YouTube API key not configured"**
   - You haven't replaced `YOUR_API_KEY_HERE` with your actual API key

2. **Error: "Channel not found"**
   - The channel ID might be incorrect
   - Verify your channel ID as described in Step 3

3. **Error: "API error: 403"**
   - Your API key might be restricted to different domains
   - Check your API key restrictions in Google Cloud Console
   - Make sure YouTube Data API v3 is enabled

4. **Error: "API error: 400"**
   - There might be an issue with the request format
   - Check that your channel ID is correct

### API Quota Limits

YouTube Data API v3 has daily quota limits:
- **Free tier**: 10,000 units per day
- **Each page load**: Uses approximately 3-4 units
- This allows for ~2,500-3,000 page loads per day

If you exceed the quota, videos won't load until the next day (resets at midnight Pacific Time).

## Security Best Practices

### For Production Websites:

1. **Restrict your API key**:
   - Add HTTP referrer restrictions to your domain
   - Only allow YouTube Data API v3

2. **Consider server-side caching**:
   - Cache API responses on your server
   - Reduces API calls and improves performance
   - Updates videos every few hours instead of every page load

3. **Environment variables** (Advanced):
   - Don't commit API keys to public repositories
   - Use environment variables or a config file not tracked by git

## How It Works

1. **Page loads**: `sermons.html` includes `youtube-api.js`
2. **API call**: JavaScript fetches your channel's upload playlist
3. **Video retrieval**: Gets the latest 10 videos from the playlist
4. **Rendering**: Creates video cards with embedded players
5. **Display**: Shows videos in a responsive grid layout

## Customization Options

### Change Number of Videos

In `assets/scripts/youtube-api.js`, modify:
```javascript
maxResults: 10  // Change to any number (max 50)
```

### Change Description Length

In `assets/scripts/youtube-api.js`, find:
```javascript
truncateDescription(description, 150)  // Change 150 to desired character count
```

### Filter by Playlist

To show videos from a specific playlist instead of all uploads:
1. Get the playlist ID from YouTube
2. Modify the API call in `youtube-api.js` to use that playlist ID

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is correct and enabled
3. Confirm your channel ID is accurate
4. Check API quota usage in Google Cloud Console

---

**Your sermons page is now ready!** Once you add your API key, videos will load automatically from your YouTube channel.
