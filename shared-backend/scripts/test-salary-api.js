/**
 * Test HR Salary API Script
 * Calls the debug-salary API endpoint to check salary data
 */

const https = require('https');

async function testSalaryAPI() {
  try {
    console.log('🔗 Testing HR salary debug API...');
    
    const options = {
      hostname: 'admin.yourclutch.com',
      port: 443,
      path: '/api/v1/hr/debug-salary',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-jwt-token-here' // You'll need to get a real token
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('📊 API Response:');
          console.log(JSON.stringify(response, null, 2));
        } catch (error) {
          console.log('📄 Raw Response:');
          console.log(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ API Request Error:', error);
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Error testing salary API:', error);
  }
}

// Run the script
if (require.main === module) {
  testSalaryAPI();
}

module.exports = { testSalaryAPI };
