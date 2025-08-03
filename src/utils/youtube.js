/**
 * YouTube Utility Functions
 * Handles URL processing, format selection, and YouTube-specific operations
 */

const { exec } = require('child_process');
const config = require('../config/config');

/**
 * Clean YouTube URL by removing problematic parameters
 * @param {string} url - The YouTube URL to clean
 * @returns {string} - Cleaned URL
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
 * Extract video ID from a YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string} - Video ID
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
 * Get format code for a specific resolution
 * @param {string} resolution - The resolution (360, 720, 1080, etc.)
 * @returns {string} - Format code for yt-dlp
 */
function getFormatCode(resolution) {
  return config.youtube.formatOptions[resolution] || config.youtube.formatOptions[config.youtube.defaultResolution];
}

/**
 * Generate a unique filename for downloads
 * @returns {string} - Unique filename
 */
function generateFileName() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `video_${timestamp}_${random}`;
}

/**
 * Build yt-dlp command for progressive download
 * @param {string} url - YouTube URL
 * @param {string} resolution - Resolution
 * @returns {string} - Command string
 */
function buildProgressiveCommand(url, resolution) {
  const formatCode = getFormatCode(resolution);
  
  const options = [
    ...config.youtube.ytdlpOptions,
    '--format', formatCode,
    '--get-url',
    url
  ];
  
  return `python -m yt_dlp ${options.join(' ')}`;
}

/**
 * Build yt-dlp command for full download with merging
 * @param {string} url - YouTube URL
 * @param {string} resolution - Resolution
 * @param {string} outputPath - Output file path
 * @returns {string} - Command string
 */
function buildFullDownloadCommand(url, resolution, outputPath) {
  const formatCode = getFormatCode(resolution);
  
  const options = [
    '--ffmpeg-location', config.youtube.ffmpegLocation,
    ...config.youtube.ytdlpOptions,
    '-f', formatCode,
    '--merge-output-format', 'mp4',
    '-o', outputPath,
    url
  ];
  
  return `python -m yt_dlp ${options.join(' ')}`;
}

/**
 * Execute a command and return a promise
 * @param {string} command - Command to execute
 * @returns {Promise} - Promise with stdout and stderr
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
      } else {
        resolve({ stdout: stdout.trim(), stderr });
      }
    });
  });
}

/**
 * Check available formats for a video
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Available formats
 */
async function checkAvailableFormats(url) {
  const cleanedUrl = cleanYouTubeUrl(url);
  const command = `python -m yt_dlp ${config.youtube.ytdlpOptions.join(' ')} --list-formats "${cleanedUrl}"`;
  
  try {
    const { stdout } = await executeCommand(command);
    return parseFormatsOutput(stdout);
  } catch (error) {
    throw new Error(`Failed to check formats: ${error.error}`);
  }
}

/**
 * Parse yt-dlp format output
 * @param {string} output - Raw output from yt-dlp
 * @returns {Object} - Parsed formats
 */
function parseFormatsOutput(output) {
  const lines = output.split('\n');
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
  
  return {
    formats: formats.slice(0, 10),
    highestQuality: formats[0]?.resolution || 'Unknown'
  };
}

module.exports = {
  cleanYouTubeUrl,
  extractVideoId,
  getFormatCode,
  generateFileName,
  buildProgressiveCommand,
  buildFullDownloadCommand,
  executeCommand,
  checkAvailableFormats,
  parseFormatsOutput
}; 