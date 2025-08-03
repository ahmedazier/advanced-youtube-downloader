/**
 * YouTube Service
 * Handles YouTube video operations and business logic
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const youtubeUtils = require('../utils/youtube');

/**
 * Get video metadata (title, thumbnail, duration)
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Video metadata
 */
async function getVideoInfo(url) {
  const cleanedUrl = youtubeUtils.cleanYouTubeUrl(url);
  console.log(`Original URL: ${url}`);
  console.log(`Cleaned URL: ${cleanedUrl}`);
  
  const command = `python -m yt_dlp ${config.youtube.ytdlpOptions.join(' ')} --dump-single-json "${cleanedUrl}"`;
  console.log("Fetching metadata:", command);

  try {
    const { stdout } = await youtubeUtils.executeCommand(command);
    const info = JSON.parse(stdout);
    
    return {
      title: info.title || 'Untitled',
      thumbnail: info.thumbnail || '',
      duration: info.duration_string || ''
    };
  } catch (error) {
    console.error(`Metadata error: ${error.error}`);
    throw new Error(`Failed to get video info: ${error.error}`);
  }
}

/**
 * Get progressive download URL
 * @param {string} url - YouTube URL
 * @param {string} resolution - Resolution
 * @returns {Promise<string>} - Download URL
 */
async function getProgressiveDownloadUrl(url, resolution = config.youtube.defaultResolution) {
  const cleanedUrl = youtubeUtils.cleanYouTubeUrl(url);
  console.log(`Original URL: ${url}`);
  console.log(`Cleaned URL: ${cleanedUrl}`);

  const command = youtubeUtils.buildProgressiveCommand(cleanedUrl, resolution);
  console.log('Progressive download command:', command);

  try {
    const { stdout } = await youtubeUtils.executeCommand(command);
    if (!stdout) {
      throw new Error("Couldn't retrieve video URL");
    }
    return stdout;
  } catch (error) {
    console.error(`yt-dlp error: ${error.error}`);
    throw new Error(`Download failed: ${error.error}`);
  }
}

/**
 * Download and merge video to local file
 * @param {string} url - YouTube URL
 * @param {string} resolution - Resolution
 * @param {string} saveName - Optional custom filename
 * @returns {Promise<Object>} - Download result
 */
async function downloadAndMergeVideo(url, resolution = config.youtube.defaultResolution, saveName = null) {
  const cleanedUrl = youtubeUtils.cleanYouTubeUrl(url);
  console.log(`Original URL: ${url}`);
  console.log(`Cleaned URL: ${cleanedUrl}`);

  // Ensure downloads directory exists
  if (!fs.existsSync(config.youtube.downloadDir)) {
    fs.mkdirSync(config.youtube.downloadDir, { recursive: true });
  }

  // Generate filename
  const fileName = saveName || youtubeUtils.generateFileName();
  const outputPath = path.join(config.youtube.downloadDir, `${fileName}.%(ext)s`);

  const command = youtubeUtils.buildFullDownloadCommand(cleanedUrl, resolution, outputPath);
  console.log("Merging command:", command);

  try {
    await youtubeUtils.executeCommand(command);
    
    const outputFile = `${fileName}.mp4`;
    const finalPath = path.join(config.youtube.downloadDir, outputFile);
    
    if (!fs.existsSync(finalPath)) {
      throw new Error("Merged file not found");
    }
    
    return {
      status: 'Download completed successfully',
      fileName: outputFile,
      filePath: `/downloads/${outputFile}`
    };
  } catch (error) {
    console.error(`Merge error: ${error.error}`);
    throw new Error(`Download failed: ${error.error}`);
  }
}

/**
 * Check available formats for a video
 * @param {string} url - YouTube URL
 * @returns {Promise<Object>} - Available formats
 */
async function getAvailableFormats(url) {
  try {
    return await youtubeUtils.checkAvailableFormats(url);
  } catch (error) {
    console.error(`Format check error: ${error.message}`);
    throw new Error(`Failed to check formats: ${error.message}`);
  }
}

/**
 * Get list of downloaded files
 * @returns {Promise<string[]>} - List of downloaded files
 */
async function getDownloadedFiles() {
  return new Promise((resolve, reject) => {
    fs.readdir(config.youtube.downloadDir, (err, files) => {
      if (err) {
        reject(new Error('Error reading downloads directory'));
      } else {
        const mp4Files = files.filter((file) => file.endsWith('.mp4'));
        resolve(mp4Files);
      }
    });
  });
}

/**
 * Delete a downloaded file
 * @param {string} filename - Filename to delete
 * @returns {Promise<void>}
 */
async function deleteDownloadedFile(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(config.youtube.downloadDir, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(new Error(`Failed to delete file: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  getVideoInfo,
  getProgressiveDownloadUrl,
  downloadAndMergeVideo,
  getAvailableFormats,
  getDownloadedFiles,
  deleteDownloadedFile
}; 