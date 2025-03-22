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
 * Map resolution to known progressive format codes (fallback).
 */
function getFormatCode(resolution) {
  switch (resolution) {
    case '360':
      return '18'; // 360p
    case '720':
      return '22/18'; // 720p fallback to 360p
    case '1080':
      return '37/22/18'; // 1080p fallback to 720p fallback to 360p
    case 'best':
      return '37/22/18'; 
    default:
      return '22/18';
  }
}

/**
 * Build the yt-dlp command for progressive download ("-g" returns direct MP4 URL).
 */
function buildProgressiveCommand(url, resolution) {
  const formatCode = getFormatCode(resolution);
  const isWindows = process.platform === 'win32';
  const quote = isWindows ? '"' : "'";
  return `python -m yt_dlp -f ${quote}${formatCode}${quote} -g "${url}"`;
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
  // Use --dump-single-json to get metadata
  const command = `python -m yt_dlp --dump-single-json "${url}"`;
  console.log("Fetching metadata:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Metadata error: ${error.message}`);
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
 * POST /download - Progressive Download
 * Renders a page with a direct MP4 URL (limited to progressive formats).
 */
app.post('/download', (req, res) => {
  const { url, resolution } = req.body;
  if (!url) {
    return res.render('index', { videoUrl: null, error: 'URL is required' });
  }
  const command = buildProgressiveCommand(url, resolution);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`yt-dlp error: ${error.message}`);
      return res.render('index', { videoUrl: null, error: error.message });
    }
    const videoUrl = stdout.trim();
    if (!videoUrl) {
      return res.render('index', { videoUrl: null, error: "Couldn't retrieve video URL" });
    }
    res.render('player', { videoUrl });
  });
});

/**
 * POST /download-full - Merged Download (requires ffmpeg)
 * Downloads best video + best audio, merges to a local .mp4 file.
 */
// Full Resolution (Merged) Download Route - Updated
// Full Resolution (Merged) Download Route
app.post('/download-full', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.render('index', { videoUrl: null, error: 'URL is required' });
  }
  const videoId = extractVideoId(url) || Date.now();
  const outputTemplate = path.join(downloadsDir, `${videoId}.mp4`);

  // Explicitly tell yt-dlp where ffmpeg is located (adjust the path if needed)
  // We are not filtering the audio stream by extension so it can pick the best available audio.
  // This command will merge the best video (in mp4) and best audio (any container) into one mp4 file.
  const command = `python -m yt_dlp --ffmpeg-location "C:\\ffmpeg2025\\bin" -f "bestvideo[ext=mp4]+bestaudio" --merge-output-format mp4 -o "${downloadsDir}/${videoId}.%(ext)s" "${url}"`;
  
  console.log("Merging command:", command);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Merge error: ${error.message}`);
      console.error(stderr);
      return res.render('index', { videoUrl: null, error: error.message });
    }
    if (!fs.existsSync(outputTemplate)) {
      console.error("Merged file not found:", outputTemplate);
      return res.render('index', { videoUrl: null, error: "Merged file not found." });
    }
    const fileUrl = `/downloads/${videoId}.mp4`;
    res.render('player', { videoUrl: fileUrl });
  });
});




// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
