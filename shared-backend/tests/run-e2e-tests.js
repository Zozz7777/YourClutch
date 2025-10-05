#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Clutch Partners E2E Tests...\n');

// Test configuration
const testConfig = {
  timeout: 30000,
  reporter: 'spec',
  recursive: true,
  require: [
    path.join(__dirname, 'setup.js')
  ]
};

// Run Jest tests
const jestArgs = [
  '--testPathPattern=tests/e2e',
  '--verbose',
  '--detectOpenHandles',
  '--forceExit',
  '--testTimeout=30000'
];

const jestProcess = spawn('npx', ['jest', ...jestArgs], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

jestProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All E2E tests passed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Some E2E tests failed.');
    process.exit(1);
  }
});

jestProcess.on('error', (error) => {
  console.error('❌ Error running E2E tests:', error);
  process.exit(1);
});
