/**
 * YouTube Controller
 * Handles HTTP requests and responses for YouTube operations
 */

const youtubeService = require('../services/youtubeService');

/**
 * Get video information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getVideoInfo(req, res) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const videoInfo = await youtubeService.getVideoInfo(url);
    res.json(videoInfo);
  } catch (error) {
    console.error('Video info error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get progressive download URL
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getProgressiveDownload(req, res) {
  try {
    const { url, resolution = 'highest' } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const downloadUrl = await youtubeService.getProgressiveDownloadUrl(url, resolution);
    res.json({ downloadUrl });
  } catch (error) {
    console.error('Progressive download error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Download and merge video
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function downloadAndMergeVideo(req, res) {
  try {
    const { url, resolution = 'highest', saveName } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const result = await youtubeService.downloadAndMergeVideo(url, resolution, saveName);
    res.json(result);
  } catch (error) {
    console.error('Download error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Check available formats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function checkAvailableFormats(req, res) {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const formats = await youtubeService.getAvailableFormats(url);
    res.json(formats);
  } catch (error) {
    console.error('Format check error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get downloaded files list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getDownloadedFiles(req, res) {
  try {
    const files = await youtubeService.getDownloadedFiles();
    res.render('downloads', { files });
  } catch (error) {
    console.error('Get files error:', error.message);
    res.status(500).send('Error reading downloads directory.');
  }
}

/**
 * Delete downloaded file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteDownloadedFile(req, res) {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.redirect('/downloads');
    }
    
    await youtubeService.deleteDownloadedFile(filename);
    res.redirect('/downloads');
  } catch (error) {
    console.error('Delete error:', error.message);
    res.redirect('/downloads');
  }
}

/**
 * Get file information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getFileInfo(req, res) {
  try {
    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    const fs = require('fs');
    const path = require('path');
    const { exec } = require('child_process');
    const config = require('../config/config');
    const filePath = path.join(config.youtube.downloadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const stats = fs.statSync(filePath);
    const size = stats.size;
    const modified = stats.mtime;
    
    // Get video metadata using ffprobe
    const ffprobe = require('ffprobe-static');
    const ffprobePath = ffprobe.path;
    
    const getVideoMetadata = () => {
      return new Promise((resolve, reject) => {
        const command = `"${ffprobePath}" -v quiet -print_format json -show_format -show_streams "${filePath}"`;
        
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('FFprobe error:', error);
            resolve(null);
            return;
          }
          
          try {
            const metadata = JSON.parse(stdout);
            resolve(metadata);
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            resolve(null);
          }
        });
      });
    };
    
    // Get video metadata
    const videoMetadata = await getVideoMetadata();
    let videoInfo = {
      resolution: '-',
      bitrate: '-',
      frameRate: '-',
      codec: '-'
    };
    
    if (videoMetadata && videoMetadata.streams) {
      const videoStream = videoMetadata.streams.find(stream => stream.codec_type === 'video');
      if (videoStream) {
        // Calculate frame rate from fraction (e.g., "30/1" to "30 fps")
        let frameRate = '-';
        if (videoStream.r_frame_rate) {
          const [numerator, denominator] = videoStream.r_frame_rate.split('/');
          if (numerator && denominator) {
            const fps = Math.round((parseInt(numerator) / parseInt(denominator)) * 10) / 10;
            frameRate = `${fps} fps`;
          }
        }
        
        videoInfo = {
          resolution: `${videoStream.width || 0}x${videoStream.height || 0}`,
          bitrate: videoStream.bit_rate ? `${Math.round(videoStream.bit_rate / 1000)} kbps` : '-',
          frameRate: frameRate,
          codec: videoStream.codec_name ? videoStream.codec_name.toUpperCase() : '-'
        };
      }
    }
    
    res.json({
      filename,
      size,
      modified: modified.toISOString(),
      sizeFormatted: formatFileSize(size),
      ...videoInfo
    });
  } catch (error) {
    console.error('File info error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Render main page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function renderMainPage(req, res) {
  res.render('index', { videoUrl: null, error: null });
}

/**
 * Render player page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function renderPlayerPage(req, res) {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).render('error', {
        error: 'Invalid Request',
        message: 'No filename provided.'
      });
    }
    
    // Check if file exists in downloads directory
    const fs = require('fs');
    const path = require('path');
    const config = require('../config/config');
    const filePath = path.join(config.youtube.downloadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).render('error', {
        error: 'File Not Found',
        message: `The video file "${filename}" was not found in the downloads directory.`
      });
    }
    
    res.render('player', { filename });
  } catch (error) {
    console.error('Player page error:', error.message);
    res.status(500).render('error', {
      error: 'Server Error',
      message: 'An error occurred while loading the player page.'
    });
  }
}

module.exports = {
  getVideoInfo,
  getProgressiveDownload,
  downloadAndMergeVideo,
  checkAvailableFormats,
  getDownloadedFiles,
  deleteDownloadedFile,
  getFileInfo,
  renderMainPage,
  renderPlayerPage
}; 