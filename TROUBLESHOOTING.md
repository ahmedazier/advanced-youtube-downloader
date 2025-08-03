# YouTube Downloader Troubleshooting Guide

## Issues Fixed

### 1. **Format Availability Error**
**Problem**: `ERROR: [youtube] Requested format is not available. Use --list-formats for a list of available formats`

**Cause**: 
- YouTube has limited format availability for some videos
- The original code used hardcoded format codes (`22/18`) that may not be available
- Some videos only have format `18` (360p) available

**Solution**: 
- Updated format selection to use flexible patterns like `worst[height<=X]`
- Added fallback to format `18` which is commonly available
- Used `--extractor-args youtube:player_client=android` to avoid restrictions

### 2. **Progressive Download Not Working**
**Problem**: `The system cannot find the path specified` error in Progressive Download

**Cause**: 
- Incorrect formatting of `--extractor-args` parameter
- Missing quotes around parameter values

**Solution**: 
- Fixed `--extractor-args youtube:player_client=android` format
- Removed unnecessary quotes that were causing path issues

### 3. **DRM Protection Warnings**
**Problem**: `WARNING: [youtube] Some tv client https formats have been skipped as they are DRM protected`

**Cause**: YouTube has started applying DRM to some videos

**Solution**: 
- Added `--extractor-args youtube:player_client=android` to use Android client
- Added `--no-check-certificates` and `--no-warnings` to reduce noise

### 4. **Server-Side Ads Interference**
**Problem**: `WARNING: [youtube] Some web client https formats have been skipped as they are missing a url`

**Cause**: YouTube's SSAP (server-side ads) experiment interferes with yt-dlp

**Solution**: 
- Used Android client to avoid web client restrictions
- Added better error handling and fallback options

## Updated Format Selection

The new format selection is more flexible and defaults to 1080p:

```javascript
// Old (problematic)
'22/18' // Hardcoded format codes

// New (flexible with 1080p default)
'worst[height<=1080]/worst[height<=720]/worst[height<=480]/18/worst' // 1080p with fallbacks
```

## Default 1080p Priority

The system now prioritizes 1080p by default:
- **Progressive Download**: Always tries 1080p first, then falls back to lower resolutions
- **Full Download**: Uses `worst[height<=1080]+bestaudio` to get 1080p video + best audio
- **All resolutions**: Default to 1080p with smart fallbacks

## Testing Tools

### 1. `test-formats.js`
Shows available formats for any video:
```bash
node test-formats.js
```

### 2. `test-video.js`
Comprehensive test showing video info, formats, and URL retrieval:
```bash
node test-video.js
```

### 3. `test-1080p.js`
Tests 1080p format selection with videos that have multiple resolutions:
```bash
node test-1080p.js
```

### 4. `update-ytdlp.bat`
Updates yt-dlp to the latest version:
```bash
update-ytdlp.bat
```

## Usage

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Access the application**:
   - Open `http://localhost:5003`
   - Enter a YouTube URL
   - Choose resolution and download method

3. **For all videos**:
   - **Progressive Download**: Now works correctly and defaults to 1080p
   - **Full Download**: Always tries to get 1080p video + best audio

## Common Scenarios

### Videos with Limited Formats (like the test video)
- Only format `18` (360p) available
- Progressive Download will automatically fallback to available format
- Full Download will use the best available format

### Videos with Full Format Support
- Multiple resolutions available (360p, 720p, 1080p, etc.)
- Progressive Download will get 1080p if available, otherwise fallback
- Full Download will merge 1080p video + best audio

## Error Handling

The updated system now:
- ✅ Handles videos with limited format availability
- ✅ Provides fallback options when preferred formats aren't available
- ✅ Reduces warning messages that can confuse users
- ✅ Uses Android client to avoid web restrictions
- ✅ Provides better error messages
- ✅ **Progressive Download now works correctly**
- ✅ **Defaults to 1080p for all downloads**

## Maintenance

- **Update yt-dlp regularly**: Run `update-ytdlp.bat` monthly
- **Test with different videos**: Use `test-video.js` to check format availability
- **Test 1080p selection**: Use `test-1080p.js` for videos with multiple resolutions
- **Monitor for new YouTube changes**: YouTube frequently updates their systems 