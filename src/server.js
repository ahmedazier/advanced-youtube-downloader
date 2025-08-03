/**
 * Advanced YouTube Downloader Server
 * Main application entry point
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import configuration and middleware
const config = require('./config/config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const youtubeRoutes = require('./routes/youtubeRoutes');

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(config.security.cors));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Ensure downloads directory exists
if (!fs.existsSync(config.youtube.downloadDir)) {
  fs.mkdirSync(config.youtube.downloadDir, { recursive: true });
}

// Serve downloads folder
app.use('/downloads', express.static(config.youtube.downloadDir));

// Routes
app.use('/', youtubeRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, HOST, () => {
  console.log(`🚀 Advanced YouTube Downloader v${require('../package.json').version}`);
  console.log(`📡 Server running on http://${HOST}:${PORT}`);
  console.log(`📁 Downloads directory: ${config.youtube.downloadDir}`);
  console.log(`🎯 Default resolution: ${config.youtube.defaultResolution}`);
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('✨ Ready to download high-quality videos!');
}); 