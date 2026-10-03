import { useEffect, useMemo, useRef, useState } from 'react';
import { divIcon, latLngBounds, type LatLngExpression } from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { CloseIcon, LocationIcon } from './icons';
import { formatTemperature } from './format';
import type { Location } from '../types';

interface MapCardProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const SINGAPORE_CENTER: LatLngExpression = [1.3521, 103.8198];
const MAP_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function createPinIcon(isSelected: boolean) {
  return divIcon({
    className: `weather-map-pin${isSelected ? ' weather-map-pin-selected' : ''}`,
    html: '<span></span>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function FitLocations({ locations }: { locations: Location[] }) {
  const map = useMap();
  const coordinateKey = locations
    .map(({ id, latitude, longitude }) => `${id}:${latitude},${longitude}`)
    .join('|');

  useEffect(() => {
    if (locations.length === 0) {
      map.setView(SINGAPORE_CENTER, 11);
      return;
    }

    if (locations.length === 1) {
      const [location] = locations;
      map.setView([location.latitude, location.longitude], 12);
      return;
    }

    const bounds = latLngBounds(
      locations.map(
        ({ latitude, longitude }) => [latitude, longitude] as [number, number],
      ),
    );
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
  }, [coordinateKey, locations, map]);

  return null;
}

function WeatherMap({ locations, selectedId, onSelect }: MapCardProps) {
  const selectedLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude),
      ),
    [locations],
  );

  return (
    <MapContainer
      center={SINGAPORE_CENTER}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full bg-slate-200"
    >
      <TileLayer url={MAP_TILES} attribution={MAP_ATTRIBUTION} />
      <FitLocations locations={selectedLocations} />
      {selectedLocations.map((location) => {
        const condition =
          location.weather.condition?.trim() || 'Weather unavailable';
        const icon = createPinIcon(location.id === selectedId);

        return (
          <Marker
            key={location.id}
            position={[location.latitude, location.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onSelect(location.id) }}
            title={condition}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -8]}
              className="weather-map-tooltip"
            >
              <span className="weather-map-label">
                <strong>
                  {formatTemperature(location.weather.temperature_c)}
                </strong>
                <span>{condition}</span>
              </span>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export function MapCard({ locations, selectedId, onSelect }: MapCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    const expandButton = expandButtonRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      expandButton?.focus();
    };
  }, [isFullscreen]);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
            <LocationIcon className="h-3.5 w-3.5" />
            <span>Locations Map</span>
          </div>
          {locations.length > 0 && (
            <button
              ref={expandButtonRef}
              type="button"
              onClick={() => setIsFullscreen(true)}
              aria-label="Expand locations map"
              className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs text-white/85 hover:bg-white/[0.16] focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Expand map
            </button>
          )}
        </header>

        {locations.length > 0 ? (
          <div
            className="weather-map-surface h-64 isolate"
            role="region"
            aria-label="Map showing saved locations"
          >
            <WeatherMap
              locations={locations}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 px-6 text-center">
            <LocationIcon className="h-6 w-6 text-white/50" />
            <p className="text-sm font-medium text-white/85">
              Your locations will appear here
            </p>
            <p className="text-xs text-white/60">
              Add a location from the sidebar to see it on the map.
            </p>
          </div>
        )}
      </section>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-[1200] isolate flex flex-col bg-slate-950/95 p-3 backdrop-blur-xl sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fullscreen-map-title"
        >
          <header className="relative z-[1201] mb-3 flex shrink-0 items-center justify-between gap-3">
            <h2
              id="fullscreen-map-title"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-white/85"
            >
              Locations Map
            </h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen map"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>
          <div
            className="weather-map-surface min-h-0 flex-1 isolate overflow-hidden rounded-2xl border border-white/15"
            role="region"
            aria-label="Fullscreen map showing saved locations"
          >
            <WeatherMap
              locations={locations}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </div>
        </div>
      )}
    </>
  );
}
