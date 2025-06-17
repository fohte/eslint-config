#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Read package.json to understand expected structure
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

// Run npm pack --dry-run and capture output (including stderr)
console.log('Running npm pack --dry-run...\n');
const output = execSync('npm pack --dry-run 2>&1', {
  cwd: rootDir,
  encoding: 'utf8',
  shell: true
});

// Parse files from output
const lines = output.split('\n');
const filesSection = [];
let inTarballContents = false;

for (const line of lines) {
  if (line.includes('Tarball Contents')) {
    inTarballContents = true;
    continue;
  }
  if (line.includes('Tarball Details')) {
    break;
  }
  if (inTarballContents && line.trim()) {
    // Extract filename from lines like "npm notice 2.3kB README.md"
    const match = line.match(/npm notice\s+[\d.]+[kMG]?B\s+(.+)$/);
    if (match) {
      filesSection.push(match[1]);
    }
  }
}

console.log(`Found ${filesSection.length} files in package:\n`);
filesSection.forEach(file => console.log(`  - ${file}`));
console.log('');

// Validation rules
const validationRules = {
  required: [
    // Package metadata
    { file: 'README.md', reason: 'Package documentation' },
    { file: 'package.json', reason: 'Package manifest' },

    // Main entry points from package.json
    { file: packageJson.main, reason: 'Main entry point' },
    { file: packageJson.types, reason: 'TypeScript definitions' },

    // Export paths
    ...Object.entries(packageJson.exports || {}).flatMap(([key, value]) => {
      const results = [];
      if (typeof value === 'object') {
        if (value.import) results.push({ file: value.import.replace(/^\.\//, ''), reason: `Export "${key}" import` });
        if (value.types) results.push({ file: value.types.replace(/^\.\//, ''), reason: `Export "${key}" types` });
      }
      return results;
    }),

    // Type definition files
    { file: 'lib/types/eslint-config-prettier.d.ts', reason: 'Type definitions' },
    { file: 'lib/types/eslint-plugin-import.d.ts', reason: 'Type definitions' },
    { file: 'lib/types/eslint-plugin-simple-import-sort.d.ts', reason: 'Type definitions' },
  ],

  forbidden: [
    { pattern: /\.map$/, reason: 'Source maps should not be published' },
    { pattern: /\.test\.|\.spec\./, reason: 'Test files should not be published' },
    { pattern: /\/__tests__\//, reason: 'Test directories should not be published' },
    { pattern: /^src\//, reason: 'Source files should not be published' },
    { pattern: /^tsconfig\.json$/, reason: 'TypeScript config should not be published' },
    { pattern: /^vitest\.config/, reason: 'Test config should not be published' },
    { pattern: /^eslint\.config\.js$/, reason: 'ESLint config should not be published' },
    { pattern: /^\./, reason: 'Hidden files should not be published' },
    { pattern: /node_modules/, reason: 'Dependencies should not be published' },
  ]
};

let hasErrors = false;

// Check required files
console.log('Checking required files...\n');
for (const { file, reason } of validationRules.required) {
  if (filesSection.includes(file)) {
    console.log(`✓ ${file} - ${reason}`);
  } else {
    console.log(`✗ ${file} - ${reason} [MISSING]`);
    hasErrors = true;
  }
}

// Check forbidden patterns
console.log('\nChecking for forbidden files...\n');
for (const { pattern, reason } of validationRules.forbidden) {
  const matches = filesSection.filter(file => pattern.test(file));
  if (matches.length > 0) {
    console.log(`✗ Found forbidden files - ${reason}:`);
    matches.forEach(file => console.log(`  - ${file}`));
    hasErrors = true;
  } else {
    console.log(`✓ No files matching ${pattern} - ${reason}`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Package validation FAILED!');
  process.exit(1);
} else {
  console.log('✅ Package validation PASSED!');
  console.log(`\nPackage contains ${filesSection.length} files totaling ${output.match(/unpacked size: ([\d.]+\s*[kMG]?B)/)?.[1] || 'unknown size'}`);
}
