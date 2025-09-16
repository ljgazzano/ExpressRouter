#!/usr/bin/env node

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkExpressDependency() {
  try {
    const require = createRequire(import.meta.url);
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');

    let packageJson;
    try {
      packageJson = require(packageJsonPath);
    } catch (error) {
      console.error('❌ Could not find package.json in the current directory');
      process.exit(1);
    }

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const peerDependencies = packageJson.peerDependencies || {};

    const hasExpress = dependencies.express || devDependencies.express || peerDependencies.express;

    if (!hasExpress) {
      console.error('');
      console.error('❌ Express.js is required but not found in dependencies');
      console.error('');
      console.error('ExpressRouter requires Express.js to function properly.');
      console.error('Please install Express.js by running:');
      console.error('');
      console.error('  npm install express');
      console.error('  # or');
      console.error('  yarn add express');
      console.error('');
      console.error('Then try again.');
      console.error('');
      process.exit(1);
    }

    // For peerDependencies, we don't need to check if it's installed locally
    if (peerDependencies.express) {
      console.log('✅ Express.js peerDependency declared - package ready for publication');
    } else {
      try {
        require.resolve('express');
        console.log('✅ Express.js dependency verified');
      } catch (error) {
        console.error('');
        console.error('❌ Express.js is listed in package.json but not installed');
        console.error('');
        console.error('Please run:');
        console.error('  npm install');
        console.error('  # or');
        console.error('  yarn install');
        console.error('');
        process.exit(1);
      }
    }

  } catch (error) {
    console.error('❌ Error checking Express.js dependency:', error.message);
    process.exit(1);
  }
}

checkExpressDependency();