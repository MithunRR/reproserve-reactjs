import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star } from 'lucide-react';

// --- Fix the well-known Leaflet "markers are invisible" bug -----------------
// Vite/webpack bundlers break Leaflet's default icon image paths, so we point
// L.Icon.Default at the CDN-hosted marker assets. No API key required.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Pull a usable [lat, lng] pair off a provider, tolerating string values and
// the various local field names the listing page may use.
const getCoords = (p) => {
  const lat = Number(p.latitude ?? p.lat);
  const lng = Number(p.longitude ?? p.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  return null;
};

// Pan/zoom the map so every marker is visible. Runs whenever the marker set
// changes. Falls back to a sensible default when there are no points.
function FitBounds({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    }
  }, [map, points]);
  return null;
}

export function ProvidersMap({ providers = [], navigate }) {
  // Only providers with valid coordinates can be plotted.
  const located = useMemo(
    () =>
      providers
        .map((p) => ({ provider: p, position: getCoords(p) }))
        .filter((x) => x.position),
    [providers]
  );

  const points = useMemo(() => located.map((x) => x.position), [located]);
  const omitted = providers.length - located.length;

  // Default centre: roughly the centre of the contiguous US, used only until
  // FitBounds kicks in (or when nothing has coordinates).
  const defaultCenter = points[0] || [39.5, -98.35];

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}>

      <MapContainer
        center={defaultCenter}
        zoom={points.length ? 6 : 4}
        scrollWheelZoom
        style={{ height: '70vh', minHeight: 420, width: '100%' }}>

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FitBounds points={points} />

        {located.map(({ provider, position }) => (
          <Marker key={provider.id} position={position}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div className="flex items-center gap-2 mb-1">
                  {provider.profilePhoto ?
                    <img
                      src={provider.profilePhoto}
                      alt={provider.name}
                      style={{ width: 36, height: 36, borderRadius: '9999px', objectFit: 'cover' }} /> :

                    <div
                      style={{
                        width: 36, height: 36, borderRadius: '9999px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#004571', color: '#fff', fontWeight: 700, fontSize: 13
                      }}>
                      {(provider.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                  }
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#001624' }}>{provider.name}</div>
                    {provider.subcategory &&
                      <div style={{ fontSize: 11, color: '#475569' }}>{provider.subcategory}</div>
                    }
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#334155', margin: '4px 0' }}>
                  <Star className="h-3 w-3" style={{ color: '#ff7a45', fill: '#ff7a45' }} />
                  <span style={{ fontWeight: 600 }}>{Number(provider.rating || 0).toFixed(1)}</span>
                  <span>({provider.reviewCount || 0})</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('selectedProviderId', provider.id);
                    navigate && navigate('provider-profile');
                  }}
                  style={{
                    marginTop: 4, width: '100%', padding: '6px 10px', borderRadius: 8,
                    background: '#0089e1', color: '#fff', fontWeight: 600, fontSize: 12,
                    border: 'none', cursor: 'pointer'
                  }}>
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {omitted > 0 &&
        <div className="px-4 py-2 text-xs text-white/70 bg-black/20">
          {omitted} provider{omitted === 1 ? '' : 's'} without map coordinates {omitted === 1 ? 'is' : 'are'} not shown on the map.
        </div>
      }
    </div>);

}

export default ProvidersMap;
