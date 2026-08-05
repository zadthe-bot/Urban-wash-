import React, { useState } from 'react';
import {
  CalendarPlus,
  Check,
  ChevronRight,
  ArrowLeft,
  Shirt,
  Sparkles,
  Flame,
  Package,
  Leaf,
  Clock,
  MapPin,
  FileText,
  Loader2,
  CheckCircle2,
  Plus,
  Minus,
  Smartphone,
  Building2,
  Banknote,
  Zap,
  Info,
  Layers,
} from 'lucide-react';
import { GENERIC_CLOTHING_ITEMS, REQUIRED_SERVICES, TANZANIAN_PAYMENT_METHODS } from '../data/servicesData';
import { LaundryOrder, AddressLocation, UserProfile, RequiredServiceType, PaymentMethodTanzania, SelectedClothingItem } from '../types';
import { createLaundryOrder } from '../services/firebaseService';

interface SchedulePickupScreenProps {
  userProfile: UserProfile;
  currentLocation: AddressLocation | null;
  onOpenMapPicker: () => void;
  onOrderCreated: (orderId: string) => void;
  onCancel: () => void;
}

export const SchedulePickupScreen: React.FC<SchedulePickupScreenProps> = ({
  userProfile,
  currentLocation,
  onOpenMapPicker,
  onOrderCreated,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1: Selected clothing items (itemId -> quantity)
  const [selectedItemCounts, setSelectedItemCounts] = useState<Record<string, number>>({
    shirts_blouses: 3,
    trousers_pants: 2,
    blankets_comforters: 1,
  });

  // Step 2: Selected required services (Wash & Fold default)
  const [selectedServices, setSelectedServices] = useState<RequiredServiceType[]>([
    'Wash and fold',
    'Perfume treatment',
  ]);

  const [selectedDetergent, setSelectedDetergent] = useState<string>('Perfume Softener');
  const [selectedStarch, setSelectedStarch] = useState<string>('Light');
  const [instructions, setInstructions] = useState<string>('');

  // Step 3: Pickup Time Slot
  const timeSlots = [
    'Today (2:00 PM - 4:00 PM)',
    'Today (5:00 PM - 7:00 PM)',
    'Tomorrow (8:00 AM - 10:00 AM)',
    'Tomorrow (11:00 AM - 1:00 PM)',
    'Tomorrow (3:00 PM - 5:00 PM)',
  ];
  const [pickupTime, setPickupTime] = useState<string>(timeSlots[0]);

  // Step 4: Tanzanian Payment Method & Phone
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodTanzania>('M-Pesa (Vodacom)');
  const [paymentPhone, setPaymentPhone] = useState<string>(userProfile.phone || '+255 754 123 456');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState<boolean>(false);

  // Clothing Item Quantity Adjuster
  const handleItemQuantityChange = (itemId: string, delta: number) => {
    setSelectedItemCounts((prev) => {
      const current = prev[itemId] || 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [itemId]: nextVal };
    });
  };

  // Toggle Required Service
  const handleToggleService = (serviceId: RequiredServiceType) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceId)) {
        // Must keep at least one base wash service if removing
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  // Selected Items List
  const selectedClothingList: SelectedClothingItem[] = GENERIC_CLOTHING_ITEMS.filter(
    (item) => (selectedItemCounts[item.id] || 0) > 0
  ).map((item) => ({
    itemId: item.id,
    name: item.name,
    quantity: selectedItemCounts[item.id] || 0,
    unitPriceTSh: item.basePriceTSh,
  }));

  const totalClothingPieces = selectedClothingList.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate Subtotal & Totals in TSh
  const clothesSubtotalTSh = selectedClothingList.reduce(
    (sum, item) => sum + item.unitPriceTSh * item.quantity,
    0
  );

  // Additional service charges
  let servicesExtraTSh = 0;
  selectedServices.forEach((srvName) => {
    const srvConfig = REQUIRED_SERVICES.find((s) => s.id === srvName);
    if (srvConfig && srvConfig.priceTSh > 0) {
      if (srvConfig.isFlatFee) {
        servicesExtraTSh += srvConfig.priceTSh;
      } else {
        servicesExtraTSh += srvConfig.priceTSh * totalClothingPieces;
      }
    }
  });

  const subtotalTSh = clothesSubtotalTSh + servicesExtraTSh;
  const deliveryFeeTSh = subtotalTSh > 30000 ? 0 : 3000; // Free delivery over 30,000 TSh
  const totalEstimateTSh = subtotalTSh + deliveryFeeTSh;

  const handleSubmitOrder = async () => {
    if (selectedClothingList.length === 0) {
      alert('Please select at least one clothing item to be washed.');
      return;
    }

    const locToUse = currentLocation || userProfile.defaultLocation;
    if (!locToUse || !locToUse.address) {
      alert('Please confirm your pickup address in Dar es Salaam.');
      onOpenMapPicker();
      return;
    }

    setIsSubmitting(true);

    // If payment is mobile money, show simulated mobile push notification first
    const isMobileMoney = paymentMethod.includes('M-Pesa') || paymentMethod.includes('Airtel') || paymentMethod.includes('Tigo') || paymentMethod.includes('HaloPesa');

    if (isMobileMoney && !showUssdPrompt) {
      setShowUssdPrompt(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const fullInstructions = [
        `Services: ${selectedServices.join(', ')}`,
        `Detergent: ${selectedDetergent}`,
        `Starch: ${selectedStarch}`,
        instructions ? `Notes: ${instructions}` : '',
      ]
        .filter(Boolean)
        .join(' | ');

      const newOrderId = await createLaundryOrder({
        customerId: userProfile.uid,
        customerName: userProfile.name,
        customerPhone: paymentPhone || userProfile.phone || '+255 754 123 456',
        pickupLocation: locToUse.address,
        latitude: locToUse.lat,
        longitude: locToUse.lng,
        clothingItems: selectedClothingList,
        servicesRequired: selectedServices,
        paymentMethod,
        paymentPhone,
        paymentStatus: isMobileMoney ? 'Paid (Mobile Money)' : 'Cash on Delivery',
        quantitySummary: `${totalClothingPieces} clothing items`,
        instructions: fullInstructions,
        pickupTime,
        priceEstimateTSh: totalEstimateTSh,
        subtotalTSh,
        deliveryFeeTSh,
        orderStatus: 'Pickup Requested',
      });

      setShowUssdPrompt(false);
      onOrderCreated(newOrderId);
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={onCancel}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <h2 className="text-sm font-bold text-slate-100">Schedule Laundry Pickup</h2>

        <span className="text-xs font-mono font-bold text-cyan-400">Step {step}/4</span>
      </div>

      {/* STEP 1: Select Clothing Items */}
      {step === 1 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-100">1. Select Clothing Items</h3>
            <p className="text-xs text-slate-400">Choose generic types of clothes to be washed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {GENERIC_CLOTHING_ITEMS.map((item) => {
              const qty = selectedItemCounts[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    qty > 0
                      ? 'bg-slate-900 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{item.name}</h4>
                    </div>
                    <p className="text-[10px] text-cyan-400 font-medium">{item.swahiliName}</p>
                    <p className="text-xs font-extrabold font-mono text-slate-200 mt-0.5">
                      TSh {item.basePriceTSh.toLocaleString()}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </p>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleItemQuantityChange(item.id, -1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold font-mono text-cyan-300">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleItemQuantityChange(item.id, 1)}
                      className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Selected Counter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Total Items Selected:</span>
              <p className="font-extrabold text-cyan-300 font-mono text-sm">{totalClothingPieces} pieces</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Base Cost:</span>
              <p className="font-extrabold text-slate-100 font-mono text-sm">
                TSh {clothesSubtotalTSh.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={totalClothingPieces === 0}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>Continue to Required Services</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: Select Required Services */}
      {step === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-100">2. Select Required Services</h3>
            <p className="text-xs text-slate-400">Choose laundry treatment needed for your clothes</p>
          </div>

          {/* Service options grid */}
          <div className="space-y-2">
            {REQUIRED_SERVICES.map((srv) => {
              const isSelected = selectedServices.includes(srv.id);
              return (
                <div
                  key={srv.id}
                  onClick={() => handleToggleService(srv.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 text-slate-100 shadow-md ring-1 ring-cyan-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'bg-slate-950 border-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-bold text-slate-100">{srv.name}</h4>
                        <span className="text-[10px] text-cyan-400 font-medium">
                          ({srv.swahiliName})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{srv.description}</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold font-mono text-cyan-300 shrink-0">
                    {srv.priceTSh === 0
                      ? 'Included'
                      : srv.isFlatFee
                      ? `+TSh ${srv.priceTSh.toLocaleString()} flat`
                      : `+TSh ${srv.priceTSh.toLocaleString()} / item`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Detergent & Wash Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <h4 className="text-xs font-bold text-slate-200">Detergent & Wash Preference</h4>

            <div className="grid grid-cols-2 gap-2">
              {['Perfume Softener', 'Standard Fresh', 'Hypoallergenic Scent-Free', 'Organic Lavender'].map(
                (det) => (
                  <button
                    key={det}
                    type="button"
                    onClick={() => setSelectedDetergent(det)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                      selectedDetergent === det
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {det}
                  </button>
                )
              )}
            </div>

            {/* Special Instructions */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-300">Special Notes for Laundry Team</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Grass stain on trousers, separate white shirts, extra starch on collar..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setStep(1)}
              className="py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Confirm Time & Location</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pickup Location & Time Slot */}
      {step === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-100">3. Pickup Location & Time</h3>
            <p className="text-xs text-slate-400">Where should our rider collect your laundry in Dar es Salaam?</p>
          </div>

          {/* Pickup Address Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Selected Pickup Address</span>
              </span>
              <button
                onClick={onOpenMapPicker}
                className="text-[11px] font-semibold text-cyan-400 hover:underline"
              >
                Change Pin / Map
              </button>
            </div>

            <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-medium">
              {currentLocation?.address || userProfile.defaultLocation?.address || 'Mikocheni B, Rose Garden Road, Dar es Salaam'}
            </p>
          </div>

          {/* Pickup Time Slots */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Select Pickup Time Slot</span>
            </label>

            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setPickupTime(slot)}
                  className={`w-full p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    pickupTime === slot
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{slot}</span>
                  {pickupTime === slot && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setStep(2)}
              className="py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-sm shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Payment</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Tanzanian Payment Method & Order Summary */}
      {step === 4 && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-base font-extrabold text-slate-100">4. Order Summary & Payment</h3>
            <p className="text-xs text-slate-400">Select local Tanzanian payment option (TSh)</p>
          </div>

          {/* Order Bill Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Selected Clothes & Services
            </h4>

            <div className="space-y-1.5 border-b border-slate-800 pb-3">
              {selectedClothingList.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold font-mono text-slate-100">
                    TSh {(item.unitPriceTSh * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Clothing Subtotal</span>
                <span className="text-slate-300 font-mono">TSh {clothesSubtotalTSh.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Required Services Extra</span>
                <span className="text-slate-300 font-mono">TSh {servicesExtraTSh.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee (Dar es Salaam)</span>
                <span className="text-slate-300 font-mono">
                  {deliveryFeeTSh === 0 ? 'FREE' : `TSh ${deliveryFeeTSh.toLocaleString()}`}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">Total Price Estimate</span>
                <p className="text-xl font-extrabold text-slate-100 font-mono">
                  TSh {totalEstimateTSh.toLocaleString()}
                </p>
              </div>

              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Local Currency (TZS)
              </span>
            </div>
          </div>

          {/* Tanzanian Payment Options Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Select Payment Method (Tanzania)</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {TANZANIAN_PAYMENT_METHODS.map((pm) => {
                const isSel = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSel
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md ring-1 ring-cyan-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{pm.name}</span>
                      {isSel && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{pm.provider}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Money Phone Input if mobile money chosen */}
            {paymentMethod !== 'Cash on Delivery' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300">
                  Payment Phone Number ({paymentMethod})
                </label>
                <input
                  type="text"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="+255 754 123 456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400">
                  You will receive a mobile payment request prompt on this phone.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setStep(3)}
              disabled={isSubmitting}
              className="py-3 px-4 bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs"
            >
              Back
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-cyan-500/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Submit Order ({paymentMethod})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Simulated Mobile Money Prompt Modal */}
      {showUssdPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/50 rounded-3xl p-5 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/40">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-100">
                {paymentMethod} Payment Request
              </h3>
              <p className="text-xs text-slate-400">
                Sending STK push notification to <span className="font-mono text-cyan-300">{paymentPhone}</span>
              </p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Merchant:</span>
                <span className="font-bold text-slate-100">Urban Wash Tanzania</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Amount:</span>
                <span className="font-bold font-mono text-cyan-300">
                  TSh {totalEstimateTSh.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Currency:</span>
                <span className="font-mono text-slate-400">TZS (Tanzanian Shillings)</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUssdPrompt(false)}
                className="w-1/2 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Pay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
