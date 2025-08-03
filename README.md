# 🎬 Advanced YouTube Downloader

A modern, high-quality YouTube video downloader built with Node.js, Express, and yt-dlp. Download videos in resolutions up to 4K with intelligent format detection and automatic quality selection.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## ✨ Features

### 🎯 **High-Quality Downloads**
- **4K Support**: Download videos up to 2160p (4K) resolution
- **Smart Quality Selection**: Automatically selects the best available quality
- **Default 1080p**: Prioritizes 1080p resolution by default for optimal quality
- **Format Detection**: Intelligent format analysis and selection

### 🚀 **Download Methods**
- **Progressive Download**: Fast direct video URL downloads
- **Full Download**: Separate video and audio streams merged with FFmpeg
- **Format Analysis**: Check available formats before downloading
- **Video Information**: Get detailed video metadata

### 🎨 **Modern Web Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Real-time Progress**: Live download progress tracking
- **File Management**: View, play, and delete downloaded files
- **Built-in Player**: Watch downloaded videos directly in the browser

### 🔧 **Advanced Features**
- **Multiple Resolutions**: 360p, 720p, 1080p, 1440p, 2160p support
- **Format Flexibility**: Handles videos with limited format availability
- **Error Recovery**: Smart fallback to available formats
- **File Organization**: Automatic file naming and organization
- **CORS Support**: Cross-origin request handling

## 📋 Prerequisites

### Required Software
- **Node.js** (>= 16.0.0)
- **FFmpeg** (for video merging and processing)
- **yt-dlp** (automatically installed/updated)

### FFmpeg Installation

#### Windows
1. Download FFmpeg from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg2025\bin`
3. Add to PATH or update the path in `src/config/config.js`

#### macOS
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahmedazier/advanced-youtube-downloader.git
   cd advanced-youtube-downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure FFmpeg path** (if needed)
   Edit `src/config/config.js` and update the `ffmpegLocation` path:
   ```javascript
   ffmpegLocation: 'C:\\ffmpeg2025\\bin', // Update this path
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and go to `http://localhost:5003`

## 🎮 Usage

### Web Interface

1. **Main Page** (`/`)
   - Enter YouTube URL
   - Choose download method and resolution
   - Monitor download progress

2. **Downloads Page** (`/downloads`)
   - View all downloaded files
   - Play videos directly in browser
   - Delete unwanted files

3. **Video Player** (`/player/:filename`)
   - Built-in video player for downloaded files

### Download Methods

#### 1. **Progressive Download** ⚡
- **Fastest method** - Direct video URL download
- **Best for**: Quick downloads, streaming, smaller files
- **Quality**: Up to 1080p (depending on video availability)
- **Format**: Single file (MP4/WebM)

#### 2. **Full Download** 🎬
- **Highest quality** - Separate video and audio streams
- **Best for**: Maximum quality, large files, archiving
- **Quality**: Up to 4K (2160p) with best audio
- **Format**: Merged file with FFmpeg

#### 3. **Format Analysis** 📊
- **Check available formats** before downloading
- **See all resolutions** and quality options
- **Make informed decisions** about download quality

### Resolution Options

| Resolution | Description | Use Case |
|------------|-------------|----------|
| **360p** | Standard definition | Fast downloads, mobile viewing |
| **720p** | High definition | Good quality, reasonable file size |
| **1080p** | Full HD (default) | **Optimal quality/size balance** |
| **1440p** | 2K | High-end displays |
| **2160p** | 4K Ultra HD | Maximum quality, large files |
| **Best** | Auto-select best available | Let the system choose |

## 🔧 Configuration

### Server Configuration
Edit `src/config/config.js`:

```javascript
module.exports = {
  server: {
    port: 5003,           // Server port
    host: 'localhost'      // Server host
  },
  youtube: {
    defaultResolution: 'highest',  // Default resolution
    downloadDir: './downloads',    // Download directory
    ffmpegLocation: 'C:\\ffmpeg2025\\bin'  // FFmpeg path
  }
}
```

