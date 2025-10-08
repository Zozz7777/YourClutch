const https = require('https');

const BASE_URL = 'https://clutch-main-nk7x.onrender.com';

// Test actual endpoints that exist in the codebase
const tests = [
  // Basic endpoints (should work)
  { method: 'GET', path: '/health', name: 'Health Check', expect: 200 },
  { method: 'GET', path: '/ping', name: 'Ping', expect: 200 },
  { method: 'GET', path: '/test-db', name: 'Database Test', expect: 200 },
  
  // Auth endpoints (POST methods)
  { method: 'POST', path: '/api/v1/auth/login', name: 'Auth Login (POST)', expect: 400, data: '{"email":"test@example.com","password":"test123"}' },
  { method: 'POST', path: '/api/v1/auth/register', name: 'Auth Register (POST)', expect: 400, data: '{"email":"test@example.com","password":"test123","name":"Test User"}' },
  
  // Fleet endpoints (protected - expect 401)
  { method: 'GET', path: '/api/v1/fleet/vehicles', name: 'Fleet Vehicles', expect: 401 },
  { method: 'GET', path: '/api/v1/fleet/drivers', name: 'Fleet Drivers', expect: 401 },
  
  // Cars endpoints (some public, some protected)
  { method: 'GET', path: '/api/v1/cars/brands', name: 'Cars Brands', expect: 200 },
  { method: 'GET', path: '/api/v1/cars/models', name: 'Cars Models', expect: 404 },
  { method: 'GET', path: '/api/v1/cars/user-cars', name: 'User Cars', expect: 401 },
  
  // Maintenance endpoints (protected)
  { method: 'GET', path: '/api/v1/maintenance/types', name: 'Maintenance Types', expect: 401 },
  { method: 'GET', path: '/api/v1/maintenance/history', name: 'Maintenance History', expect: 401 },
  
  // Revenue endpoints (protected)
  { method: 'GET', path: '/api/v1/revenue/metrics', name: 'Revenue Metrics', expect: 401 },
  { method: 'GET', path: '/api/v1/revenue/forecast', name: 'Revenue Forecast', expect: 401 },
  
  // System endpoints (some public, some protected)
  { method: 'GET', path: '/api/v1/system/version', name: 'System Version', expect: 200 },
  { method: 'GET', path: '/api/v1/system/info', name: 'System Info', expect: 401 },
  
  // Admin endpoints
  { method: 'GET', path: '/api/v1/admin', name: 'Admin Root', expect: 200 },
  
  // Protected routes (expect 401)
  { method: 'GET', path: '/api/v1/partners', name: 'Partners', expect: 401 },
  { method: 'GET', path: '/api/v1/analytics', name: 'Analytics', expect: 401 },
  { method: 'GET', path: '/api/v1/users', name: 'Users', expect: 401 },
  { method: 'GET', path: '/api/v1/notifications', name: 'Notifications', expect: 401 },
  { method: 'GET', path: '/api/v1/bookings', name: 'Bookings', expect: 401 },
  { method: 'GET', path: '/api/v1/payments', name: 'Payments', expect: 401 },
  { method: 'GET', path: '/api/v1/performance', name: 'Performance', expect: 401 },
  
  // Non-existent endpoints (expect 404)
  { method: 'GET', path: '/api/v1/dashboard', name: 'Dashboard Root', expect: 404 },
  { method: 'GET', path: '/api/v1/analytics/cost-optimization', name: 'Analytics Cost Optimization', expect: 404 },
  { method: 'GET', path: '/api/v1/health-enhanced', name: 'Health Enhanced', expect: 404 },
  { method: 'GET', path: '/api/v1/admin/dashboard', name: 'Admin Dashboard', expect: 404 },
  { method: 'GET', path: '/api/v1/partner-auth/login', name: 'Partner Auth Login', expect: 404 },
];

function makeRequest(method, path, data = null) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method: method,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 'ERROR',
        error: err.message,
        data: null
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        error: 'Request timeout',
        data: null
      });
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 TESTING ACTUAL ENDPOINTS\n');
  console.log('='.repeat(80));
  
  const results = {
    working: [],
    expected: [],
    unexpected: [],
    errors: [],
    timeouts: []
  };

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    const result = await makeRequest(test.method, test.path, test.data);
    
    if (result.status === test.expect) {
      console.log('✅ EXPECTED');
      results.expected.push(test.name);
    } else if (result.status === 200 && test.expect === 200) {
      console.log('✅ WORKING');
      results.working.push(test.name);
    } else if (result.status === 'TIMEOUT') {
      console.log('⏰ TIMEOUT');
      results.timeouts.push(test.name);
    } else if (result.status === 'ERROR') {
      console.log('💥 ERROR');
      results.errors.push(test.name);
    } else {
      console.log(`⚠️  ${result.status} (expected ${test.expect})`);
      results.unexpected.push({ name: test.name, expected: test.expect, actual: result.status });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n✅ WORKING/EXPECTED ROUTES (${results.working.length + results.expected.length}):`);
  results.working.forEach(route => console.log(`  - ${route}`));
  results.expected.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n⚠️  UNEXPECTED STATUS ROUTES (${results.unexpected.length}):`);
  results.unexpected.forEach(route => console.log(`  - ${route.name}: got ${route.actual}, expected ${route.expected}`));
  
  console.log(`\n💥 ERROR ROUTES (${results.errors.length}):`);
  results.errors.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n⏰ TIMEOUT ROUTES (${results.timeouts.length}):`);
  results.timeouts.forEach(route => console.log(`  - ${route}`));
  
  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL ROUTES TESTED: ${tests.length}`);
  console.log(`WORKING/EXPECTED: ${results.working.length + results.expected.length} (${Math.round((results.working.length + results.expected.length)/tests.length*100)}%)`);
  console.log(`UNEXPECTED: ${results.unexpected.length} (${Math.round(results.unexpected.length/tests.length*100)}%)`);
  console.log(`ERRORS: ${results.errors.length} (${Math.round(results.errors.length/tests.length*100)}%)`);
  console.log(`TIMEOUTS: ${results.timeouts.length} (${Math.round(results.timeouts.length/tests.length*100)}%)`);
  
  if (results.unexpected.length > 0) {
    console.log('\n🔧 ROUTES THAT NEED FIXING:');
    results.unexpected.forEach(route => {
      console.log(`  - ${route.name}: ${route.actual} → should be ${route.expected}`);
    });
  }
}

runTests().catch(console.error);
