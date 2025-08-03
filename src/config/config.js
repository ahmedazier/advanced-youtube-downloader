/**
 * Application Configuration
 * Centralized configuration for the YouTube Downloader
 */

const path = require('path');

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5003,
    host: process.env.HOST || 'localhost'
  },

  // YouTube Downloader Configuration
  youtube: {
    // yt-dlp command options
    ytdlpOptions: [
      '--no-check-certificates',
      '--no-warnings'
    ],
    
    // FFmpeg location (update this path for your system)
    ffmpegLocation: 'C:\\\\ffmpeg2025\\\\bin',
    
    // Default download directory
    downloadDir: path.join(__dirname, '../../downloads'),
    
    // Format selection options
    formatOptions: {
      '360': 'worst[height<=360]/worst',
      '720': 'worst[height<=720]/worst[height<=480]/worst',
      '1080': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
      '1440': 'bestvideo[height<=1440]+bestaudio/best[height<=1440]/best',
      '2160': 'bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
      'best': 'bestvideo+bestaudio/best',
      'highest': 'bestvideo+bestaudio/best'
    },
    
    // Default resolution
    defaultResolution: 'highest'
  },

  // File Management
  files: {
    // Allowed file extensions
    allowedExtensions: ['.mp4', '.webm', '.mkv'],
    
    // Maximum file size (in bytes) - 2GB
    maxFileSize: 2 * 1024 * 1024 * 1024,
    
    // File naming pattern
    namingPattern: 'video_{timestamp}_{random}'
  },

  // Security
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // CORS settings
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type']
    }
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined'
  }
}; 