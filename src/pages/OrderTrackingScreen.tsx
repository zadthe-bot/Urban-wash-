import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  Package,
  RotateCw,
  Sparkles,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { LaundryOrder, OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { OrderStepper } from '../components/OrderStepper';
import { RiderCard } from '../components/RiderCard';
import { updateOrderStatus } from '../services/firebaseService';

interface OrderTrackingScreenProps {
  orders: LaundryOrder[];
  selectedOrderId?: string;
  onSelectOrder: (id: string) => void;
  onScheduleNew: () => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onScheduleNew,
}) => {
  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) ||
    orders.find((o) => o.orderStatus !== 'Delivered') ||
    orders[0];

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  if (!activeOrder) {
    return (
      <div className="p-6 text-center space-y-4 py-16 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-100">No Active Laundry Orders</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You don't have any active laundry pickups at the moment.
          </p>
        </div>
        <button
          onClick={onScheduleNew}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
        >
          Schedule New Pickup
        </button>
      </div>
    );
  }

  // Advance to next status in sequence for testing/simulation
  const handleAdvanceStatus = async () => {
    setIsUpdatingStatus(true);
    const currentIdx = ALL_ORDER_STATUSES.findIndex((s) => s.status === activeOrder.orderStatus);
    const nextIdx = (currentIdx + 1) % ALL_ORDER_STATUSES.length;
    const nextStatus = ALL_ORDER_STATUSES[nextIdx].status;

    try {
      await updateOrderStatus(activeOrder.id, nextStatus);
    } catch (err) {
      console.error('Error advancing status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSetSpecificStatus = async (status: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(activeOrder.id, status);
    } catch (err) {
      console.error('Error setting status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fadeIn pb-12">
      {/* Selector dropdown if multiple orders */}
      {orders.length > 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Select Active Order:</span>
          <select
            value={activeOrder.id}
            onChange={(e) => onSelectOrder(e.target.value)}
            className="bg-slate-950 text-slate-100 border border-slate-800 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 font-mono"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                #{o.orderNumber} ({o.orderStatus})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Order Header info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
            Order #{activeOrder.orderNumber}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {new Date(activeOrder.timestamp).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-1 text-xs text-slate-300 pt-1">
          <p className="flex items-center space-x-1.5 text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">{activeOrder.pickupLocation}</span>
          </p>
          <p className="flex items-center space-x-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Pickup Slot: {activeOrder.pickupTime}</span>
          </p>
        </div>
      </div>

      {/* Stepper showing all 8 order states in real time */}
      <OrderStepper currentStatus={activeOrder.orderStatus} timestamp={activeOrder.timestamp} />

      {/* Rider Info Card (if assigned) */}
      {activeOrder.riderInfo && <RiderCard rider={activeOrder.riderInfo} />}

      {/* Itemized Services Summary in TSh */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2 text-xs">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
          Order Clothes & Selected Services
        </h4>

        {/* Selected Clothes */}
        {activeOrder.clothingItems && activeOrder.clothingItems.length > 0 && (
          <div className="space-y-1 border-b border-slate-800 pb-2">
            {activeOrder.clothingItems.map((c) => (
              <div key={c.itemId} className="flex justify-between text-slate-200">
                <span>
                  {c.quantity}x {c.name}
                </span>
                <span className="font-mono text-cyan-300">
                  TSh {(c.unitPriceTSh * c.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Services Badges */}
        {activeOrder.servicesRequired && activeOrder.servicesRequired.length > 0 && (
          <div className="pt-1 space-y-1">
            <span className="text-[10px] text-slate-400 font-medium">Services Requested:</span>
            <div className="flex flex-wrap gap-1">
              {activeOrder.servicesRequired.map((srv) => (
                <span
                  key={srv}
                  className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30"
                >
                  {srv}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-slate-100">
          <div>
            <span className="block text-[10px] text-slate-400">Total Price ({activeOrder.paymentMethod || 'M-Pesa'})</span>
            <span className="font-mono text-cyan-400 text-sm">
              TSh {(activeOrder.priceEstimateTSh || 0).toLocaleString()}
            </span>
          </div>

          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-mono px-2 py-1 rounded-full border border-emerald-500/30">
            {activeOrder.paymentStatus || 'Paid (Mobile Money)'}
          </span>
        </div>
      </div>

      {/* Live Firestore Simulation Bar */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-xs text-cyan-300 font-bold">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Real-time Firestore Status Test Bar</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Click below to advance Firestore status and test FCM push notifications live in the preview.
        </p>

        <button
          onClick={handleAdvanceStatus}
          disabled={isUpdatingStatus}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isUpdatingStatus ? 'animate-spin' : ''}`} />
          <span>Advance to Next Status State</span>
        </button>

        {/* Quick status jumper buttons */}
        <div className="flex flex-wrap gap-1 pt-1">
          {ALL_ORDER_STATUSES.map((st) => (
            <button
              key={st.status}
              onClick={() => handleSetSpecificStatus(st.status)}
              className={`px-2 py-1 text-[10px] rounded-lg border font-medium transition-all ${
                activeOrder.orderStatus === st.status
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
