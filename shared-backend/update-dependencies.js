#!/usr/bin/env node

/**
 * Comprehensive Dependency Update Script for Clutch Backend
 * Updates all dependencies to their latest versions with safety checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Clutch Backend Dependency Update Script');
console.log('==========================================\n');

// Critical packages that need careful handling
const CRITICAL_PACKAGES = {
  'express': { from: '^4.18.2', to: '^5.1.0', breaking: true },
  'mongoose': { from: '^8.0.3', to: '^8.19.0', breaking: false },
  'mongodb': { from: '^6.3.0', to: '^6.20.0', breaking: false },
  'redis': { from: '^4.6.12', to: '^5.8.3', breaking: true },
  'helmet': { from: '^7.1.0', to: '^8.1.0', breaking: true },
  'stripe': { from: '^14.9.0', to: '^19.1.0', breaking: true },
  'openai': { from: '^4.20.1', to: '^6.1.0', breaking: true },
  'twilio': { from: '^4.19.0', to: '^5.10.2', breaking: true }
};

// Safe packages for immediate update
const SAFE_PACKAGES = [
  'sharp', 'express-validator', 'axios', 'dotenv', 'fs-extra',
  'winston', 'uuid', 'joi', 'lodash', 'moment', 'multer',
  'nodemailer', 'socket.io', 'socket.io-client', 'ws',
  'bcryptjs', 'jsonwebtoken', 'cors', 'compression', 'helmet',
  'express-rate-limit', 'express-mongo-sanitize', 'xss-clean',
  'bull', 'agenda', 'node-cron', 'node-schedule', 'cron',
  'commander', 'inquirer', 'chalk', 'boxen', 'gradient-string',
  'figlet', 'ora', 'nanospinner', 'progress', 'listr2',
  'envinfo', 'kleur', 'config', 'nconf', 'cross-env',
  'concurrently', 'cheerio', 'jsdom', 'pm2', 'nodemon',
  'swagger-ui-express', 'qrcode', 'firebase-admin',
  'pdf-lib', 'pdfkit', 'pizzip', 'docxtemplater',
  'unzipper', 'archiver', 'csv-parser', 'exceljs',
  'form-data', 'public-ip', 'network-interfaces',
  'morgan', 'ioredis', 'node-cache', 'rate-limit-redis',
  'speakeasy', 'connect-timeout', 'hpp', 'yargs'
];

async function backupCurrentPackageJson() {
  console.log('📦 Creating backup of current package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const backupPath = path.join(__dirname, 'package.json.backup');
  
  if (fs.existsSync(packageJsonPath)) {
    fs.copyFileSync(packageJsonPath, backupPath);
    console.log('✅ Backup created: package.json.backup\n');
  }
}

async function updateSafePackages() {
  console.log('🔧 Updating safe packages...');
  
  for (const packageName of SAFE_PACKAGES) {
    try {
      console.log(`   📦 Updating ${packageName}...`);
      execSync(`npm install ${packageName}@latest`, { stdio: 'pipe' });
      console.log(`   ✅ ${packageName} updated successfully`);
    } catch (error) {
      console.log(`   ⚠️  ${packageName} update failed: ${error.message}`);
    }
  }
  console.log('');
}

async function updateCriticalPackages() {
  console.log('⚠️  Updating critical packages (may require code changes)...');
  
  for (const [packageName, info] of Object.entries(CRITICAL_PACKAGES)) {
    try {
      console.log(`   📦 Updating ${packageName} from ${info.from} to ${info.to}...`);
      
      if (info.breaking) {
        console.log(`   ⚠️  ${packageName} has breaking changes - manual review required`);
      }
      
      execSync(`npm install ${packageName}@${info.to.replace('^', '')}`, { stdio: 'pipe' });
      console.log(`   ✅ ${packageName} updated successfully`);
    } catch (error) {
      console.log(`   ❌ ${packageName} update failed: ${error.message}`);
    }
  }
  console.log('');
}

async function updateDevDependencies() {
  console.log('🛠️  Updating development dependencies...');
  
  const devPackages = [
    'eslint', 'eslint-config-airbnb-base', 'eslint-plugin-import',
    'eslint-plugin-jest', 'eslint-plugin-node', 'eslint-plugin-promise',
    'eslint-plugin-security', 'jest', 'mongodb-memory-server', 'supertest'
  ];
  
  for (const packageName of devPackages) {
    try {
      console.log(`   📦 Updating dev dependency ${packageName}...`);
      execSync(`npm install --save-dev ${packageName}@latest`, { stdio: 'pipe' });
      console.log(`   ✅ ${packageName} updated successfully`);
    } catch (error) {
      console.log(`   ⚠️  ${packageName} update failed: ${error.message}`);
    }
  }
  console.log('');
}

async function runSecurityAudit() {
  console.log('🔒 Running security audit...');
  try {
    execSync('npm audit', { stdio: 'inherit' });
    console.log('✅ Security audit completed\n');
  } catch (error) {
    console.log('⚠️  Security vulnerabilities found - run npm audit fix\n');
  }
}

async function generateUpdateReport() {
  console.log('📊 Generating update report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    criticalUpdates: CRITICAL_PACKAGES,
    safeUpdates: SAFE_PACKAGES,
    recommendations: [
      'Review Express v5 migration guide for breaking changes',
      'Update Redis client usage for v5 compatibility',
      'Review Stripe API changes for v19 compatibility',
      'Update OpenAI client usage for v6 compatibility',
      'Test all authentication flows after updates',
      'Verify WebSocket connections after Socket.IO updates',
      'Test file upload functionality after Multer v2 update',
      'Review Helmet v8 security configuration',
      'Test payment processing with Stripe v19',
      'Verify AI integrations with updated SDKs'
    ]
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'dependency-update-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Update report generated: dependency-update-report.json\n');
}

async function main() {
  try {
    await backupCurrentPackageJson();
    await updateSafePackages();
    await updateCriticalPackages();
    await updateDevDependencies();
    await runSecurityAudit();
    await generateUpdateReport();
    
    console.log('🎉 Dependency update completed!');
    console.log('📋 Next steps:');
    console.log('   1. Review the update report');
    console.log('   2. Test your application thoroughly');
    console.log('   3. Update code for breaking changes');
    console.log('   4. Run npm test to verify everything works');
    console.log('   5. Deploy to staging environment first\n');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
    console.log('🔄 Restore from backup: cp package.json.backup package.json');
    process.exit(1);
  }
}

// Run the update process
main();
