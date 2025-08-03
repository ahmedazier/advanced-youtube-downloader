/**
 * YouTube Routes
 * Defines all API routes for YouTube operations
 */

const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');

// Page routes
router.get('/', youtubeController.renderMainPage);
router.get('/downloads', youtubeController.getDownloadedFiles);
router.get('/player/:filename', youtubeController.renderPlayerPage);

// API routes
router.post('/api/get-info', youtubeController.getVideoInfo);
router.post('/api/progressive-download', youtubeController.getProgressiveDownload);
router.post('/api/full-download', youtubeController.downloadAndMergeVideo);
router.post('/api/check-formats', youtubeController.checkAvailableFormats);
router.get('/api/file-info', youtubeController.getFileInfo);

// File management routes
router.post('/delete-file', youtubeController.deleteDownloadedFile);

module.exports = router; 