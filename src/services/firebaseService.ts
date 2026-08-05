import {
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, LaundryOrder, AddressLocation, AppNotification, OrderStatus } from '../types';

const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Sign in with Google Auth (Supports native Capacitor APK and Web browser)
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    let user: FirebaseUser | null = null;

    if (Capacitor.isNativePlatform()) {
      // Native Android / iOS APK flow using @capacitor-firebase/authentication
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        user = userCredential.user;
      }
    } else {
      // Web browser / Preview iframe flow
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user;
    }

    if (user) {
      await ensureUserProfileExists(user);
    }
    return user || auth.currentUser;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      throw new Error(
        `Firebase Auth Domain Authorization Required: "${hostname}" is not authorized in Firebase Console yet. Please add "${hostname}" in Firebase Console > Authentication > Settings > Authorized domains, or click Instant Demo Access below.`
      );
    }
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed or blocked by browser. You can click Instant Customer Demo Access below to test seamlessly.');
    }
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }
  } catch (e) {
    console.warn('Native Capacitor signout error:', e);
  }
  await firebaseSignOut(auth);
}

/**
 * Listen to Auth state changes
 */
export function listenToAuth(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      await ensureUserProfileExists(firebaseUser);
    }
    callback(firebaseUser);
  });
}

/**
 * Ensure user profile exists in Firestore
 */
export async function ensureUserProfileExists(firebaseUser: FirebaseUser): Promise<UserProfile> {
  const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  // Create new user profile document in Firestore
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName || 'Urban Wash Customer',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
    createdAt: new Date().toISOString(),
    savedAddresses: [
      {
        id: 'addr_default_1',
        label: 'Home',
        address: 'Mikocheni B, Rose Garden Road, Dar es Salaam',
        lat: -6.7720,
        lng: 39.2280,
        isDefault: true,
      },
    ],
    defaultLocation: {
      id: 'addr_default_1',
      label: 'Home',
      address: 'Mikocheni B, Rose Garden Road, Dar es Salaam',
      lat: -6.7720,
      lng: 39.2280,
      isDefault: true,
    },
    preferences: {
      detergent: 'Hypoallergenic Scent-Free',
      starchLevel: 'Light',
      foldStyle: 'Standard Fold',
    },
  };

  await setDoc(userDocRef, newProfile);
  return newProfile;
}

/**
 * Fetch User Profile real-time snapshot
 */
export function listenToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  return onSnapshot(userDocRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (err) => {
    console.error('Error listening to user profile:', err);
  });
}

/**
 * Update User Profile document
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userDocRef, updates);
}

/**
 * Add a saved address to profile
 */
export async function addSavedAddress(uid: string, address: AddressLocation): Promise<void> {
  const userDocRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userDocRef, {
    savedAddresses: arrayUnion(address),
    defaultLocation: address.isDefault ? address : undefined,
  });
}

/**
 * Create a new Laundry Order document in Firestore
 */
export async function createLaundryOrder(
  orderData: Omit<LaundryOrder, 'id' | 'orderNumber' | 'timestamp'>
): Promise<string> {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `UW-${randomNum}`;
  const nowIso = new Date().toISOString();

  const newOrderObj = {
    ...orderData,
    orderNumber,
    timestamp: nowIso,
    orderStatus: 'Pickup Requested' as OrderStatus,
  };

  const ordersColRef = collection(db, ORDERS_COLLECTION);
  const docRef = await addDoc(ordersColRef, newOrderObj);

  // Send initial FCM Push Notification
  await sendAppNotification({
    userId: orderData.customerId,
    title: 'Order Submitted! 🧺',
    body: `Your order #${orderNumber} has been received. Finding nearest rider for pickup at ${orderData.pickupLocation}.`,
    orderId: docRef.id,
    type: 'status_update',
  });

  return docRef.id;
}

/**
 * Listen to customer's orders real-time
 */
export function listenToCustomerOrders(customerId: string, callback: (orders: LaundryOrder[]) => void) {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('customerId', '==', customerId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: LaundryOrder[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<LaundryOrder, 'id'>),
    }));
    // Sort in memory by timestamp desc
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(list);
  }, (err) => {
    console.error('Error listening to customer orders:', err);
    callback([]);
  });
}

/**
 * Update Order Status real-time (e.g. simulation or rider update)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  riderInfo?: LaundryOrder['riderInfo']
): Promise<void> {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) return;

  const orderData = snap.data() as LaundryOrder;
  const updates: Partial<LaundryOrder> = {
    orderStatus: newStatus,
  };

  if (riderInfo) {
    updates.riderInfo = riderInfo;
  } else if (newStatus === 'Pickup Assigned' && !orderData.riderInfo) {
    updates.riderInfo = {
      name: 'Juma Bakari',
      phone: '+255 754 882 109',
      vehicle: 'TVS King Bajaj Express (#DAR-202)',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      rating: 4.9,
    };
  }

  await updateDoc(orderRef, updates);

  // Generate FCM Notification for customer
  const notificationMessages: Record<OrderStatus, { title: string; body: string }> = {
    'Pickup Requested': {
      title: 'Pickup Requested ⏱️',
      body: `Order #${orderData.orderNumber} is scheduled for pickup.`,
    },
    'Pickup Assigned': {
      title: 'Rider Assigned! 🛵',
      body: `Rider ${updates.riderInfo?.name || 'Alex'} is assigned to collect your laundry at ${orderData.pickupLocation}.`,
    },
    'Clothes Collected': {
      title: 'Clothes Collected! 🧺',
      body: `Your clothes have been collected and are en route to our laundry hub.`,
    },
    'Washing': {
      title: 'Washing Cycle Started 🧼',
      body: `Your laundry is in the wash using eco-friendly detergent.`,
    },
    'Drying': {
      title: 'Drying & Conditioning 🌀',
      body: `Clothes are tumble-drying at optimal temperature for softness.`,
    },
    'Ready': {
      title: 'Laundry Clean & Ready! ✨',
      body: `Your order is neatly folded, pressed, and ready for dispatch.`,
    },
    'Out for Delivery': {
      title: 'Out for Delivery! 🚚',
      body: `Rider is on the way to deliver your fresh laundry!`,
    },
    'Delivered': {
      title: 'Laundry Delivered! 🎉',
      body: `Order #${orderData.orderNumber} delivered to your door. Enjoy your clean clothes!`,
    },
  };

  const msg = notificationMessages[newStatus];
  await sendAppNotification({
    userId: orderData.customerId,
    title: msg.title,
    body: msg.body,
    orderId,
    type: newStatus === 'Pickup Assigned' ? 'rider_assigned' : newStatus === 'Delivered' ? 'delivery' : 'status_update',
  });
}

/**
 * Send App Notification (FCM In-App + Document)
 */
export async function sendAppNotification(
  notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
): Promise<string> {
  const notifObj = {
    ...notif,
    timestamp: new Date().toISOString(),
    read: false,
  };
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  const res = await addDoc(colRef, notifObj);
  return res.id;
}

/**
 * Listen to Customer Notifications
 */
export function listenToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const list: AppNotification[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<AppNotification, 'id'>),
    }));
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(list);
  }, (err) => {
    console.error('Error listening to notifications:', err);
    callback([]);
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notifId: string): Promise<void> {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, notifId);
  await updateDoc(ref, { read: true });
}
