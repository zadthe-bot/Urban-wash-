import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Edit2,
  Check,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  ShieldCheck,
  Building2,
  Home,
} from 'lucide-react';
import { UserProfile, AddressLocation } from '../types';
import { updateUserProfile, signOutUser } from '../services/firebaseService';

interface ProfileScreenProps {
  profile: UserProfile;
  onOpenMapPicker: () => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onOpenMapPicker,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(profile.name);
  const [phone, setPhone] = useState<string>(profile.phone || '+255 754 123 456');
  const [photoURL, setPhotoURL] = useState<string>(
    profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`
  );

  const [detergent, setDetergent] = useState<string>(
    profile.preferences?.detergent || 'Hypoallergenic Scent-Free'
  );
  const [starch, setStarch] = useState<string>(profile.preferences?.starchLevel || 'Light');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  ];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        name,
        phone,
        photoURL,
        preferences: {
          detergent: detergent as any,
          starchLevel: starch as any,
          foldStyle: profile.preferences?.foldStyle || 'Standard Fold',
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAddress = async (addrId: string) => {
    const updated = profile.savedAddresses.filter((a) => a.id !== addrId);
    await updateUserProfile(profile.uid, {
      savedAddresses: updated,
    });
  };

  return (
    <div className="p-4 space-y-4 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-100">Customer Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl flex items-center space-x-4">
        <img
          src={photoURL}
          alt={name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-md"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-100 truncate">{profile.name}</h3>
          <p className="text-xs text-slate-400 truncate">{profile.email}</p>
          <span className="inline-block mt-1 text-[10px] bg-cyan-500/15 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
            UID: {profile.uid.slice(0, 10)}...
          </span>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold text-slate-200">Update Profile Details</h4>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-slate-400 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 mt-1 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium">Avatar Photo Preset</label>
              <div className="flex items-center space-x-2 mt-1">
                {avatarPresets.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => setPhotoURL(url)}
                    className={`w-10 h-10 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                      photoURL === url ? 'border-cyan-400 scale-105 shadow-md' : 'border-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Updates</span>
          </button>
        </div>
      )}

      {/* Saved Addresses Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Saved Laundry Addresses</span>
          </span>

          <button
            onClick={onOpenMapPicker}
            className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-2">
          {profile.savedAddresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs space-x-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-100">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/15 px-1.5 py-0.2 rounded border border-cyan-500/30">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-[11px] truncate mt-0.5">{addr.address}</p>
              </div>

              {profile.savedAddresses.length > 1 && (
                <button
                  onClick={() => handleRemoveAddress(addr.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Laundry Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Default Wash Preferences</span>
        </span>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">Detergent</span>
            <span className="font-semibold text-cyan-300">{detergent}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400">Shirt Starch</span>
            <span className="font-semibold text-cyan-300">{starch}</span>
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={async () => {
          await signOutUser();
          onSignOut();
        }}
        className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl text-xs border border-red-500/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out Account</span>
      </button>
    </div>
  );
};
