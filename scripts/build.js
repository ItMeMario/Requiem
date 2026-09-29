const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const target = args.includes('apk') ? 'apk' : 'desktop';
const isDev = args.includes('dev');

const rootDir = path.resolve(__dirname, '..');

try {
  if (target === 'apk') {
    console.log(isDev ? 'Building Mobile APK (Development)...' : 'Building Mobile APK (Production)...');
    
    // Sync capacitor and build APK
    if (isDev) {
      execSync('npm run cap:sync:dev && cd android && gradlew.bat clean assembleDebug', { stdio: 'inherit', cwd: rootDir });
    } else {
      execSync('npm run cap:sync && cd android && gradlew.bat clean assembleRelease', { stdio: 'inherit', cwd: rootDir });
    }
    
    // Create dist/mobile and copy APK
    const mobileDistPath = path.join(rootDir, 'dist', 'mobile');
    fs.mkdirSync(mobileDistPath, { recursive: true });
    
    const apkSourcePath = isDev 
      ? path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')
      : path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
      
    const backupApkSourcePath = !isDev 
      ? path.join(rootDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk')
      : null;

    const apkDestPath = path.join(mobileDistPath, isDev ? 'requiem-dev.apk' : 'requiem.apk');
    
    let sourceFile = null;
    if (fs.existsSync(apkSourcePath)) {
      sourceFile = apkSourcePath;
    } else if (backupApkSourcePath && fs.existsSync(backupApkSourcePath)) {
      sourceFile = backupApkSourcePath;
    }

    if (sourceFile) {
      fs.copyFileSync(sourceFile, apkDestPath);
      console.log(`\n✅ APK successfully generated and copied to dist/mobile/${path.basename(apkDestPath)}`);
    } else {
      throw new Error(`APK file not found at ${apkSourcePath}`);
    }
  } else {
    console.log(isDev ? 'Building Desktop application (Development)...' : 'Building Desktop application (Production)...');
    
    if (isDev) {
      execSync('npm run build:dev', { stdio: 'inherit', cwd: rootDir });
    } else {
      execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
    }
    console.log('\n✅ Desktop build completed in dist/desktop');
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
