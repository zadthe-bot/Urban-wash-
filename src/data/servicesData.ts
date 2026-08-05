import { ClothingItemType, LaundryServiceOption, PaymentMethodTanzania } from '../types';

/**
 * Generic Clothing Categories for Selection (Tanzanian context)
 */
export const GENERIC_CLOTHING_ITEMS: ClothingItemType[] = [
  {
    id: 'shirts_blouses',
    name: 'Shirts & Blouses',
    swahiliName: 'Mashati & Blawusi',
    category: 'Top',
    basePriceTSh: 2500,
    unit: 'per item',
    iconName: 'Shirt',
    description: 'Generic dress shirts, casual button-downs, blouses, and polo shirts.',
  },
  {
    id: 'trousers_pants',
    name: 'Pants & Trousers',
    swahiliName: 'Suruali & Jeans',
    category: 'Bottom',
    basePriceTSh: 3000,
    unit: 'per item',
    iconName: 'Scissors',
    description: 'Generic trousers, jeans, khakis, sweatpants, or casual pants.',
  },
  {
    id: 'skirts_dresses',
    name: 'Skirts & Dresses',
    swahiliName: 'Sketi & Magauni',
    category: 'Outfit',
    basePriceTSh: 3500,
    unit: 'per item',
    iconName: 'Sparkles',
    description: 'Casual dresses, evening gowns, long or short skirts.',
  },
  {
    id: 'tshirts_tops',
    name: 'T-Shirts & Tops',
    swahiliName: 'T-Shirt & Vileti',
    category: 'Top',
    basePriceTSh: 2000,
    unit: 'per item',
    iconName: 'Shirt',
    description: 'Cotton T-shirts, sleeveless tops, tank tops, and athletic shirts.',
  },
  {
    id: 'jackets_suits',
    name: 'Suits & Jackets',
    swahiliName: 'Suti, Makoti & Soti',
    category: 'Heavy',
    basePriceTSh: 7000,
    unit: 'per item',
    iconName: 'ShieldCheck',
    description: 'Suit jackets, coats, blazers, and heavy winter coats.',
  },
  {
    id: 'sweaters_hoodies',
    name: 'Sweaters & Hoodies',
    swahiliName: 'Masweta & Ma-Hoodie',
    category: 'Top',
    basePriceTSh: 4000,
    unit: 'per item',
    iconName: 'Shirt',
    description: 'Knit sweaters, hoodies, and cardigans.',
  },
  {
    id: 'blankets_comforters',
    name: 'Blankets & Duvets',
    swahiliName: 'Mablanketi & Mashuka Nzito',
    category: 'Bedding',
    basePriceTSh: 12000,
    unit: 'per item',
    iconName: 'Bed',
    description: 'Heavy wool blankets, comforters, duvets, and thick bedspreads.',
  },
  {
    id: 'towels_bedsheets',
    name: 'Towels & Bed Sheets',
    swahiliName: 'Mataulo & Mashuka ya Kitanda',
    category: 'Bedding',
    basePriceTSh: 3500,
    unit: 'per item',
    iconName: 'Layers',
    description: 'Bath towels, hand towels, pillowcases, and bed sheets.',
  },
  {
    id: 'underwear_socks',
    name: 'Underwear & Socks',
    swahiliName: 'Nguo za Ndani & Soksi (Begi)',
    category: 'Underwear',
    basePriceTSh: 3000,
    unit: 'per bag (5 pcs)',
    iconName: 'Package',
    description: 'Underwear, socks, and small intimates washed in laundry bag.',
  },
  {
    id: 'children_wear',
    name: "Children's Wear",
    swahiliName: 'Nguo za Watoto',
    category: 'Kids',
    basePriceTSh: 2000,
    unit: 'per item',
    iconName: 'Smile',
    description: 'Baby clothes, kids uniforms, and small children outfits.',
  },
  {
    id: 'curtains_drapes',
    name: 'Curtains & Drapes',
    swahiliName: 'Mapazia ya Dirisha',
    category: 'Heavy',
    basePriceTSh: 10000,
    unit: 'per panel',
    iconName: 'Maximize2',
    description: 'Window curtains, heavy sheer drapes, and fabric shades.',
  },
  {
    id: 'mixed_load_kg',
    name: 'Mixed Laundry Load (per Kg)',
    swahiliName: 'Mzigo wa Kawaida (kwa Kilo)',
    category: 'General',
    basePriceTSh: 3500,
    unit: 'per kg',
    iconName: 'Scale',
    description: 'Assorted everyday clothes weighed per kg for bulk washing.',
  },
];

