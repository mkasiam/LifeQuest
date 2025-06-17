import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

// Initialize Firebase with config from server
async function initializeFirebase() {
  try {
    const response = await fetch('/api/firebase-config');
    const firebaseConfig = await response.json();
    
    if (!app) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    }
    
    return { app, auth, googleProvider };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Export a promise that resolves to the Firebase instances
export const firebasePromise = initializeFirebase();

// Export individual instances (will be undefined until initialized)
export { auth, googleProvider };

export default app;