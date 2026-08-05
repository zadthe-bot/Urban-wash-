import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging, isSupported as isMessagingSupported, Messaging } from 'firebase/messaging';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize App
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if specified
const dbId = firebaseConfigJson.firestoreDatabaseId;
export const db: Firestore = dbId && dbId !== '(default)'
  ? getFirestore(app, dbId)
  : getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Storage
export const storage = getStorage(app);

// Messaging (Async safe)
export let messaging: Messaging | null = null;

isMessagingSupported().then((supported) => {
  if (supported) {
    try {
      messaging = getMessaging(app);
    } catch (err) {
      console.warn('FCM not initialized in this environment:', err);
    }
  }
}).catch(() => {
  // Push messaging not supported in environment
});

export default app;