/**
 * Required Services requested by customer
 */
export const REQUIRED_SERVICES: LaundryServiceOption[] = [
  {
    id: 'Wash and fold',
    name: 'Wash and fold',
    swahiliName: 'Osha na Kunja',
    priceTSh: 0, // included in base price
    isFlatFee: false,
    iconName: 'Waves',
    description: 'Standard gentle wash with soft rinse, tumble dry, and neat hand folding.',
  },
  {
    id: 'Wash and iron',
    name: 'Wash and iron',
    swahiliName: 'Osha na Pasi',
    priceTSh: 1500,
    isFlatFee: false,
    iconName: 'Flame',
    description: 'Complete wash cycle followed by steam pressing and crisp hanger finishing.',
  },
  {
    id: 'Iron only',
    name: 'Iron only',
    swahiliName: 'Pasi Tu',
    priceTSh: 1500,
    isFlatFee: false,
    iconName: 'Flame',
    description: 'Steam pressing and crease removal on clean garments.',
  },
  {
    id: 'Dry cleaning',
    name: 'Dry cleaning',
    swahiliName: 'Usafi wa Kavu (Dry Clean)',
    priceTSh: 4000,
    isFlatFee: false,
    iconName: 'Sparkles',
    description: 'Eco-friendly chemical solvent dry cleaning for delicate fabrics and suits.',
  },
  {
    id: 'Express service',
    name: 'Express service (6h Return)',
    swahiliName: 'Huduma ya Haraka (Masaa 6)',
    priceTSh: 5000,
    isFlatFee: true,
    iconName: 'Zap',
    description: 'Priority fast turnaround. Picked up and returned within 6 hours.',
  },
  {
    id: 'Perfume treatment',
    name: 'Perfume treatment',
    swahiliName: 'Tiba ya Marashi (Perfume Finish)',
    priceTSh: 2000,
    isFlatFee: true,
    iconName: 'Sparkles',
    description: 'Long-lasting luxury fragrance mist and fabric softener infusion.',
  },
];

/**
 * Tanzanian Local Payment Methods
 */
export interface TanzanianPaymentInfo {
  id: PaymentMethodTanzania;
  name: string;
  provider: string;
  type: 'Mobile Money' | 'Bank' | 'Cash';
  icon: string;
  color: string;
  phonePrefix?: string;
}

export const TANZANIAN_PAYMENT_METHODS: TanzanianPaymentInfo[] = [
  {
    id: 'M-Pesa (Vodacom)',
    name: 'M-Pesa',
    provider: 'Vodacom Tanzania',
    type: 'Mobile Money',
    icon: 'Smartphone',
    color: 'from-red-600 to-red-800',
    phonePrefix: '+255 74X / 75X / 76X',
  },
  {
    id: 'Airtel Money',
    name: 'Airtel Money',
    provider: 'Airtel Tanzania',
    type: 'Mobile Money',
    icon: 'Smartphone',
    color: 'from-rose-600 to-red-700',
    phonePrefix: '+255 78X / 79X',
  },
  {
    id: 'Tigo Pesa',
    name: 'Tigo Pesa',
    provider: 'Tigo Tanzania',
    type: 'Mobile Money',
    icon: 'Smartphone',
    color: 'from-blue-600 to-indigo-800',
    phonePrefix: '+255 71X / 65X / 67X',
  },
  {
    id: 'HaloPesa',
    name: 'HaloPesa',
    provider: 'Halotel Tanzania',
    type: 'Mobile Money',
    icon: 'Smartphone',
    color: 'from-amber-500 to-orange-600',
    phonePrefix: '+255 62X',
  },
  {
    id: 'CRDB Bank',
    name: 'CRDB SimBanking',
    provider: 'CRDB Bank Plc',
    type: 'Bank',
    icon: 'Building2',
    color: 'from-emerald-600 to-green-700',
  },
  {
    id: 'NMB Bank',
    name: 'NMB Mkononi',
    provider: 'NMB Bank Plc',
    type: 'Bank',
    icon: 'Building2',
    color: 'from-blue-500 to-sky-700',
  },
  {
    id: 'Stanbic Bank',
    name: 'Stanbic Bank',
    provider: 'Stanbic Tanzania',
    type: 'Bank',
    icon: 'Building2',
    color: 'from-cyan-600 to-blue-800',
  },
  {
    id: 'Cash on Delivery',
    name: 'Cash on Delivery',
    provider: 'Pesa Taslimu',
    type: 'Cash',
    icon: 'Banknote',
    color: 'from-slate-700 to-slate-900',
  },
];
