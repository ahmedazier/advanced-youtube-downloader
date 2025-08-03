// server.js
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// EJS Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (for CSS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Ensure downloads folder exists
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}
// Serve the downloads folder so we can access merged files via /downloads/filename.mp4
app.use('/downloads', express.static(downloadsDir));

/** 
 * Extract video ID from a YouTube URL (basic approach).
 */
function extractVideoId(url) {
  let id = "";
  if (url.includes("youtu.be/")) {
    id = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("v=")) {
    id = url.split("v=")[1].split("&")[0];
  }
  return id;
}

/**
 * Clean YouTube URL by removing problematic parameters
 */
function cleanYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Remove problematic parameters that cause issues with yt-dlp
    const paramsToRemove = ['list', 'index', 't', 'start', 'end'];
    paramsToRemove.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.delete(param);
      }
    });
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return the original URL
    return url;
  }
}

/**
 * Generate a unique filename for downloads
 */
function generateFileName() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `video_${timestamp}_${random}`;
}

/**
 * Map resolution to known progressive format codes (fallback).
 * Updated to use more flexible format selection with highest resolution as default
 */
function getFormatCode(resolution) {
  switch (resolution) {
    case '360':
      return 'worst[height<=360]/worst'; // 360p or worst available
    case '720':
      return 'worst[height<=720]/worst[height<=480]/worst'; // 720p fallback to 480p fallback to worst
    case '1080':
      return 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best'; // Best up to 1080p
    case '1440':
      return 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best'; // Best up to 1440p
    case '2160':
      return 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best'; // Best up to 4K
    case 'best':
      return 'bestvideo+bestaudio/best'; // Best video + best audio, fallback to best
    case 'highest':
      return 'bestvideo+bestaudio/best'; // Highest available quality
    default:
      return 'bestvideo+bestaudio/best'; // Default to highest available quality
  }
}

/**
 * Build the yt-dlp command for progressive download ("-g" returns direct MP4 URL).
 * Updated with better options for handling YouTube changes
 */
function buildProgressiveCommand(url, resolution) {
  const formatCode = getFormatCode(resolution);
  
  // Add options to handle YouTube's recent changes
  const options = [
    '--no-check-certificates', // Skip certificate verification
    '--no-warnings', // Reduce warning output
    '--format', formatCode,
    '--get-url',
    url
  ];
  
  return `python -m yt_dlp ${options.join(' ')}`;
}

/**
 * =============  ROUTES  =============
 */

// GET / - Main page with forms
app.get('/', (req, res) => {
  res.render('index', { videoUrl: null, error: null });
});

// GET /downloads - Show a list of downloaded merged files
app.get('/downloads', (req, res) => {
  // Read the downloads directory
  fs.readdir(downloadsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading downloads directory.');
    }
    // Filter to .mp4 files only
    const mp4Files = files.filter((file) => file.endsWith('.mp4'));
    res.render('downloads', { files: mp4Files });
  });
});

// POST /delete-file - Delete a merged file from the server
app.post('/delete-file', (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.redirect('/downloads');
  }
  const filePath = path.join(downloadsDir, filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Delete error:', err);
    }
    res.redirect('/downloads');
  });
});

/**
 * POST /api/get-info - Get video metadata (title, thumbnail, duration) via yt-dlp
 * This helps us show the user some info before downloading.
 */
app.post('/api/get-info', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Clean the URL to remove problematic parameters
  const cleanedUrl = cleanYouTubeUrl(url);
  console.log(`Original URL: ${url}`);
  console.log(`Cleaned URL: ${cleanedUrl}`);
  
  // Use --dump-single-json to get metadata with better options
  const command = `python -m yt_dlp --no-check-certificates --no-warnings --dump-single-json "${cleanedUrl}"`;
  console.log("Fetching metadata:", command);

  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Metadata error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: error.message });
    }
    try {
      const info = JSON.parse(stdout);
      // Extract fields we care about
      const title = info.title || 'Untitled';
      const thumbnail = info.thumbnail || '';
      const duration = info.duration_string || '';
      return res.json({ title, thumbnail, duration });
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      return res.status(500).json({ error: 'Failed to parse metadata.' });
    }
  });
});

