const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test script to verify API endpoints
async function testAPI() {
  console.log('\\n=== Testing API Endpoints ===\\n');
  
  const testUrl = 'https://youtu.be/fYLkGYz640w';
  
  // Test Progressive Download API
  console.log('1. Testing Progressive Download API...');
  try {
    const response = await fetch('http://localhost:5003/api/progressive-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl, resolution: '1080' })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.downloadUrl) {
      console.log('✅ Progressive Download API working!');
    } else {
      console.log('❌ Progressive Download API failed');
    }
  } catch (err) {
    console.error('Progressive Download API error:', err.message);
  }
  
  // Test Full Download API
  console.log('\\n2. Testing Full Download API...');
  try {
    const response = await fetch('http://localhost:5003/api/full-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl, saveName: 'test_video' })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.status) {
      console.log('✅ Full Download API working!');
    } else {
      console.log('❌ Full Download API failed');
    }
  } catch (err) {
    console.error('Full Download API error:', err.message);
  }
}

testAPI(); 