import React from 'react';
import { Phone, MessageSquare, Star, Bike, ShieldCheck } from 'lucide-react';
import { RiderInfo } from '../types';

interface RiderCardProps {
  rider: RiderInfo;
}

export const RiderCard: React.FC<RiderCardProps> = ({ rider }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-1">
          <Bike className="w-3.5 h-3.5 text-cyan-400" />
          <span>Assigned Urban Wash Rider</span>
        </span>
        <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-amber-500/20">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{rider.rating}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
        <img
          src={rider.photo}
          alt={rider.name}
          className="w-12 h-12 rounded-xl object-cover border border-cyan-500/30 shadow-md"
        />

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
            <span>{rider.name}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </h4>
          <p className="text-xs text-slate-400 truncate">{rider.vehicle}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5">
          <a
            href={`tel:${rider.phone}`}
            className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors shadow-md shadow-cyan-600/20 active:scale-95"
            title="Call Rider"
          >
            <Phone className="w-4 h-4" />
          </a>
          <button
            onClick={() => alert(`Opening SMS chat with ${rider.name}...`)}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700 active:scale-95"
            title="Message Rider"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