### Environment Variables
```bash
PORT=5003                    # Server port
HOST=localhost              # Server host
NODE_ENV=production        # Environment
LOG_LEVEL=info             # Logging level
```

## 📁 Project Structure

```
advanced-youtube-downloader/
├── src/
│   ├── config/
│   │   └── config.js          # Application configuration
│   ├── controllers/
│   │   └── youtubeController.js # Request handlers
│   ├── middleware/
│   │   └── errorHandler.js     # Error handling
│   ├── routes/
│   │   └── youtubeRoutes.js    # API routes
│   ├── services/
│   │   └── youtubeService.js   # YouTube operations
│   ├── utils/
│   │   └── youtube.js          # YouTube utilities
│   └── server.js               # Main server file
├── views/                      # EJS templates
├── public/                     # Static files
├── downloads/                  # Downloaded videos
├── tests/                      # Test files
└── scripts/                    # Utility scripts
```

## 🧪 Testing

### Available Test Scripts

```bash
# Test format detection
npm run test

# Test specific features
node test-formats.js      # Check available formats
node test-video.js        # Comprehensive video testing
node test-1080p.js        # Test 1080p selection
node test-progressive.js  # Test progressive downloads
node test-full-download.js # Test full downloads
```

### Manual Testing
1. **Start the server**: `npm start`
2. **Open browser**: `http://localhost:5003`
3. **Test with different videos**:
   - Short videos (1-5 minutes)
   - Long videos (10+ minutes)
   - 4K videos
   - Videos with limited formats

## 🔧 Troubleshooting

### Common Issues

#### 1. **"FFmpeg not found" Error**
**Solution**: Install FFmpeg and update the path in `src/config/config.js`

#### 2. **"Format not available" Error**
**Solution**: The system automatically falls back to available formats. Try a different resolution.

#### 3. **Download fails**
**Solution**: 
- Check internet connection
- Verify YouTube URL is valid
- Try a different video
- Check the troubleshooting guide

#### 4. **Server won't start**
**Solution**:
- Check if port 5003 is available
- Verify Node.js version (>= 16.0.0)
- Check all dependencies are installed

### Update yt-dlp
```bash
# Windows
update-ytdlp.bat

# Linux/macOS
pip install --upgrade yt-dlp
```

## 📊 API Endpoints

### Web Routes
- `GET /` - Main download page
- `GET /downloads` - Downloads management
- `GET /player/:filename` - Video player

### API Routes
- `POST /api/get-info` - Get video information
- `POST /api/progressive-download` - Progressive download
- `POST /api/full-download` - Full download with merging
- `POST /api/check-formats` - Check available formats
- `GET /api/file-info` - Get file information
- `POST /delete-file` - Delete downloaded file

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **yt-dlp**: The powerful YouTube downloader engine
- **FFmpeg**: Video processing and merging
- **Express.js**: Web framework
- **Bootstrap**: UI framework
- **Font Awesome**: Icons

## 👨‍💻 Author

**Ahmed Azier** - [@ahmedazier](https://github.com/ahmedazier)

Programmer, photographer, and creator. Working at the sweet spot between beauty and elegance to answer design problems with honest solutions.

- 🌐 **Website**: [ahmedazier.com](https://www.ahmedazier.com/)
- 💼 **Company**: [MaffeiTech](https://maffeitech.com/)
- 🔗 **LinkedIn**: [in/ahmedazier](https://linkedin.com/in/ahmedazier)
- 📍 **Location**: Dubai, UAE

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ahmedazier/advanced-youtube-downloader/issues)
- **Documentation**: Check the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common solutions
- **Testing**: Use the provided test scripts to verify functionality

---

**⚠️ Disclaimer**: This tool is for personal use only. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have permission to download.

**🚀 Ready to download?** Start the server with `npm start` and enjoy high-quality YouTube downloads!