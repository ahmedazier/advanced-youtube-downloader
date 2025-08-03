const { exec } = require('child_process');

// Test script to check highest quality formats for a YouTube video
function testHighestQuality(url) {
  console.log(`Testing highest quality formats for: ${url}`);
  console.log('Available formats (sorted by quality):');
  
  const command = `python -m yt_dlp --no-check-certificates --no-warnings --list-formats "${url}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    
    const lines = stdout.split('\n');
    const formats = [];
    
    // Parse the output to extract format information
    lines.forEach(line => {
      if (line.includes('ID') && line.includes('EXT') && line.includes('RESOLUTION')) {
        // Skip header line
        return;
      }
      
      // Extract format info
      const match = line.match(/(\d+)\s+(\w+)\s+(\w+)\s+(\d+x\d+|\w+)\s+(.+)/);
      if (match) {
        const [, id, ext, resolution, size, note] = match;
        formats.push({
          id: id.trim(),
          ext: ext.trim(),
          resolution: resolution.trim(),
          size: size.trim(),
          note: note.trim()
        });
      }
    });
    
    // Sort by resolution (height) in descending order
    formats.sort((a, b) => {
      const heightA = parseInt(a.resolution.split('x')[1]) || 0;
      const heightB = parseInt(b.resolution.split('x')[1]) || 0;
      return heightB - heightA;
    });
    
    console.log('\n=== HIGHEST QUALITY FORMATS ===');
    console.log('ID\tEXT\tRESOLUTION\t\tNOTE');
    console.log('--\t---\t----------\t\t----');
    
    formats.slice(0, 10).forEach(format => {
      console.log(`${format.id}\t${format.ext}\t${format.resolution}\t\t${format.note}`);
    });
    
    console.log('\n=== RECOMMENDED FORMATS ===');
    console.log('For highest quality video + audio:');
    console.log('- Use "highest" option in the app');
    console.log('- Or manually select format ID for video + best audio');
  });
}

// Test with a video URL
const testUrl = "https://youtu.be/tD5jar6h9QA";
testHighestQuality(testUrl); 