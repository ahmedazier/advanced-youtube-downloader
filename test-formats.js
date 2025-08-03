const { exec } = require('child_process');

// Test script to check available formats for a YouTube video
function testFormats(url) {
  console.log(`Testing formats for: ${url}`);
  console.log('Available formats:');
  
  const command = `python -m yt_dlp --no-check-certificates --no-warnings --list-formats "${url}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

// Test with the video that was causing issues
const testUrl = "https://youtu.be/tD5jar6h9QA";
testFormats(testUrl); 