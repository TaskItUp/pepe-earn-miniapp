// Environment configuration script
// This script reads environment variables and makes them available to the app

(function() {
    // Try to get environment variables from various sources
    function getEnvVar(name) {
        // Try Node.js style process.env first
        if (typeof process !== 'undefined' && process.env) {
            return process.env[name];
        }
        
        // Try window globals
        if (typeof window !== 'undefined' && window[name]) {
            return window[name];
        }
        
        // Try localStorage for development
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem(name);
        }
        
        return null;
    }

    // Set up environment configuration
    
    window.ENV_CONFIG = {
        FIREBASE_API_KEY: "AIzaSyC0imWOCaNuBs7MuyqDT7eOtBX3YxvKyfM",
        FIREBASE_PROJECT_ID: "peperewardbot",
        FIREBASE_APP_ID: "1:1075087103807:web:f0a0978e7afa7daf2fa58a"
    };

    // Fallback for development - you should replace these with actual values for testing
    if (!window.ENV_CONFIG.FIREBASE_API_KEY) {
        console.warn('Environment variables not found, using fallback configuration');
        window.ENV_CONFIG = {
            FIREBASE_API_KEY: "your-api-key-here",
            FIREBASE_PROJECT_ID: "your-project-id",
            FIREBASE_APP_ID: "your-app-id"
        };
    }

    console.log('Environment configuration loaded:', {
        hasApiKey: !!window.ENV_CONFIG.FIREBASE_API_KEY,
        hasProjectId: !!window.ENV_CONFIG.FIREBASE_PROJECT_ID,
        hasAppId: !!window.ENV_CONFIG.FIREBASE_APP_ID
    });
})();