#!/usr/bin/env node

/**
 * Fix MongoDB Deprecated Options Script
 * Removes useNewUrlParser and useUnifiedTopology from all MongoDB connection configurations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing MongoDB deprecated options across the codebase...');

// Files to fix (based on grep results)
const filesToFix = [
  'scripts/create-procurement-indexes.js',
  'tests/setup.js',
  'scripts/test-rbac.js',
  'scripts/setup-rbac.js',
  'scripts/seeding/scripts/verify-car-data.js',
  'scripts/seeding/scripts/seed-ultimate-egypt-cars.js',
  'scripts/seeding/scripts/seed-egypt-cars.js',
  'scripts/seeding/scripts/seed-complete-egypt-cars.js',
  'scripts/seeding/scripts/seed-all-egypt-cars.js',
  'scripts/seeding/config/database-config.js',
  'scripts/quick-cleanup-test-users.js',
  'scripts/fix-user-phone.js',
  'scripts/direct-ceo-update.js',
  'scripts/debug-user-search.js',
  'scripts/database-audit.js',
  'scripts/cleanup-test-users.js',
  'config/simplified.js',
  'config/production.js'
];

let fixedFiles = 0;
let totalFiles = filesToFix.length;

for (const filePath of filesToFix) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Remove useNewUrlParser: true,
      if (content.includes('useNewUrlParser: true,')) {
        content = content.replace(/useNewUrlParser: true,\s*/g, '');
        modified = true;
      }
      
      // Remove useUnifiedTopology: true,
      if (content.includes('useUnifiedTopology: true,')) {
        content = content.replace(/useUnifiedTopology: true,\s*/g, '');
        modified = true;
      }
      
      // Remove useNewUrlParser: true
      if (content.includes('useNewUrlParser: true')) {
        content = content.replace(/useNewUrlParser: true\s*/g, '');
        modified = true;
      }
      
      // Remove useUnifiedTopology: true
      if (content.includes('useUnifiedTopology: true')) {
        content = content.replace(/useUnifiedTopology: true\s*/g, '');
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        fixedFiles++;
      } else {
        console.log(`⚠️ No changes needed: ${filePath}`);
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log(`\n🎯 Summary:`);
console.log(`📁 Total files processed: ${totalFiles}`);
console.log(`✅ Files fixed: ${fixedFiles}`);
console.log(`⚠️ Files unchanged: ${totalFiles - fixedFiles}`);

if (fixedFiles > 0) {
  console.log('\n✨ MongoDB deprecated options have been removed!');
  console.log('🚀 The warnings should no longer appear in the deployment logs.');
} else {
  console.log('\n🤔 No files needed fixing. All MongoDB options may already be up to date.');
}
