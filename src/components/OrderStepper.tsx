import React from 'react';
import {
  Clock,
  Bike,
  PackageCheck,
  Waves,
  Wind,
  Sparkles,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { OrderStatus, ALL_ORDER_STATUSES } from '../types';

interface OrderStepperProps {
  currentStatus: OrderStatus;
  timestamp?: string;
}

const statusIconMap: Record<OrderStatus, React.ElementType> = {
  'Pickup Requested': Clock,
  'Pickup Assigned': Bike,
  'Clothes Collected': PackageCheck,
  'Washing': Waves,
  'Drying': Wind,
  'Ready': Sparkles,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle2,
};

export const OrderStepper: React.FC<OrderStepperProps> = ({ currentStatus, timestamp }) => {
  const currentIndex = ALL_ORDER_STATUSES.findIndex((s) => s.status === currentStatus);
  const totalSteps = ALL_ORDER_STATUSES.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalSteps) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
            Live Order Status
          </span>
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center space-x-1.5">
            <span>{currentStatus}</span>
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            {progressPercent}% Complete
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-cyan-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Timeline Steps */}
      <div className="space-y-3 pt-1">
        {ALL_ORDER_STATUSES.map((step, idx) => {
          const IconComponent = statusIconMap[step.status];
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.status} className="flex items-start space-x-3 group">
              {/* Step Circle with connecting line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40 ring-4 ring-cyan-500/20 animate-pulse'
                      : 'bg-slate-950 text-slate-500 border border-slate-800'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {idx < ALL_ORDER_STATUSES.length - 1 && (
                  <div
                    className={`w-0.5 h-6 my-1 transition-colors ${
                      idx < currentIndex ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>

              {/* Step Text Info */}
              <div className="pt-0.5 pb-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'text-cyan-300'
                        : isDone
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                      Active
                    </span>
                  )}
                </div>

                <p
                  className={`text-[11px] leading-tight mt-0.5 ${
                    isCurrent ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
