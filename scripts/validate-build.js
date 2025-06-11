#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const libPath = './lib';
const requiredExtensions = ['.js', '.d.ts'];
const errors = [];

// Check if lib directory exists
if (!existsSync(libPath)) {
  console.error('❌ Error: lib directory does not exist. Run "npm run build" first.');
  process.exit(1);
}

// Get all files in lib directory recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(libPath);
const jsFiles = allFiles.filter(f => extname(f) === '.js');
const dtsFiles = allFiles.filter(f => f.endsWith('.d.ts'));
const mapFiles = allFiles.filter(f => f.endsWith('.map'));

// Check for JavaScript files
if (jsFiles.length === 0) {
  errors.push('No JavaScript files found in lib directory');
}

// Check for TypeScript declaration files
if (dtsFiles.length === 0) {
  errors.push('No TypeScript declaration files (.d.ts) found in lib directory');
}

// Check that each JS file has a corresponding .d.ts file
jsFiles.forEach((jsFile) => {
  const dtsFile = jsFile.replace(/\.js$/, '.d.ts');
  if (!allFiles.includes(dtsFile)) {
    errors.push(`Missing declaration file for ${jsFile}`);
  }
});

// Check for source maps
const jsMapFiles = allFiles.filter(f => f.endsWith('.js.map'));
const dtsMapFiles = allFiles.filter(f => f.endsWith('.d.ts.map'));

if (jsMapFiles.length === 0) {
  errors.push('No JavaScript source map files (.js.map) found');
}

if (dtsMapFiles.length === 0) {
  errors.push('No TypeScript declaration map files (.d.ts.map) found');
}

// Check that each JS file has a source map
jsFiles.forEach((jsFile) => {
  const mapFile = jsFile + '.map';
  if (!allFiles.includes(mapFile)) {
    errors.push(`Missing source map for ${jsFile}`);
  }
});

// Report results
if (errors.length > 0) {
  console.error('❌ Build validation failed:');
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
} else {
  console.log('✅ Build validation passed:');
  console.log(`  - ${jsFiles.length} JavaScript files`);
  console.log(`  - ${dtsFiles.length} TypeScript declaration files`);
  console.log(`  - ${jsMapFiles.length} JavaScript source maps`);
  console.log(`  - ${dtsMapFiles.length} TypeScript declaration maps`);
}