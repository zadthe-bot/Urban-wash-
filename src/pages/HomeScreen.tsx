import React from 'react';
import {
  Sparkles,
  CalendarPlus,
  Clock,
  Shirt,
  Flame,
  Package,
  Leaf,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Zap,
  Smartphone,
  Scissors,
  Layers,
  Check,
} from 'lucide-react';
import { LaundryOrder, UserProfile } from '../types';
import { GENERIC_CLOTHING_ITEMS, REQUIRED_SERVICES, TANZANIAN_PAYMENT_METHODS } from '../data/servicesData';

interface HomeScreenProps {
  userProfile: UserProfile;
  activeOrders: LaundryOrder[];
  onSchedulePickup: () => void;
  onTrackOrder: (orderId: string) => void;
  onViewHistory: () => void;
  onOpenLocationPicker: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  activeOrders,
  onSchedulePickup,
  onTrackOrder,
  onViewHistory,
  onOpenLocationPicker,
}) => {
  const currentActive = activeOrders.length > 0 ? activeOrders[0] : null;

  return (
    <div className="p-4 space-y-5 animate-fadeIn pb-12">
      {/* Location Bar Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
              Pickup & Delivery Address
            </span>
            <p className="font-semibold text-slate-200 truncate">
              {userProfile.defaultLocation?.address || 'Mikocheni B, Rose Garden Road, Dar es Salaam'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLocationPicker}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-[11px] rounded-xl transition-colors shrink-0 ml-2"
        >
          Change
        </button>
      </div>

      {/* Hero CTA Block: Schedule Pickup */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-5 shadow-2xl text-white space-y-4">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-cyan-100 border border-white/20">
            <Zap className="w-3 h-3 text-amber-300" />
            <span>24-Hour Express Laundry • Dar es Salaam</span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight leading-tight">
            Professional Laundry <br /> Cleaned & Delivered
          </h2>

          <p className="text-xs text-cyan-100/90 leading-relaxed max-w-[290px]">
            Select your generic clothes, pick required services (Wash, Iron, Dry Clean, Perfume), pay via M-Pesa or Cash.
          </p>
        </div>

        <button
          onClick={onSchedulePickup}
          className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2 relative z-10"
        >
          <CalendarPlus className="w-5 h-5 text-cyan-600" />
          <span>Select Clothes & Wash Services</span>
        </button>
      </div>

      {/* Active Order Card Teaser */}
      {currentActive && (
        <div
          onClick={() => onTrackOrder(currentActive.id)}
          className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-4 shadow-xl space-y-3 cursor-pointer hover:border-cyan-400 transition-all relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-bold text-slate-100">
                Active Order #{currentActive.orderNumber}
              </span>
            </div>

            <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {currentActive.orderStatus}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <div>
              <p className="text-slate-400 text-[11px]">Pickup Address</p>
              <p className="font-semibold truncate max-w-[190px]">{currentActive.pickupLocation}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[11px]">Total Estimate</p>
              <p className="font-bold text-cyan-300 font-mono">
                TSh {currentActive.priceEstimateTSh?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-cyan-400 font-bold group">
            <span>Tap to view live tracking & rider contact</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {/* Generic Clothing Categories Quick Select Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span>Select Clothes Types</span>
          </h3>
          <span className="text-[11px] text-cyan-400 font-semibold cursor-pointer" onClick={onSchedulePickup}>
            View All
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {GENERIC_CLOTHING_ITEMS.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={onSchedulePickup}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 space-y-1.5 cursor-pointer transition-all hover:bg-slate-800/40 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </h4>
                <span className="text-[10px] text-cyan-400 font-mono">{item.swahiliName}</span>
              </div>

              <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>

              <div className="pt-1 flex items-center justify-between border-t border-slate-800/60 text-xs">
                <span className="font-extrabold text-cyan-300 font-mono">
                  TSh {item.basePriceTSh.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500">{item.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Services List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Available Required Services</span>
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {REQUIRED_SERVICES.map((srv) => (
            <div
              key={srv.id}
              onClick={onSchedulePickup}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 space-y-1 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                  {srv.name}
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">{srv.swahiliName}</p>
              <p className="text-[10px] text-cyan-400 font-extrabold font-mono pt-1">
                {srv.priceTSh === 0 ? 'Included' : `+TSh ${srv.priceTSh.toLocaleString()}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tanzanian Local Payment Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Local Payment Options Accepted</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            TSh / TZS
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-300">
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-red-400">
            M-Pesa
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-rose-400">
            Airtel Money
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-blue-400">
            Tigo Pesa
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-amber-400">
            HaloPesa
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-emerald-400">
            CRDB
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-cyan-400">
            NMB / Stanbic
          </span>
          <span className="bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-slate-300">
            Cash
          </span>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center space-x-3 text-xs">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <h4 className="font-bold text-slate-200">Urban Wash Guarantee</h4>
          <p className="text-[11px] text-slate-400 leading-tight">
            100% Satisfaction or re-wash guaranteed. Perfume treatment & eco detergent options.
          </p>
        </div>
      </div>
    </div>
  );
};
