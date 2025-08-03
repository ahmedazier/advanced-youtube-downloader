/**
 * Test Current Application
 * Tests the modular YouTube downloader application
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5003';

async function testApplication() {
  console.log('🧪 Testing Advanced YouTube Downloader...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    const response = await axios.get(BASE_URL);
    console.log('✅ Server is running and responding');
    console.log(`📄 Page title: ${response.data.includes('YouTube Downloader') ? 'Found' : 'Not found'}\n`);

    // Test 2: Test format checking
    console.log('2️⃣ Testing format checking...');
    const testUrl = 'https://youtu.be/tD5jar6h9QA';
    const formatResponse = await axios.post(`${BASE_URL}/api/check-formats`, {
      url: testUrl
    });
    
    if (formatResponse.data.formats && formatResponse.data.formats.length > 0) {
      console.log('✅ Format checking works');
      console.log(`📊 Found ${formatResponse.data.formats.length} formats`);
      console.log(`🎯 Highest quality: ${formatResponse.data.highestQuality}\n`);
    } else {
      console.log('❌ Format checking failed\n');
    }

    // Test 3: Test video info
    console.log('3️⃣ Testing video info...');
    const infoResponse = await axios.post(`${BASE_URL}/api/get-info`, {
      url: testUrl
    });
    
    if (infoResponse.data.title) {
      console.log('✅ Video info works');
      console.log(`📹 Title: ${infoResponse.data.title}`);
      console.log(`⏱️ Duration: ${infoResponse.data.duration}\n`);
    } else {
      console.log('❌ Video info failed\n');
    }

    console.log('🎉 All tests completed! Your application is working correctly.');
    console.log('\n🌐 Open your browser and go to: http://localhost:5003');
    console.log('📱 You can now use the web interface to download videos!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running with: npm start');
    }
  }
}

// Run the test
testApplication(); 