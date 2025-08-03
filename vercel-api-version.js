/**
 * Vercel-Compatible YouTube Downloader API
 * Returns direct download URLs instead of downloading files
 */

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Configuration
const config = {
  youtube: {
    ytdlpOptions: [
      '--no-check-certificates',
      '--no-warnings'
    ],
    formatOptions: {
      '360': 'worst[height<=360]/worst',
      '720': 'worst[height<=720]/worst[height<=480]/worst',
      '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
      '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best',
      '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
      'best': 'bestvideo+bestaudio/best',
      'highest': 'bestvideo+bestaudio/best'
    },
    defaultResolution: '1080' // Default to 1080p as per user preference
  }
};

// Utility functions
function cleanYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    const paramsToRemove = ['list', 'index', 't', 'start', 'end'];
    paramsToRemove.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        urlObj.searchParams.delete(param);
      }
    });
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

function getFormatCode(resolution) {
  return config.youtube.formatOptions[resolution] || config.youtube.formatOptions[config.youtube.defaultResolution];
}

// API Routes
app.get('/', (req, res) => {
  res.json({
    name: 'Advanced YouTube Downloader API',
    version: '2.0.0',
    author: 'Ahmed Azier',
    endpoints: {
      '/api/info': 'Get video metadata',
      '/api/formats': 'Get available formats',
      '/api/download': 'Get download URL'
    }
  });
});

// Get video information
app.get('/api/info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const cleanedUrl = cleanYouTubeUrl(url);
    const command = `python -m yt_dlp ${config.youtube.ytdlpOptions.join(' ')} --dump-single-json "${cleanedUrl}"`;
    
    // Note: This would need to be adapted for serverless environment
    // You might need to use a different approach or external service
    
    res.json({
      success: true,
      message: 'Video info endpoint - requires serverless adaptation',
      url: cleanedUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available formats
app.get('/api/formats', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const cleanedUrl = cleanYouTubeUrl(url);
    
    res.json({
      success: true,
      message: 'Formats endpoint - requires serverless adaptation',
      url: cleanedUrl,
      availableResolutions: Object.keys(config.youtube.formatOptions)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get download URL
app.get('/api/download', async (req, res) => {
  try {
    const { url, resolution = config.youtube.defaultResolution } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const cleanedUrl = cleanYouTubeUrl(url);
    const formatCode = getFormatCode(resolution);
    
    res.json({
      success: true,
      message: 'Download URL endpoint - requires serverless adaptation',
      url: cleanedUrl,
      resolution,
      formatCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check for Vercel
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5003;
  app.listen(PORT, () => {
    console.log(`🚀 Vercel-Compatible YouTube Downloader API`);
    console.log(`📡 Server running on http://localhost:${PORT}`);
  });
} 