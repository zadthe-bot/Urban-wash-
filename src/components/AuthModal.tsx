import React, { useState } from 'react';
import { Sparkles, ShieldCheck, CheckCircle, ArrowRight, Loader2, Info } from 'lucide-react';
import { signInWithGoogle } from '../services/firebaseService';

interface AuthModalProps {
  onSuccess?: () => void;
  onDemoSignIn?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onDemoSignIn }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.warn('Google Sign-In caught:', err);
      setError(err?.message || 'Google Sign-In was cancelled or blocked by browser.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center space-y-5 animate-fadeIn">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
          <Sparkles className="w-9 h-9 animate-pulse" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">Welcome to Urban Wash</h2>
          <p className="text-xs text-slate-400 mt-1">
            Mobile laundry pickup & delivery straight to your door
          </p>
        </div>

        {/* Feature List */}
        <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 space-y-2.5 text-left text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Schedule pickup with live GPS location</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Real-time laundry tracking & rider status</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>FCM Push notifications on every status update</span>
          </div>
        </div>

        {error && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-left flex items-start space-x-2 text-xs text-red-300">
            <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Sign In Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>

          {/* Quick Demo Sign-In Option */}
          {onDemoSignIn && (
            <button
              onClick={onDemoSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-2xl text-xs transition-colors border border-slate-700 flex items-center justify-center space-x-1.5"
            >
              <span>Instant Customer Demo Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured with Firebase Auth Spark Plan</span>
        </div>
      </div>
    </div>
  );
};
