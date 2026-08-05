import React, { useState } from 'react';
import {
  Clock,
  Package,
  Calendar,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Search,
  Receipt,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { LaundryOrder } from '../types';

interface OrderHistoryScreenProps {
  orders: LaundryOrder[];
  onSelectOrder: (orderId: string) => void;
  onReorder: (order: LaundryOrder) => void;
  onScheduleNew: () => void;
}

export const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({
  orders,
  onSelectOrder,
  onReorder,
  onScheduleNew,
}) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Delivered'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'Active' && o.orderStatus === 'Delivered') return false;
    if (filter === 'Delivered' && o.orderStatus !== 'Delivered') return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.pickupLocation.toLowerCase().includes(q) ||
        (o.clothingItems && o.clothingItems.some((s) => s.name.toLowerCase().includes(q))) ||
        (o.servicesRequired && o.servicesRequired.some((srv) => srv.toLowerCase().includes(q)))
      );
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4 animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-100">Order History</h2>
          <p className="text-xs text-slate-400">View past laundry orders & local TSh receipts</p>
        </div>

        <button
          onClick={onScheduleNew}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
        >
          New Order
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        {(['All', 'Active', 'Delivered'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by order #, clothes, or location..."
          className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-slate-500">
            <Package className="w-8 h-8 mx-auto text-slate-700" />
            <p className="text-xs font-medium">No orders found.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4 shadow-lg space-y-3 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-slate-100">
                    #{order.orderNumber}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {new Date(order.timestamp).toLocaleDateString()} at{' '}
                    {new Date(order.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{order.pickupLocation}</span>
                </p>

                {/* Clothing Items Chips */}
                {order.clothingItems && order.clothingItems.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {order.clothingItems.map((c) => (
                      <span
                        key={c.itemId}
                        className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 font-medium"
                      >
                        {c.quantity}x {c.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Services required badge */}
                {order.servicesRequired && order.servicesRequired.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {order.servicesRequired.map((srv) => (
                      <span
                        key={srv}
                        className="text-[9px] font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                )}

                {/* Payment Method */}
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 pt-0.5">
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                  <span>Payment: {order.paymentMethod || 'M-Pesa (Vodacom)'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400">Total Price</span>
                  <p className="text-sm font-bold font-mono text-cyan-300">
                    TSh {(order.priceEstimateTSh || 0).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onReorder(order)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3 text-cyan-400" />
                    <span>Re-order</span>
                  </button>

                  <button
                    onClick={() => onSelectOrder(order.id)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1"
                  >
                    <span>Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
