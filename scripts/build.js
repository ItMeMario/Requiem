const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const target = process.argv[2];

const rootDir = path.resolve(__dirname, '..');

try {
  if (target === 'apk') {
    console.log('Building Mobile APK...');
    // Sync capacitor and build APK
    execSync('npm run cap:sync && cd android && gradlew.bat assembleDebug', { stdio: 'inherit', cwd: rootDir });
    
    // Create dist/mobile and copy APK
    const mobileDistPath = path.join(rootDir, 'dist', 'mobile');
    fs.mkdirSync(mobileDistPath, { recursive: true });
    
    const apkSourcePath = path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    const apkDestPath = path.join(mobileDistPath, 'requiem.apk');
    
    if (fs.existsSync(apkSourcePath)) {
      fs.copyFileSync(apkSourcePath, apkDestPath);
      console.log(`\n✅ APK successfully generated and copied to dist/mobile/requiem.apk`);
    } else {
      throw new Error(`APK file not found at ${apkSourcePath}`);
    }
  } else {
    console.log('Building Desktop application...');
    // Build vite and electron, then run electron-builder
    execSync('npm run build:vite && npm run build:electron && electron-builder', { stdio: 'inherit', cwd: rootDir });
    console.log('\n✅ Desktop build completed in dist/desktop');
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
