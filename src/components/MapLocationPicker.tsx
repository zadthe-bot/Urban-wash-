import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  X,
  Loader2,
  Compass,
  Building2,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { AddressLocation } from '../types';

interface MapLocationPickerProps {
  initialLocation: AddressLocation | null;
  onConfirmLocation: (location: AddressLocation) => void;
  onClose?: () => void;
  isFirstLaunch?: boolean;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialLocation,
  onConfirmLocation,
  onClose,
  isFirstLaunch = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const defaultLat = initialLocation?.lat || -6.7720;
  const defaultLng = initialLocation?.lng || 39.2280;

  const [lat, setLat] = useState<number>(defaultLat);
  const [lng, setLng] = useState<number>(defaultLng);
  const [address, setAddress] = useState<string>(
    initialLocation?.address || 'Mikocheni B, Rose Garden Road, Dar es Salaam'
  );
  const [label, setLabel] = useState<string>(initialLocation?.label || 'Home Pickup');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean | null>(null);

  // Reverse geocode lat/lng to human readable address
  const fetchAddress = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // map already initialized

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    // Custom Cyan Map Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
          <div style="background-color: #06b6d4; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 10px 15px -3px rgba(6, 182, 212, 0.5);">
            <div style="width: 12px; height: 12px; background-color: #ffffff; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker([defaultLat, defaultLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    marker.on('dragend', async () => {
      const position = marker.getLatLng();
      setLat(position.lat);
      setLng(position.lng);
      await fetchAddress(position.lat, position.lng);
    });

    map.on('click', async (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
      await fetchAddress(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when lat/lng state changes programmatically
  const updateMapPosition = (newLat: number, newLng: number, newAddress?: string) => {
    setLat(newLat);
    setLng(newLng);
    if (newAddress) setAddress(newAddress);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 16);
      markerRef.current.setLatLng([newLat, newLng]);
    }
  };

  // Request GPS position
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsPermissionGranted(true);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setIsLocating(false);
        await fetchAddress(userLat, userLng);
        updateMapPosition(userLat, userLng);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsPermissionGranted(false);
        setIsLocating(false);
        // Fallback to Dar es Salaam
        updateMapPosition(-6.7720, 39.2280, 'Mikocheni B, Rose Garden Road, Dar es Salaam');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search address using Nominatim API
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsGeocoding(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      if (resp.ok) {
        const results = await resp.json();
        if (results && results.length > 0) {
          const first = results[0];
          const searchLat = parseFloat(first.lat);
          const searchLng = parseFloat(first.lon);
          updateMapPosition(searchLat, searchLng, first.display_name);
        } else {
          alert('Address not found. Please try dragging the map pin directly.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleConfirm = () => {
    const finalLocation: AddressLocation = {
      id: `addr_${Date.now()}`,
      label: label || 'Selected Pickup Point',
      address,
      lat,
      lng,
      isDefault: true,
    };
    onConfirmLocation(finalLocation);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full sm:h-[750px] relative">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>{isFirstLaunch ? 'Setup Pickup Location' : 'Adjust Pickup Pin'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Drag pin on map or search address for laundry pickup & delivery
            </p>
          </div>
          {onClose && !isFirstLaunch && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800/60 z-10 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, street name, or building..."
              className="w-full bg-slate-950 text-slate-100 text-xs pl-9 pr-20 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isGeocoding}
              className="absolute right-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1"
            >
              {isGeocoding ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
            </button>
          </form>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-950 min-h-[250px]">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Overlay GPS Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="absolute bottom-4 right-4 z-10 p-3 bg-slate-900 text-cyan-400 rounded-full shadow-lg border border-slate-700 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center"
            title="Use current GPS location"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Selected Address Details Bottom Sheet */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 shrink-0">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Confirmed Address</span>
            </label>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium leading-relaxed min-h-[42px] flex items-center justify-between">
              {isGeocoding ? (
                <div className="flex items-center space-x-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Fetching street address...</span>
                </div>
              ) : (
                <span>{address}</span>
              )}
            </div>
          </div>

          {/* Label selector (Home, Work, Apartment) */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Home', label: 'Home', icon: Home },
              { id: 'Work', label: 'Work', icon: Building2 },
              { id: 'Apartment', label: 'Other', icon: MapPin },
            ].map((item) => {
              const IconComp = item.icon;
              const isSel = label === item.label;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLabel(item.label)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium border flex items-center justify-center space-x-1.5 transition-all ${
                    isSel
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={isGeocoding || !address}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Location & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
