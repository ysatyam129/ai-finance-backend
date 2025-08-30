const axios = require('axios');

// Test CORS configuration
async function testCORS() {
  const testOrigins = [
    'https://ai-finance-website-sage.vercel.app',
    'https://ai-finance-website-git-main-satyams-projects-f93b7ccf.vercel.app',
    'http://localhost:3000',
    'https://malicious-site.com' // This should be blocked
  ];

  console.log('🧪 Testing CORS configuration...\n');

  for (const origin of testOrigins) {
    try {
      const response = await axios.get('https://ai-finance-backend-swart.vercel.app/api/cors-test', {
        headers: {
          'Origin': origin
        }
      });
      console.log(`✅ ${origin} - CORS allowed`);
      console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${origin} - CORS blocked (Status: ${error.response.status})`);
      } else {
        console.log(`❌ ${origin} - Request failed: ${error.message}`);
      }
      console.log('');
    }
  }
}

// Run the test
testCORS().catch(console.error); 