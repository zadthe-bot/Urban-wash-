import { useState, useCallback } from 'react';
import { AddressLocation } from '../types';

export interface UseGeolocationResult {
  location: AddressLocation | null;
  loading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<AddressLocation | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<string>;
  setLocationManually: (loc: AddressLocation) => void;
}

export function useGeolocation(initialLocation: AddressLocation | null = null): UseGeolocationResult {
  const [location, setLocation] = useState<AddressLocation | null>(initialLocation);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (!resp.ok) throw new Error('Failed to fetch address details');
      const data = await resp.json();
      if (data && data.display_name) {
        return data.display_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.warn('Reverse geocode error:', err);
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<AddressLocation | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const fallbackErr = 'Geolocation is not supported by your browser.';
        setError(fallbackErr);
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const address = await reverseGeocode(lat, lng);

          const newLoc: AddressLocation = {
            id: `gps_${Date.now()}`,
            label: 'Current GPS Location',
            address,
            lat,
            lng,
            isDefault: true,
          };

          setLocation(newLoc);
          setLoading(false);
          resolve(newLoc);
        },
        async (err) => {
          console.warn('Geolocation access denied or failed, using city center fallback:', err.message);
          // High-quality urban fallback location (San Francisco Bay Area Downtown)
          const fallbackLat = 37.7749;
          const fallbackLng = -122.4194;
          const address = await reverseGeocode(fallbackLat, fallbackLng);

          const fallbackLoc: AddressLocation = {
            id: `gps_fallback_${Date.now()}`,
            label: 'Downtown Laundry Zone',
            address: address || '742 Market Street, Financial District, SF',
            lat: fallbackLat,
            lng: fallbackLng,
            isDefault: true,
          };

          setLocation(fallbackLoc);
          setError('Location permission denied or timed out. Defaulted to city center pin.');
          setLoading(false);
          resolve(fallbackLoc);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [reverseGeocode]);

  const setLocationManually = useCallback((loc: AddressLocation) => {
    setLocation(loc);
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    reverseGeocode,
    setLocationManually,
  };
}
