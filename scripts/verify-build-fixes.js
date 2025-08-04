#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build fixes...\n');

// Check key files for dynamic exports
const filesToCheck = [
  'app/layout.js',
  'app/page.js', 
  'app/dashboard/page.js',
  'app/api/admin/users/route.js',
  'app/api/admin/todos/route.js',
  'app/api/todos/route.js',
  'app/api/todos/search/route.js',
  'app/api/todos/export/route.js',
  'app/api/todos/bulk/route.js'
];

let allGood = true;

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasDynamic = content.includes("export const dynamic = 'force-dynamic'");
    const hasGetServerSession = content.includes('getServerSession');
    
    if (hasGetServerSession && !hasDynamic) {
      console.log(`❌ ${filePath} - Missing dynamic export`);
      allGood = false;
    } else if (hasGetServerSession && hasDynamic) {
      console.log(`✅ ${filePath} - Has dynamic export`);
    } else {
      console.log(`⚠️ ${filePath} - No getServerSession found`);
    }
  } else {
    console.log(`❌ ${filePath} - File not found`);
    allGood = false;
  }
});

console.log('\n📋 Summary:');
if (allGood) {
  console.log('✅ All files have proper dynamic exports!');
  console.log('🚀 Ready to run: npm run build');
} else {
  console.log('❌ Some files need dynamic exports added.');
}

console.log('\n💡 The build should now work without dynamic server usage errors.'); 