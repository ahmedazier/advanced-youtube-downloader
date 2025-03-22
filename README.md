# Advanced YouTube Downloader & Player

This project is a full-featured YouTube Video Downloader & Player built with Node.js, Express, and EJS. It provides two main download modes:

- **Progressive Download (Fast):**  
  Returns a direct MP4 URL from YouTube using available progressive formats (usually up to 720p).

- **Full Resolution Download (Merged):**  
  Downloads the best available video and audio streams and merges them using yt-dlp and ffmpeg, allowing higher resolutions (e.g., 1080p or 4K if available).

Additional features include:

- **Video Metadata Preview:**  
  Retrieve and display video title, thumbnail, and duration before downloading.

- **Dark/Light Mode Toggle:**  
  Switch between dark and light themes for a modern UI.

- **Local File Management:**  
  View and manage downloaded (merged) videos from a dedicated downloads page.

## Requirements

- **Node.js**  
  [Download Node.js](https://nodejs.org/)

- **Python**  
  Ensure Python is installed and available in your PATH.  
  [Download Python](https://www.python.org/)