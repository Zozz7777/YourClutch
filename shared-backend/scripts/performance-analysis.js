#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Identifies and fixes slow request bottlenecks (8000ms+)
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.BASE_URL || 'https://clutch-main-nk7x.onrender.com';

console.log('🔍 Performance Analysis - Identifying 8000ms+ Request Bottlenecks');
console.log(`🌐 Testing against: ${BASE_URL}`);
console.log('============================================================\n');

// Performance bottlenecks identified
const bottlenecks = {
  middleware: [],
  database: [],
  external: [],
  email: [],
  ai: [],
  file: []
};

// Test different endpoints for performance
async function testEndpointPerformance(endpoint, method = 'GET', data = null) {
  const startTime = performance.now();
  
  try {
    let response;
    if (method === 'GET') {
      response = await axios.get(`${BASE_URL}${endpoint}`, { timeout: 30000 });
    } else if (method === 'POST') {
      response = await axios.post(`${BASE_URL}${endpoint}`, data, { timeout: 30000 });
    }
    
    const duration = performance.now() - startTime;
    
    return {
      endpoint,
      method,
      duration: Math.round(duration),
      status: response.status,
      success: duration < 2000, // Should be under 2 seconds
      slow: duration > 8000, // Flag as extremely slow
      size: response.data ? JSON.stringify(response.data).length : 0
    };
  } catch (error) {
    const duration = performance.now() - startTime;
    return {
      endpoint,
      method,
      duration: Math.round(duration),
      status: error.response?.status || 'ERROR',
      success: false,
      slow: duration > 8000,
      error: error.message
    };
  }
}

// Test critical endpoints
async function runPerformanceTests() {
  console.log('🚀 Running comprehensive performance tests...\n');
  
  const tests = [
    // Basic endpoints
    { endpoint: '/', method: 'GET' },
    { endpoint: '/health', method: 'GET' },
    { endpoint: '/ping', method: 'GET' },
    
    // Auth endpoints
    { endpoint: '/api/v1/auth/login', method: 'POST', data: { email: 'test@test.com', password: 'test' } },
    { endpoint: '/api/v1/auth/register', method: 'POST', data: { email: 'test@test.com', password: 'test', name: 'Test User' } },
    
    // Protected endpoints (will return 401)
    { endpoint: '/api/v1/fleet/vehicles', method: 'GET' },
    { endpoint: '/api/v1/bookings', method: 'GET' },
    { endpoint: '/api/v1/payments', method: 'GET' },
    { endpoint: '/api/v1/admin/users', method: 'GET' },
    
    // Complex endpoints
    { endpoint: '/api/v1/procurement/requests', method: 'GET' },
    { endpoint: '/api/v1/analytics/performance', method: 'GET' },
    { endpoint: '/api/v1/partners', method: 'GET' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`🔄 Testing: ${test.method} ${test.endpoint}`);
    const result = await testEndpointPerformance(test.endpoint, test.method, test.data);
    results.push(result);
    
    if (result.slow) {
      console.log(`🐌 SLOW: ${result.duration}ms - ${test.method} ${test.endpoint}`);
    } else if (result.success) {
      console.log(`✅ FAST: ${result.duration}ms - ${test.method} ${test.endpoint}`);
    } else {
      console.log(`⚠️ MODERATE: ${result.duration}ms - ${test.method} ${test.endpoint}`);
    }
  }
  
  return results;
}

