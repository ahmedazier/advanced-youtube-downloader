const { exec } = require('child_process');

// Comprehensive test script to check video info and formats
function testVideo(url) {
  console.log(`\n=== Testing Video: ${url} ===\n`);
  
  // Test 1: Get video info
  console.log('1. Getting video info...');
  const infoCommand = `python -m yt_dlp --no-check-certificates --no-warnings --dump-single-json "${url}"`;
  
  exec(infoCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error getting info: ${error.message}`);
      return;
    }
    
    try {
      const info = JSON.parse(stdout);
      console.log(`Title: ${info.title}`);
      console.log(`Duration: ${info.duration_string}`);
      console.log(`Uploader: ${info.uploader}`);
      console.log(`View Count: ${info.view_count}`);
      console.log(`Available Formats: ${info.formats ? info.formats.length : 0}`);
    } catch (parseErr) {
      console.error('Failed to parse video info');
    }
    
    // Test 2: List formats
    console.log('\n2. Available formats:');
    const formatsCommand = `python -m yt_dlp --no-check-certificates --no-warnings --list-formats "${url}"`;
    
    exec(formatsCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error listing formats: ${error.message}`);
        return;
      }
      console.log(stdout);
      
      // Test 3: Try to get direct URL
      console.log('\n3. Testing direct URL retrieval...');
      const urlCommand = `python -m yt_dlp --no-check-certificates --no-warnings -f "worst[height<=1080]/worst[height<=720]/worst[height<=480]/18/worst" --get-url "${url}"`;
      
      exec(urlCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error getting URL: ${error.message}`);
          console.error(`stderr: ${stderr}`);
        } else {
          const videoUrl = stdout.trim();
          if (videoUrl) {
            console.log(`✅ Success! Direct URL: ${videoUrl.substring(0, 100)}...`);
          } else {
            console.log('❌ No URL returned');
          }
        }
      });
    });
  });
}

// Test with the problematic video
const testUrl = "https://youtu.be/tD5jar6h9QA";
testVideo(testUrl);

// You can also test with other videos by changing the URL above
// For example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 