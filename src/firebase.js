import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where, setDoc, doc } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db, storage;
let isMock = false;

const listeners = new Set();
const triggerListeners = (user) => {
  listeners.forEach(cb => cb(user));
};

// Initialize Firebase only if config is provided
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here') {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Firebase initialization failed, falling back to mock mode:", e);
    isMock = true;
  }
} else {
  isMock = true;
}

if (isMock) {
  app = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      listeners.add(callback);
      const stored = localStorage.getItem('mock_user');
      const user = stored ? JSON.parse(stored) : null;
      auth.currentUser = user;
      setTimeout(() => callback(user), 50);
      return () => {
        listeners.delete(callback);
      };
    }
  };
  db = {};
  storage = null;
  console.warn("Using mock Firebase services because credentials are not configured.");
}

export { auth, db, storage, isMock, triggerListeners };
