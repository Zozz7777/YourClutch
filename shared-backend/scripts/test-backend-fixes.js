#!/usr/bin/env node

/**
 * Backend Fixes Test Script
 * Tests all the fixes implemented for the deployment issues
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.BASE_URL || 'https://clutch-main-nk7x.onrender.com';
const API_PREFIX = '/api/v1';

console.log('🧪 Testing Backend Fixes...');
console.log(`🌐 Testing against: ${BASE_URL}`);
console.log('============================================================\n');

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run a test
async function runTest(testName, testFunction) {
  testResults.total++;
  const startTime = performance.now();
  
  try {
    console.log(`🔄 Testing: ${testName}`);
    const result = await testFunction();
    const duration = Math.round(performance.now() - startTime);
    
    if (result.success) {
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      testResults.passed++;
      testResults.details.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`,
        details: result.details
      });
    } else {
      console.log(`❌ ${testName} - FAILED (${duration}ms)`);
      testResults.failed++;
      testResults.details.push({
        name: testName,
        status: 'FAILED',
        duration: `${duration}ms`,
        details: result.details,
        error: result.error
      });
    }
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.log(`❌ ${testName} - ERROR (${duration}ms): ${error.message}`);
    testResults.failed++;
    testResults.details.push({
      name: testName,
      status: 'ERROR',
      duration: `${duration}ms`,
      error: error.message
    });
  }
  
  console.log(''); // Empty line for readability
}

// Test 1: Root endpoint
async function testRootEndpoint() {
  const response = await axios.get(`${BASE_URL}/`);
  return {
    success: response.status === 200,
    details: `Status: ${response.status}, Message: ${response.data.message}`
  };
}

// Test 2: Health check
async function testHealthCheck() {
  const response = await axios.get(`${BASE_URL}/health`);
  return {
    success: response.status === 200,
    details: `Status: ${response.status}, Health: ${response.data.status}`
  };
}

// Test 3: Health ping
async function testHealthPing() {
  const response = await axios.get(`${BASE_URL}/health/ping`);
  return {
    success: response.status === 200,
    details: `Status: ${response.status}, Response: ${response.data.data.status}`
  };
}

// Test 4: Ping endpoint
async function testPing() {
  const response = await axios.get(`${BASE_URL}/ping`);
  return {
    success: response.status === 200,
    details: `Status: ${response.status}, Response: ${response.data.data.status}`
  };
}

// Test 5: Auth login endpoint (should return 401 for invalid credentials)
async function testAuthLogin() {
  try {
    const response = await axios.post(`${BASE_URL}${API_PREFIX}/auth/login`, {
      email: 'test@invalid.com',
      password: 'invalidpassword'
    });
    
    // Should return 401 for invalid credentials
    return {
      success: response.status === 401,
      details: `Status: ${response.status}, Expected: 401 for invalid credentials`
    };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        success: true,
        details: `Status: 401, Expected: 401 for invalid credentials`
      };
    }
    throw error;
  }
}

// Test 6: Auth register endpoint
async function testAuthRegister() {
  const testEmail = `test_${Date.now()}@example.com`;
  const response = await axios.post(`${BASE_URL}${API_PREFIX}/auth/register`, {
    email: testEmail,
    password: 'testpassword123',
    name: 'Test User',
    agreeToTerms: true
  });
  
  return {
    success: response.status === 201,
    details: `Status: ${response.status}, User created: ${response.data.success}`
  };
}

// Test 7: Protected endpoints (should return 401 without auth)
async function testProtectedEndpoints() {
  const endpoints = [
    `${API_PREFIX}/fleet/vehicles`,
    `${API_PREFIX}/fleet/drivers`,
    `${API_PREFIX}/bookings`,
    `${API_PREFIX}/payments`,
    `${API_PREFIX}/communication/chat`,
    `${API_PREFIX}/admin/users`,
    `${API_PREFIX}/performance/monitor`
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`);
      results.push({
        endpoint,
        status: response.status,
        expected: 401,
        success: response.status === 401
      });
    } catch (error) {
      results.push({
        endpoint,
        status: error.response?.status || 'ERROR',
        expected: 401,
        success: error.response?.status === 401
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  return {
    success: successCount === totalCount,
    details: `Protected endpoints: ${successCount}/${totalCount} correctly returning 401`
  };
}

// Test 8: Performance test (check response times)
async function testPerformance() {
  const startTime = performance.now();
  const response = await axios.get(`${BASE_URL}/health`);
  const duration = performance.now() - startTime;
  
  return {
    success: duration < 5000, // Should respond within 5 seconds
    details: `Response time: ${Math.round(duration)}ms (threshold: 5000ms)`
  };
}

// Test 9: CORS headers
async function testCORS() {
  const response = await axios.options(`${BASE_URL}/`);
  const corsHeaders = {
    'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
    'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
    'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
  };
  
  return {
    success: !!corsHeaders['Access-Control-Allow-Origin'],
    details: `CORS headers present: ${Object.keys(corsHeaders).filter(k => corsHeaders[k]).length}/3`
  };
}

// Test 10: Security headers
async function testSecurityHeaders() {
  const response = await axios.get(`${BASE_URL}/`);
  const securityHeaders = {
    'X-Content-Type-Options': response.headers['x-content-type-options'],
    'X-Frame-Options': response.headers['x-frame-options'],
    'X-XSS-Protection': response.headers['x-xss-protection']
  };
  
  return {
    success: Object.values(securityHeaders).some(header => header),
    details: `Security headers present: ${Object.values(securityHeaders).filter(h => h).length}/3`
  };
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive backend tests...\n');
  
  await runTest('Root Endpoint', testRootEndpoint);
  await runTest('Health Check', testHealthCheck);
  await runTest('Health Ping', testHealthPing);
  await runTest('Ping Endpoint', testPing);
  await runTest('Auth Login (401 Expected)', testAuthLogin);
  await runTest('Auth Register', testAuthRegister);
  await runTest('Protected Endpoints', testProtectedEndpoints);
  await runTest('Performance Test', testPerformance);
  await runTest('CORS Headers', testCORS);
  await runTest('Security Headers', testSecurityHeaders);
  
  // Print summary
  console.log('============================================================');
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('============================================================');
  console.log(`📊 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status !== 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.status} (${test.duration})`);
        if (test.error) console.log(`    Error: ${test.error}`);
        if (test.details) console.log(`    Details: ${test.details}`);
      });
  }
  
  console.log('\n🏁 Backend testing complete!');
  
  // Return exit code based on results
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
