export type CapacitorPlatform = 'ios' | 'android';

export interface AddressLocation {
  id: string;
  label: string; // e.g. "Home", "Work", "Apartment"
  address: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  phone?: string;
  savedAddresses: AddressLocation[];
  defaultLocation?: AddressLocation;
  fcmToken?: string;
  preferences?: {
    detergent: 'Standard Fresh' | 'Hypoallergenic Scent-Free' | 'Organic Lavender' | 'Perfume Softener';
    starchLevel: 'None' | 'Light' | 'Medium' | 'Heavy';
    foldStyle: 'Standard Fold' | 'Hang Shirts' | 'Vacuum Pack';
  };
}

export interface ClothingItemType {
  id: string;
  name: string;
  swahiliName: string;
  category: 'Top' | 'Bottom' | 'Outfit' | 'Bedding' | 'Heavy' | 'Underwear' | 'Kids' | 'General';
  basePriceTSh: number;
  unit: string; // e.g., "per item", "per kg", "per bag"
  iconName: string;
  description: string;
}

export type RequiredServiceType =
  | 'Wash and fold'
  | 'Wash and iron'
  | 'Iron only'
  | 'Dry cleaning'
  | 'Express service'
  | 'Perfume treatment';

export interface LaundryServiceOption {
  id: RequiredServiceType;
  name: string;
  swahiliName: string;
  priceTSh: number; // additional cost per item or fixed charge
  isFlatFee?: boolean;
  iconName: string;
  description: string;
}

export interface SelectedClothingItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPriceTSh: number;
}

export type PaymentMethodTanzania =
  | 'M-Pesa (Vodacom)'
  | 'Airtel Money'
  | 'Tigo Pesa'
  | 'HaloPesa'
  | 'CRDB Bank'
  | 'NMB Bank'
  | 'Stanbic Bank'
  | 'Cash on Delivery';

export type OrderStatus =
  | 'Pickup Requested'
  | 'Pickup Assigned'
  | 'Clothes Collected'
  | 'Washing'
  | 'Drying'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered';

export interface RiderInfo {
  name: string;
  phone: string;
  vehicle: string;
  photo: string;
  rating: number;
  currentLat?: number;
  currentLng?: number;
}

export interface LaundryOrder {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  orderNumber: string;
  pickupLocation: string;
  latitude: number;
  longitude: number;
  clothingItems: SelectedClothingItem[];
  servicesRequired: RequiredServiceType[];
  paymentMethod: PaymentMethodTanzania;
  paymentPhone?: string;
  paymentStatus: 'Pending' | 'Paid (Mobile Money)' | 'Cash on Delivery';
  quantitySummary: string; // e.g. "8 clothing items"
  instructions: string;
  pickupTime: string;
  deliveryTime?: string;
  priceEstimateTSh: number;
  subtotalTSh: number;
  deliveryFeeTSh: number;
  orderStatus: OrderStatus;
  timestamp: string; // ISO string
  riderInfo?: RiderInfo;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  orderId?: string;
  timestamp: string;
  read: boolean;
  type: 'status_update' | 'rider_assigned' | 'delivery' | 'system';
}

export const ALL_ORDER_STATUSES: { status: OrderStatus; label: string; desc: string; icon: string }[] = [
  { status: 'Pickup Requested', label: 'Pickup Requested', desc: 'Order placed, searching for nearest rider in Dar es Salaam', icon: 'Clock' },
  { status: 'Pickup Assigned', label: 'Rider Assigned', desc: 'Rider is on the way to collect your laundry', icon: 'Bike' },
  { status: 'Clothes Collected', label: 'Clothes Collected', desc: 'Clothes picked up and safely in transit to hub', icon: 'PackageCheck' },
  { status: 'Washing', label: 'Washing & Cleaning', desc: 'Washing with your chosen service & detergent', icon: 'Waves' },
  { status: 'Drying', label: 'Drying & Conditioning', desc: 'Tumble drying and fabric conditioning', icon: 'Wind' },
  { status: 'Ready', label: 'Ready for Delivery', desc: 'Folded, pressed, perfume finished, and quality inspected', icon: 'Sparkles' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is en route to your location', icon: 'Truck' },
  { status: 'Delivered', label: 'Delivered', desc: 'Fresh clean laundry delivered to your door', icon: 'CheckCircle2' },
];

