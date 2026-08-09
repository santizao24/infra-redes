import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Obra } from '../../types';
import { OBRA_ESTADO_LABELS, OBRA_TIPO_LABELS, PAVIMENTO_TIPO_LABELS, PAVIMENTO_ESTADO_LABELS, ESTADO_MARKER_COLORS, calcProgresso } from '../../utils/labels';

// Fix default marker icons in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function MapCenterController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

export function MapPicker({ latitude, longitude, onLocationChange, height = '350px' }: MapPickerProps) {
  const center: [number, number] = latitude && longitude ? [latitude, longitude] : [39.5, -8.0];
  const zoom = latitude && longitude ? 15 : 7;

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-slate-200">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onMapClick={onLocationChange} />
        {latitude && longitude && <Marker position={[latitude, longitude]} />}
      </MapContainer>
    </div>
  );
}

interface ObrasMapProps {
  obras: Obra[];
  height?: string;
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (obra: Obra) => void;
  interactive?: boolean;
}

export function ObrasMap({ obras, height = '500px', center, zoom = 7, onMarkerClick, interactive = true }: ObrasMapProps) {
  const mapCenter: [number, number] = center || (obras.length > 0 && obras[0].latitude && obras[0].longitude
    ? [obras[0].latitude, obras[0].longitude]
    : [39.5, -8.0]);

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-slate-200">
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {center && <MapCenterController center={center} zoom={zoom} />}
        {obras.map((obra) => {
          if (!obra.latitude || !obra.longitude) return null;
          const color = ESTADO_MARKER_COLORS[obra.estado] || '#64748b';
          const progresso = calcProgresso(obra.metrosPrevistos, obra.metrosExecutados);

          return (
            <Marker
              key={obra.id}
              position={[obra.latitude, obra.longitude]}
              icon={createColoredIcon(color)}
              eventHandlers={interactive && onMarkerClick ? { click: () => onMarkerClick(obra) } : undefined}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h4 className="font-semibold text-sm mb-1">{obra.nome}</h4>
                  <p className="text-xs text-slate-600">{OBRA_TIPO_LABELS[obra.tipo]} · {OBRA_ESTADO_LABELS[obra.estado]}</p>
                  <p className="text-xs mt-1">{obra.metrosExecutados} / {obra.metrosPrevistos} m ({progresso}%)</p>
                  {obra.tipoPavimento && (
                    <p className="text-xs mt-1">
                      Pavimento: {PAVIMENTO_TIPO_LABELS[obra.tipoPavimento]}
                      {obra.estadoPavimento && ` (${PAVIMENTO_ESTADO_LABELS[obra.estadoPavimento]})`}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

interface LocationSearchProps {
  onSelect: (lat: number, lng: number, address: string) => void;
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = (query: string) => {
    clearTimeout(timeoutRef.current);
    if (query.length < 3) return;

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pt&limit=1`
        );
        const data = await res.json();
        if (data.length > 0) {
          onSelect(parseFloat(data[0].lat), parseFloat(data[0].lon), data[0].display_name);
        }
      } catch {
        // silently fail
      }
    }, 500);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Pesquisar localização..."
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
