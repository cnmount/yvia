import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Registration } from '../types';

// Exception-safe localStorage access to survive inside sandboxed iframes
const safeLocalStorage = {
  getItem: (key: string): string => {
    try {
      return localStorage.getItem(key) || '';
    } catch (e) {
      console.warn('localStorage.getItem is blocked by iframe security constraints:', e);
      return '';
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage.setItem is blocked by iframe security constraints:', e);
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('localStorage.removeItem is blocked by iframe security constraints:', e);
      return false;
    }
  }
};

// Retrieve API key from process env or safe local storage
const getInitialKey = () => {
  const envKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  if (envKey && envKey !== 'YOUR_API_KEY') return envKey;
  return safeLocalStorage.getItem('YVIA_MAPS_KEY');
};

function MapCenterController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

function MapComponent({ 
  apiKey, 
  submissions, 
  onClearKey 
}: { 
  apiKey: string; 
  submissions: Registration[]; 
  onClearKey?: () => void;
}) {
  const [center, setCenter] = useState({ lat: -37.787, lng: 175.279 }); // Fallback center to Hamilton, NZ
  const [geocodingStatus, setGeocodingStatus] = useState<string>('');

  // Auto-locate viewer based on IP client coordinates
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          setCenter({ lat: data.latitude, lng: data.longitude });
        }
      })
      .catch((err) => console.log('Location autocomplete bypassed:', err));
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative w-full">
        <APIProvider apiKey={apiKey} version="weekly">
          <Map
            defaultCenter={center}
            defaultZoom={7}
            mapId="DEMO_MAP_ID" // Uses Google official demo id supporting advanced custom markers
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '520px', borderRadius: '1.5rem' }}
            className="border border-blue-100 shadow-sm"
          >
            <MapCenterController center={center} />
            <MapMarkers submissions={submissions} onStatusUpdate={setGeocodingStatus} />
          </Map>
        </APIProvider>

        {/* Floating custom key stats indicator */}
        {safeLocalStorage.getItem('YVIA_MAPS_KEY') && onClearKey && (
          <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-md">
            <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Local Key Connected
            </span>
            <button 
              type="button"
              onClick={onClearKey}
              className="text-[9px] font-sans font-bold bg-slate-100 px-2 py-1 rounded hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-tight"
            >
              Reset Key
            </button>
          </div>
        )}
      </div>

      {geocodingStatus && (
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <span>Google geocoding engine: <strong className="text-slate-700">{geocodingStatus}</strong></span>
          <span className="text-slate-400">Markers plot dynamically</span>
        </div>
      )}
    </div>
  );
}

function MapMarkers({ 
  submissions, 
  onStatusUpdate 
}: { 
  submissions: Registration[]; 
  onStatusUpdate: (status: string) => void;
}) {
  const [coords, setCoords] = useState<Record<string, google.maps.LatLngLiteral>>({});
  const geocoderLib = useMapsLibrary('geocoding');

  useEffect(() => {
    if (!geocoderLib || !submissions) return;
    const geocoder = new google.maps.Geocoder();
    
    // De-duplicate registry cities
    const uniqueCities = Array.from(
      new Set(
        submissions
          .map(s => s.city?.trim())
          .filter(Boolean)
      )
    );
    
    if (uniqueCities.length === 0) {
      onStatusUpdate('No registered users to plot yet');
      return;
    }

    onStatusUpdate(`Pinning ${uniqueCities.length} community cities...`);

    uniqueCities.forEach(city => {
      geocoder.geocode({ address: city }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setCoords(prev => ({
            ...prev,
            [city]: {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            }
          }));
          onStatusUpdate('Active pins rendered successfully');
        } else {
          console.warn(`Geocoding failed for [${city}]:`, status);
          if (status === 'REQUEST_DENIED') {
            onStatusUpdate('REQUEST_DENIED - Ensure "Geocoding API" is active on your Google Cloud project console');
          } else {
            onStatusUpdate(`Status: ${status} for ${city}`);
          }
        }
      });
    });
  }, [submissions, geocoderLib]);

  return (
    <>
      {Object.entries(coords).map(([city, position]) => (
        <AdvancedMarker key={city} position={position} title={city}>
          <Pin background="#f59e0b" borderColor="#fff" glyphColor="#fff" scale={0.95} />
        </AdvancedMarker>
      ))}
    </>
  );
}

export default function AboutUsPage({ submissions }: { submissions: Registration[] }) {
  const [apiKey, setApiKey] = useState(getInitialKey());
  const [inputKey, setInputKey] = useState('');
  const [iframeStorageWarning, setIframeStorageWarning] = useState(false);

  const hasValidKey = Boolean(apiKey) && apiKey !== 'YOUR_API_KEY';

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    if (cleanKey) {
      const persisted = safeLocalStorage.setItem('YVIA_MAPS_KEY', cleanKey);
      setApiKey(cleanKey);
      
      if (persisted) {
        // Safe to reload to refresh Google Maps script injection cleanly
        window.location.reload();
      } else {
        // localStorage is restricted inside iframe. Warn the user but proceed in-state
        setIframeStorageWarning(true);
      }
    }
  };

  const handleClearKey = () => {
    safeLocalStorage.removeItem('YVIA_MAPS_KEY');
    setApiKey(process.env.GOOGLE_MAPS_PLATFORM_KEY || '');
    setInputKey('');
    window.location.reload();
  };

  if (!hasValidKey) {
    return (
      <div className="bg-white rounded-[2rem] p-8 border border-slate-200 text-center max-w-2xl mx-auto my-6 shadow-sm">
        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="font-display font-extrabold text-xl mb-2 text-slate-900">Google Maps Integration Required</h3>
        
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
          To display the live interactive community map, please provide a Google Maps Platform API key.
        </p>

        {/* Input box to directly paste Google Maps API Key */}
        <form onSubmit={handleSaveKey} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200/80 mb-6">
          <input
            type="password"
            placeholder="Paste your AIzaSy... Google Maps API key"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white text-xs border border-slate-200 focus:border-[#2563eb] outline-none font-mono"
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider shrink-0"
          >
            Apply Key
          </button>
        </form>

        {iframeStorageWarning && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] rounded-xl text-left leading-normal">
            <strong>Notice:</strong> Your browser has blocked iframe storage access. The key has been applied in-memory for this active session. <strong>To prevent loss, do not refresh the page.</strong>
          </div>
        )}

        <div className="text-[11px] text-slate-400 leading-relaxed text-left max-w-md mx-auto border-t border-slate-100 pt-4 space-y-2">
          <h4 className="font-bold text-slate-500 uppercase tracking-wide">How to get an API Key:</h4>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Go to the <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-[#2563eb] underline hover:text-blue-700">Google Cloud Console</a>.</li>
            <li>Enable the <strong>Maps JavaScript API</strong> and <strong>Geocoding API</strong> for this key.</li>
            <li>Make sure billing is enabled so Google authorizes map tiles rendering.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MapComponent 
        apiKey={apiKey} 
        submissions={submissions} 
        onClearKey={handleClearKey} 
      />
    </div>
  );
}
