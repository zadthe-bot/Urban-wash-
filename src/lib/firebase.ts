import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import {
  getMessaging,
  isSupported as isMessagingSupported,
  Messaging,
} from "firebase/messaging";

import firebaseConfigJson from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);


// Firestore
const databaseId = firebaseConfigJson.firestoreDatabaseId;

export const db: Firestore =
  databaseId && databaseId !== "(default)"
    ? getFirestore(app, databaseId)
    : getFirestore(app);


// Firebase Auth
// Used after native Capacitor Google login returns a token
export const auth: Auth = getAuth(app);


// Google Provider
// Used only for web fallback, NOT Android/iOS native login
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});


// Storage
export const storage: FirebaseStorage = getStorage(app);


// Firebase Cloud Messaging
export let messaging: Messaging | null = null;

isMessagingSupported()
  .then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    }
  })
  .catch((error) => {
    console.warn(
      "Firebase messaging not supported:",
      error
    );
  });


// Debug information
console.log(
  "Firebase initialized:",
  firebaseConfig.projectId,
  firebaseConfig.appId
);


export default app;
