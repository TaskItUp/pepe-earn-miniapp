// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: window.ENV_CONFIG.FIREBASE_API_KEY,
    authDomain: `${window.ENV_CONFIG.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: window.ENV_CONFIG.FIREBASE_PROJECT_ID,
    storageBucket: `${window.ENV_CONFIG.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: "123456789",
    appId: window.ENV_CONFIG.FIREBASE_APP_ID
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    increment,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firebase utilities
window.firebase = {
    db,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs
};

console.log('Firebase initialized successfully');
