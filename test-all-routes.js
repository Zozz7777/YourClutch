const https = require('https');

const BASE_URL = 'https://clutch-main-nk7x.onrender.com';

// Test configuration
const tests = [
  // Basic endpoints
  { method: 'GET', path: '/health', name: 'Health Check' },
  { method: 'GET', path: '/ping', name: 'Ping' },
  { method: 'GET', path: '/test-db', name: 'Database Test' },
  
  // API v1 routes - testing actual endpoints
  { method: 'GET', path: '/api/v1/auth/login', name: 'Auth Login' },
  { method: 'GET', path: '/api/v1/fleet/vehicles', name: 'Fleet Vehicles' },
  { method: 'GET', path: '/api/v1/fleet/drivers', name: 'Fleet Drivers' },
  { method: 'GET', path: '/api/v1/partners', name: 'Partners Root' },
  { method: 'GET', path: '/api/v1/admin', name: 'Admin Root' },
  { method: 'GET', path: '/api/v1/analytics', name: 'Analytics Root' },
  { method: 'GET', path: '/api/v1/users', name: 'Users Root' },
  { method: 'GET', path: '/api/v1/notifications', name: 'Notifications Root' },
  { method: 'GET', path: '/api/v1/bookings', name: 'Bookings Root' },
  { method: 'GET', path: '/api/v1/cars/brands', name: 'Cars Brands' },
  { method: 'GET', path: '/api/v1/maintenance', name: 'Maintenance Root' },
  { method: 'GET', path: '/api/v1/payments', name: 'Payments Root' },
  { method: 'GET', path: '/api/v1/revenue', name: 'Revenue Root' },
  { method: 'GET', path: '/api/v1/system', name: 'System Root' },
  { method: 'GET', path: '/api/v1/performance', name: 'Performance Root' },
  { method: 'GET', path: '/api/v1/dashboard', name: 'Dashboard Root' },
  
  // Additional specific endpoints
  { method: 'GET', path: '/api/v1/analytics/performance', name: 'Analytics Performance' },
  { method: 'GET', path: '/api/v1/analytics/cost-optimization', name: 'Analytics Cost Optimization' },
  { method: 'GET', path: '/api/v1/health-enhanced', name: 'Health Enhanced' },
  { method: 'GET', path: '/api/v1/admin/dashboard', name: 'Admin Dashboard' },
  { method: 'GET', path: '/api/v1/partner-auth/login', name: 'Partner Auth Login' },
  { method: 'GET', path: '/api/v1/cars/models', name: 'Cars Models' },
  { method: 'GET', path: '/api/v1/maintenance/schedules', name: 'Maintenance Schedules' },
  { method: 'GET', path: '/api/v1/revenue/analytics', name: 'Revenue Analytics' },
  { method: 'GET', path: '/api/v1/system/status', name: 'System Status' },
  { method: 'GET', path: '/api/v1/performance/metrics', name: 'Performance Metrics' },
  { method: 'GET', path: '/api/v1/dashboard/overview', name: 'Dashboard Overview' },
];

function makeRequest(method, path) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    const options = {
      method: method,
      timeout: 10000
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
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

    req.end();
  });
}

async function runTests() {
  console.log('🧪 TESTING ALL ROUTES\n');
  console.log('='.repeat(80));
  
  const results = {
    working: [],
    errors: [],
    notFound: [],
    timeouts: [],
    other: []
  };

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    const result = await makeRequest(test.method, test.path);
    
    if (result.status === 200) {
      console.log('✅ WORKING');
      results.working.push(test.name);
    } else if (result.status === 404) {
      console.log('❌ NOT FOUND');
      results.notFound.push(test.name);
    } else if (result.status === 'TIMEOUT') {
      console.log('⏰ TIMEOUT');
      results.timeouts.push(test.name);
    } else if (result.status === 'ERROR') {
      console.log('💥 ERROR');
      results.errors.push(test.name);
    } else {
      console.log(`⚠️  ${result.status}`);
      results.other.push({ name: test.name, status: result.status });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`\n✅ WORKING ROUTES (${results.working.length}):`);
  results.working.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n❌ NOT FOUND ROUTES (${results.notFound.length}):`);
  results.notFound.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n💥 ERROR ROUTES (${results.errors.length}):`);
  results.errors.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n⏰ TIMEOUT ROUTES (${results.timeouts.length}):`);
  results.timeouts.forEach(route => console.log(`  - ${route}`));
  
  console.log(`\n⚠️  OTHER STATUS ROUTES (${results.other.length}):`);
  results.other.forEach(route => console.log(`  - ${route.name}: ${route.status}`));
  
  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL ROUTES TESTED: ${tests.length}`);
  console.log(`WORKING: ${results.working.length} (${Math.round(results.working.length/tests.length*100)}%)`);
  console.log(`NOT FOUND: ${results.notFound.length} (${Math.round(results.notFound.length/tests.length*100)}%)`);
  console.log(`ERRORS: ${results.errors.length} (${Math.round(results.errors.length/tests.length*100)}%)`);
  console.log(`TIMEOUTS: ${results.timeouts.length} (${Math.round(results.timeouts.length/tests.length*100)}%)`);
  console.log(`OTHER: ${results.other.length} (${Math.round(results.other.length/tests.length*100)}%)`);
}

runTests().catch(console.error);