/**
 * POST /api/progressive-download - Progressive Download
 * Renders a page with a direct MP4 URL (limited to progressive formats).
 */
app.post('/api/progressive-download', (req, res) => {
  const { url, resolution = '1080' } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Clean the URL to remove problematic parameters
  const cleanedUrl = cleanYouTubeUrl(url);
  console.log(`Original URL: ${url}`);
  console.log(`Cleaned URL: ${cleanedUrl}`);

  const command = buildProgressiveCommand(cleanedUrl, resolution);
  console.log('Progressive download command:', command);

  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`yt-dlp error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    const videoUrl = stdout.trim();
    if (!videoUrl) {
      return res.status(500).json({ error: "Couldn't retrieve video URL" });
    }
    res.json({ downloadUrl: videoUrl });
  });
});

/**
 * POST /api/full-download - Merged Download (requires ffmpeg)
 * Downloads best video + best audio, merges to a local .mp4 file.
 */
app.post('/api/full-download', (req, res) => {
  const { url, resolution = '1080' } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Clean the URL to remove problematic parameters
  const cleanedUrl = cleanYouTubeUrl(url);
  console.log(`Original URL: ${url}`);
  console.log(`Cleaned URL: ${cleanedUrl}`);

  const fileName = generateFileName();
  const downloadsDir = path.join(__dirname, 'downloads');
  
  // Ensure downloads directory exists
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // Command with explicit ffmpeg location and better options for YouTube changes.
  const formatCode = getFormatCode(resolution);
  const command = `python -m yt_dlp --ffmpeg-location "C:\\\\ffmpeg2025\\\\bin" --no-check-certificates --no-warnings -f "${formatCode}" --merge-output-format mp4 -o "${downloadsDir}/${fileName}.%(ext)s" "${cleanedUrl}"`;
  console.log("Merging command:", command);

  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Merge error: ${error.message}`);
      console.error(stderr);
      return res.status(500).json({ error: error.message });
    }
    
    const outputFile = `${fileName}.mp4`;
    const outputPath = path.join(downloadsDir, outputFile);
    
    if (!fs.existsSync(outputPath)) {
      console.error("Merged file not found:", outputPath);
      return res.status(500).json({ error: "Merged file not found." });
    }
    
    // Return success response
    res.json({ 
      status: 'Download completed successfully',
      fileName: outputFile,
      filePath: `/downloads/${outputFile}`
    });
  });
});

/**
 * POST /api/check-formats - Check available formats for a video
 * This helps users see what resolutions are available before downloading.
 */
app.post('/api/check-formats', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  // Clean the URL to remove problematic parameters
  const cleanedUrl = cleanYouTubeUrl(url);
  console.log(`Checking formats for: ${cleanedUrl}`);
  
  const command = `python -m yt_dlp --no-check-certificates --no-warnings --list-formats "${cleanedUrl}"`;
  console.log("Format check command:", command);

  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Format check error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    
    // Parse the output to extract format information
    const lines = stdout.split('\n');
    const formats = [];
    
    lines.forEach(line => {
      if (line.includes('ID') && line.includes('EXT') && line.includes('RESOLUTION')) {
        return; // Skip header line
      }
      
      // Extract format info
      const match = line.match(/(\d+)\s+(\w+)\s+(\w+)\s+(\d+x\d+|\w+)\s+(.+)/);
      if (match) {
        const [, id, ext, resolution, size, note] = match;
        if (resolution !== 'audio' && resolution !== 'only' && !resolution.includes('x')) {
          return; // Skip audio-only formats
        }
        
        formats.push({
          id: id.trim(),
          ext: ext.trim(),
          resolution: resolution.trim(),
          size: size.trim(),
          note: note.trim()
        });
      }
    });
    
    // Sort by resolution (height) in descending order
    formats.sort((a, b) => {
      const heightA = parseInt(a.resolution.split('x')[1]) || 0;
      const heightB = parseInt(b.resolution.split('x')[1]) || 0;
      return heightB - heightA;
    });
    
    // Get the top 10 highest quality formats
    const topFormats = formats.slice(0, 10);
    
    res.json({ 
      formats: topFormats,
      highestQuality: topFormats[0]?.resolution || 'Unknown'
    });
  });
});


// Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
