import React, { useState, useEffect } from 'react';
import {
  Home,
  CalendarPlus,
  Clock,
  User,
  Bell,
  Wifi,
  Battery,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { CapacitorPlatform, AppNotification } from '../types';

interface CapacitorShellProps {
  children: React.ReactNode;
  activeTab: 'home' | 'schedule' | 'orders' | 'profile';
  onSelectTab: (tab: 'home' | 'schedule' | 'orders' | 'profile') => void;
  platform: CapacitorPlatform;
  onChangePlatform: (p: CapacitorPlatform) => void;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  currentAddressLabel?: string;
  onOpenLocationSetup?: () => void;
}

export const CapacitorShell: React.FC<CapacitorShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  platform,
  onChangePlatform,
  unreadNotifCount,
  onOpenNotifications,
  currentAddressLabel,
  onOpenLocationSetup,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [showCapacitorInfo, setShowCapacitorInfo] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 text-slate-100 font-sans">
      {/* Platform Switcher & Native Debug Header bar (for desktop view) */}
      <div className="w-full max-w-md hidden sm:flex items-center justify-between py-2 px-3 mb-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Capacitor Mobile Shell</span>
          <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono border border-emerald-500/30">
            Native FCM & GPS Active
          </span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => onChangePlatform('ios')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
              platform === 'ios'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            iOS
          </button>
          <button
            onClick={() => onChangePlatform('android')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
              platform === 'android'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Android
          </button>
        </div>
      </div>

      {/* Main Mobile App Frame */}
      <div
        className={`w-full max-w-md bg-slate-900 sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative border ${
          platform === 'ios' ? 'border-slate-800' : 'border-slate-800'
        } min-h-screen sm:min-h-[844px] sm:max-h-[900px] sm:h-[844px]`}
      >
        {/* iOS Dynamic Island / Notch or Android Status Bar */}
        <div className="bg-slate-900 pt-3 px-6 pb-2 flex items-center justify-between text-xs font-semibold text-slate-300 select-none z-30 shrink-0">
          <span>{currentTime || '09:41'}</span>

          {platform === 'ios' && (
            <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center space-x-1.5 px-2">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full border border-slate-700"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-slate-400">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">5G</span>
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Top App Header with Location & Notification Bell */}
        <header className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1">
                <h1 className="text-sm font-bold text-slate-100 tracking-tight">Urban Wash</h1>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.2 font-medium rounded-full border border-cyan-500/30">
                  Spark Plan
                </span>
              </div>

              {/* Location Badge */}
              <button
                onClick={onOpenLocationSetup}
                className="flex items-center space-x-1 text-slate-400 hover:text-cyan-300 transition-colors text-[11px] truncate max-w-[200px]"
                title="Change Pickup Location"
              >
                <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{currentAddressLabel || 'Set Pickup Location'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/60 active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content View Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800">
          {children}
        </main>

        {/* Capacitor Bottom Navigation Bar */}
        <nav className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 grid grid-cols-4 gap-1 z-30 shrink-0">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-cyan-400 bg-cyan-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('schedule')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'schedule'
                ? 'text-cyan-400 bg-cyan-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <CalendarPlus className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Schedule</span>
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'text-cyan-400 bg-cyan-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Track</span>
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'text-cyan-400 bg-cyan-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
