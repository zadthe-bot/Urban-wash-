import React from 'react';
import { Bell, CheckCheck, X, Sparkles, Clock } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationDrawerProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  onClose,
  onMarkRead,
  onSelectNotification,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[650px]">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">FCM Push Notifications</h3>
              <p className="text-[11px] text-slate-400">Live order status updates & alerts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-950">
          {notifications.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-500">
              <Sparkles className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
              <p className="text-xs font-medium">No push notifications yet.</p>
              <p className="text-[11px] text-slate-600">
                You will receive FCM alerts when your laundry status updates!
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) onMarkRead(notif.id);
                  if (onSelectNotification) onSelectNotification(notif);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  notif.read
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-gradient-to-r from-slate-900 to-slate-900/90 border-cyan-500/40 shadow-lg text-slate-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                    <span>{notif.title}</span>
                  </h4>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{notif.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
