const { exec } = require('child_process');

// Test script to verify Full Download API endpoint
function testFullDownload(url) {
  console.log(`\\n=== Testing Full Download API ===\\n`);
  console.log(`URL: ${url}`);
  
  // Clean the URL (simulate the server function)
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
      return url;
    }
  }
  
  const cleanedUrl = cleanYouTubeUrl(url);
  console.log(`Cleaned URL: ${cleanedUrl}`);
  
  // Test the Full Download command
  const command = `python -m yt_dlp --ffmpeg-location "C:\\\\ffmpeg2025\\\\bin" --no-check-certificates --no-warnings -f "worst[height<=1080]+bestaudio/worst[height<=720]+bestaudio/best[ext=mp4]/best" --merge-output-format mp4 -o "test_download.%(ext)s" "${cleanedUrl}"`;
  console.log(`\\nCommand: ${command}\\n`);
  
  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    
    console.log(`✅ SUCCESS! Full Download completed`);
    console.log(`stdout: ${stdout}`);
  });
}

// Test with a simple URL
const testUrl = "https://youtu.be/fYLkGYz640w";
testFullDownload(testUrl); 