import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  listenToAuth,
  listenToUserProfile,
  listenToCustomerOrders,
  listenToNotifications,
  markNotificationRead,
  addSavedAddress,
  ensureUserProfileExists,
} from './services/firebaseService';
import { UserProfile, LaundryOrder, AppNotification, AddressLocation, CapacitorPlatform } from './types';
import { CapacitorShell } from './components/CapacitorShell';
import { AuthModal } from './components/AuthModal';
import { MapLocationPicker } from './components/MapLocationPicker';
import { NotificationDrawer } from './components/NotificationDrawer';
import { HomeScreen } from './pages/HomeScreen';
import { SchedulePickupScreen } from './pages/SchedulePickupScreen';
import { OrderTrackingScreen } from './pages/OrderTrackingScreen';
import { OrderHistoryScreen } from './pages/OrderHistoryScreen';
import { ProfileScreen } from './pages/ProfileScreen';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'orders' | 'profile'>('home');
  const [platform, setPlatform] = useState<CapacitorPlatform>('ios');

  const [orders, setOrders] = useState<LaundryOrder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);

  // 1. Listen to Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = listenToAuth((authUser) => {
      setUser(authUser);
      setLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. Listen to User Profile snapshot in Firestore
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    const unsubProfile = listenToUserProfile(user.uid, (prof) => {
      setUserProfile(prof);
      // Check if user has no saved addresses (First Launch Location Setup)
      if (prof && (!prof.savedAddresses || prof.savedAddresses.length === 0)) {
        setIsFirstLaunch(true);
        setShowLocationPicker(true);
      }
    });
    return () => unsubProfile();
  }, [user]);

  // 3. Listen to Customer Orders snapshot in Firestore
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    const unsubOrders = listenToCustomerOrders(user.uid, (ordList) => {
      setOrders(ordList);
    });
    return () => unsubOrders();
  }, [user]);

  // 4. Listen to Notifications snapshot in Firestore
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    const unsubNotifs = listenToNotifications(user.uid, (notifList) => {
      setNotifications(notifList);
    });
    return () => unsubNotifs();
  }, [user]);

  // Demo Sign-In Handler for easy instant preview access
  const handleDemoSignIn = async () => {
    try {
      const demoUid = 'demo_user_urbanwash_8821';
      const mockFirebaseUser = {
        uid: demoUid,
        displayName: 'Isihaka (Customer)',
        email: 'isihakakabaju9@gmail.com',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      } as FirebaseUser;

      setUser(mockFirebaseUser);
      const prof = await ensureUserProfileExists(mockFirebaseUser);
      setUserProfile(prof);

      // Check if user has an existing order in Firestore, otherwise seed an active order for testing
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db, createLaundryOrder } = await import('./services/firebaseService');
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('customerId', '==', demoUid));
      const snap = await getDocs(q);

      if (snap.empty) {
        await createLaundryOrder({
          customerId: demoUid,
          customerName: 'Isihaka (Customer)',
          customerPhone: '+255 754 123 456',
          pickupLocation: 'Mikocheni B, Rose Garden Road, Dar es Salaam',
          latitude: -6.7720,
          longitude: 39.2280,
          clothingItems: [
            { itemId: 'shirts_blouses', name: 'Shirts & Blouses', quantity: 3, unitPriceTSh: 3000 },
            { itemId: 'trousers_pants', name: 'Trousers & Pants', quantity: 2, unitPriceTSh: 3500 },
            { itemId: 'suits_jackets', name: 'Suits & Jackets', quantity: 1, unitPriceTSh: 8000 },
          ],
          servicesRequired: ['Wash and fold', 'Perfume treatment'],
          paymentMethod: 'M-Pesa (Vodacom)',
          paymentPhone: '+255 754 123 456',
          paymentStatus: 'Paid (Mobile Money)',
          quantitySummary: '6 clothing items',
          instructions: 'Perfume Softener | Light Starch on collar',
          pickupTime: 'Today (2:00 PM - 4:00 PM)',
          priceEstimateTSh: 27000,
          subtotalTSh: 24000,
          deliveryFeeTSh: 3000,
          orderStatus: 'Pickup Assigned',
          riderInfo: {
            name: 'Juma Bakari',
            phone: '+255 754 882 109',
            vehicle: 'TVS King Bajaj Express (#DAR-202)',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            rating: 4.9,
          },
        });
      }
    } catch (err) {
      console.error('Demo sign-in error:', err);
    }
  };

  // Location confirm handler
  const handleLocationConfirmed = async (newLoc: AddressLocation) => {
    if (userProfile) {
      await addSavedAddress(userProfile.uid, newLoc);
    }
    setShowLocationPicker(false);
    setIsFirstLaunch(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3 text-cyan-400">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono">Initializing Urban Wash App...</p>
      </div>
    );
  }

  // If user is not logged in, show Auth Modal
  if (!user || !userProfile) {
    return (
      <CapacitorShell
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        platform={platform}
        onChangePlatform={setPlatform}
        unreadNotifCount={0}
        onOpenNotifications={() => {}}
      >
        <AuthModal onDemoSignIn={handleDemoSignIn} />
      </CapacitorShell>
    );
  }

  const activeOrders = orders.filter((o) => o.orderStatus !== 'Delivered');

  return (
    <CapacitorShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      platform={platform}
      onChangePlatform={setPlatform}
      unreadNotifCount={unreadCount}
      onOpenNotifications={() => setShowNotificationsDrawer(true)}
      currentAddressLabel={userProfile.defaultLocation?.address}
      onOpenLocationSetup={() => setShowLocationPicker(true)}
    >
      {/* View Routing */}
      {activeTab === 'home' && (
        <HomeScreen
          userProfile={userProfile}
          activeOrders={activeOrders}
          onSchedulePickup={() => setActiveTab('schedule')}
          onTrackOrder={(orderId) => {
            setSelectedOrderId(orderId);
            setActiveTab('orders');
          }}
          onViewHistory={() => setActiveTab('orders')}
          onOpenLocationPicker={() => setShowLocationPicker(true)}
        />
      )}

      {activeTab === 'schedule' && (
        <SchedulePickupScreen
          userProfile={userProfile}
          currentLocation={userProfile.defaultLocation || null}
          onOpenMapPicker={() => setShowLocationPicker(true)}
          onOrderCreated={(newId) => {
            setSelectedOrderId(newId);
            setActiveTab('orders');
          }}
          onCancel={() => setActiveTab('home')}
        />
      )}

      {activeTab === 'orders' && (
        <OrderTrackingScreen
          orders={orders}
          selectedOrderId={selectedOrderId}
          onSelectOrder={(id) => setSelectedOrderId(id)}
          onScheduleNew={() => setActiveTab('schedule')}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileScreen
          profile={userProfile}
          onOpenMapPicker={() => setShowLocationPicker(true)}
          onSignOut={() => {
            setUser(null);
            setUserProfile(null);
          }}
        />
      )}

      {/* Location Setup & Adjustment Modal */}
      {showLocationPicker && (
        <MapLocationPicker
          initialLocation={userProfile.defaultLocation || null}
          onConfirmLocation={handleLocationConfirmed}
          onClose={() => setShowLocationPicker(false)}
          isFirstLaunch={isFirstLaunch}
        />
      )}

      {/* Notifications Drawer */}
      {showNotificationsDrawer && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setShowNotificationsDrawer(false)}
          onMarkRead={(id) => markNotificationRead(id)}
          onSelectNotification={(notif) => {
            if (notif.orderId) {
              setSelectedOrderId(notif.orderId);
              setActiveTab('orders');
              setShowNotificationsDrawer(false);
            }
          }}
        />
      )}
    </CapacitorShell>
  );
}
