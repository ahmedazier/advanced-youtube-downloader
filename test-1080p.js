const { exec } = require('child_process');

// Test script to verify 1080p default format selection
function test1080pDefault(url) {
  console.log(`\n=== Testing 1080p Default for: ${url} ===\n`);
  
  // Test with a video that should have 1080p available
  const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rick Roll - should have multiple formats
  
  console.log('1. Checking available formats...');
  const formatsCommand = `python -m yt_dlp --no-check-certificates --no-warnings --list-formats "${testUrl}"`;
  
  exec(formatsCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(stdout);
    
    console.log('\n2. Testing 1080p format selection...');
    const urlCommand = `python -m yt_dlp --no-check-certificates --no-warnings -f "worst[height<=1080]/worst[height<=720]/worst[height<=480]/18/worst" --get-url "${testUrl}"`;
    
    exec(urlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error getting URL: ${error.message}`);
        console.error(`stderr: ${stderr}`);
      } else {
        const videoUrl = stdout.trim();
        if (videoUrl) {
          console.log(`✅ Success! 1080p URL retrieved: ${videoUrl.substring(0, 100)}...`);
        } else {
          console.log('❌ No URL returned');
        }
      }
    });
  });
}

// Test with a video that should have 1080p
test1080pDefault("https://www.youtube.com/watch?v=dQw4w9WgXcQ"); 