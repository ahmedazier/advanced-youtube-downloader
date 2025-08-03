const { exec } = require('child_process');

// Test script to verify Progressive Download with URL cleaning
function testProgressiveDownload(url) {
  console.log(`\\n=== Testing Progressive Download with URL Cleaning ===\\n`);
  console.log(`Original URL: ${url}`);
  
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
  
  // Test the Progressive Download command with simpler format
  const command = `python -m yt_dlp --no-check-certificates --no-warnings --format best --get-url "${cleanedUrl}"`;
  console.log(`\\nCommand: ${command}\\n`);
  
  exec(command, { shell: true }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    
    const videoUrl = stdout.trim();
    if (videoUrl) {
      console.log(`✅ SUCCESS! Progressive Download URL:`);
      console.log(videoUrl);
    } else {
      console.log(`❌ FAILED: No video URL returned`);
    }
  });
}

// Test with the problematic URL that was causing issues
const testUrl = "https://youtu.be/fYLkGYz640w?list=RDfYLkGYz640w";
testProgressiveDownload(testUrl); 