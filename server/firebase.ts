import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Get Realtime Database instance
const firebaseDb = getDatabase(firebaseApp);

export { firebaseApp, firebaseDb };