// Analyze bottlenecks
function analyzeBottlenecks(results) {
  console.log('\n🔍 Analyzing Performance Bottlenecks...\n');
  
  const slowRequests = results.filter(r => r.slow);
  const moderateRequests = results.filter(r => !r.success && !r.slow);
  const fastRequests = results.filter(r => r.success);
  
  console.log(`📊 Performance Summary:`);
  console.log(`   🐌 Extremely Slow (>8000ms): ${slowRequests.length}`);
  console.log(`   ⚠️ Moderate (2000-8000ms): ${moderateRequests.length}`);
  console.log(`   ✅ Fast (<2000ms): ${fastRequests.length}`);
  
  if (slowRequests.length > 0) {
    console.log('\n🐌 Extremely Slow Requests (>8000ms):');
    slowRequests.forEach(req => {
      console.log(`   - ${req.method} ${req.endpoint}: ${req.duration}ms`);
      if (req.error) console.log(`     Error: ${req.error}`);
    });
  }
  
  if (moderateRequests.length > 0) {
    console.log('\n⚠️ Moderate Performance Issues (2000-8000ms):');
    moderateRequests.forEach(req => {
      console.log(`   - ${req.method} ${req.endpoint}: ${req.duration}ms`);
    });
  }
  
  // Identify common patterns
  console.log('\n🔍 Bottleneck Analysis:');
  
  // Database-heavy endpoints
  const dbEndpoints = results.filter(r => 
    r.endpoint.includes('/procurement') || 
    r.endpoint.includes('/analytics') || 
    r.endpoint.includes('/admin') ||
    r.endpoint.includes('/partners')
  );
  
  if (dbEndpoints.some(r => r.slow)) {
    console.log('   🗄️ Database Performance Issues:');
    console.log('     - Complex queries without proper indexing');
    console.log('     - Missing database connection pooling');
    console.log('     - Inefficient aggregation pipelines');
    console.log('     - Large dataset operations without pagination');
  }
  
  // Auth endpoints
  const authEndpoints = results.filter(r => r.endpoint.includes('/auth'));
  if (authEndpoints.some(r => r.slow)) {
    console.log('   🔐 Authentication Performance Issues:');
    console.log('     - Password hashing taking too long');
    console.log('     - Database user lookup inefficiencies');
    console.log('     - JWT token generation overhead');
    console.log('     - Email service timeouts');
  }
  
  // External service dependencies
  if (results.some(r => r.slow && (r.endpoint.includes('/email') || r.endpoint.includes('/notification')))) {
    console.log('   📧 External Service Issues:');
    console.log('     - SMTP server timeouts');
    console.log('     - Email service rate limiting');
    console.log('     - Network connectivity issues');
  }
  
  return {
    slowRequests,
    moderateRequests,
    fastRequests,
    totalTests: results.length,
    averageResponseTime: Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
  };
}

// Generate optimization recommendations
function generateOptimizations(analysis) {
  console.log('\n💡 Optimization Recommendations:\n');
  
  const recommendations = [];
  
  if (analysis.slowRequests.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Database Optimization',
      actions: [
        'Add database indexes for frequently queried fields',
        'Implement query result caching with Redis',
        'Optimize aggregation pipelines',
        'Add database connection pooling',
        'Implement query timeout limits'
      ]
    });
    
    recommendations.push({
      priority: 'HIGH',
      category: 'Middleware Optimization',
      actions: [
        'Reduce middleware stack complexity',
        'Implement request-level caching',
        'Add request timeout middleware',
        'Optimize body parsing limits',
        'Remove redundant middleware layers'
      ]
    });
  }
  
  if (analysis.averageResponseTime > 3000) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'General Performance',
      actions: [
        'Implement response compression',
        'Add request batching for multiple operations',
        'Optimize JSON serialization',
        'Add response caching headers',
        'Implement lazy loading for large datasets'
      ]
    });
  }
  
  recommendations.push({
    priority: 'LOW',
    category: 'Monitoring & Alerting',
    actions: [
      'Add performance monitoring middleware',
      'Implement slow query logging',
      'Set up performance alerts',
      'Add request tracing',
      'Monitor memory usage patterns'
    ]
  });
  
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec.priority} PRIORITY - ${rec.category}:`);
    rec.actions.forEach(action => {
      console.log(`   • ${action}`);
    });
    console.log('');
  });
  
  return recommendations;
}

// Main execution
async function main() {
  try {
    const results = await runPerformanceTests();
    const analysis = analyzeBottlenecks(results);
    const optimizations = generateOptimizations(analysis);
    
    console.log('============================================================');
    console.log('🎯 Performance Analysis Complete');
    console.log('============================================================');
    console.log(`📊 Total Tests: ${analysis.totalTests}`);
    console.log(`🐌 Slow Requests: ${analysis.slowRequests.length}`);
    console.log(`⚠️ Moderate Requests: ${analysis.moderateRequests.length}`);
    console.log(`✅ Fast Requests: ${analysis.fastRequests.length}`);
    console.log(`⏱️ Average Response Time: ${analysis.averageResponseTime}ms`);
    
    if (analysis.slowRequests.length > 0) {
      console.log('\n🚨 CRITICAL: Found extremely slow requests (>8000ms)');
      console.log('   Immediate action required to improve user experience');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Implement database optimizations');
    console.log('   2. Add request caching');
    console.log('   3. Optimize middleware stack');
    console.log('   4. Add performance monitoring');
    console.log('   5. Test optimizations');
    
  } catch (error) {
    console.error('❌ Performance analysis failed:', error.message);
    process.exit(1);
  }
}

// Run the analysis
main();
