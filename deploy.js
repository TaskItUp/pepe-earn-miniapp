#!/usr/bin/env node

// Simple deployment script to prepare the app for hosting
const fs = require('fs');
const path = require('path');

function replaceEnvironmentVariables() {
    console.log('Setting up environment configuration for deployment...');
    
    // Read the env-config.js file
    const envConfigPath = path.join(__dirname, 'env-config.js');
    let envConfig = fs.readFileSync(envConfigPath, 'utf8');
    
    // Replace environment variable placeholders with actual values
    const envVars = {
        'VITE_FIREBASE_API_KEY': process.env.VITE_FIREBASE_API_KEY,
        'VITE_FIREBASE_PROJECT_ID': process.env.VITE_FIREBASE_PROJECT_ID,
        'VITE_FIREBASE_APP_ID': process.env.VITE_FIREBASE_APP_ID
    };
    
    // Replace the fallback configuration with actual values
    const actualConfig = `
    window.ENV_CONFIG = {
        FIREBASE_API_KEY: "${envVars.VITE_FIREBASE_API_KEY}",
        FIREBASE_PROJECT_ID: "${envVars.VITE_FIREBASE_PROJECT_ID}",
        FIREBASE_APP_ID: "${envVars.VITE_FIREBASE_APP_ID}"
    };`;
    
    // Replace the configuration section
    envConfig = envConfig.replace(
        /window\.ENV_CONFIG = \{[\s\S]*?\};/,
        actualConfig
    );
    
    // Write the updated file
    fs.writeFileSync(envConfigPath, envConfig);
    
    console.log('Environment configuration updated successfully!');
    console.log('Configuration values:');
    console.log('- API Key:', envVars.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing');
    console.log('- Project ID:', envVars.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing');
    console.log('- App ID:', envVars.VITE_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing');
}

// Run the deployment setup
if (require.main === module) {
    replaceEnvironmentVariables();
}

module.exports = { replaceEnvironmentVariables };