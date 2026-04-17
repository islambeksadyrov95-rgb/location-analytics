"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import type { Listing } from "@/lib/types";
import { computeScore, fmt } from "@/lib/scoring";

// Фикс иконок Leaflet в Next.js
const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#fbbf24;border:3px solid #08080f;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#08080f;box-shadow:0 2px 8px rgba(0,0,0,0.4)">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function createScoreIcon(score: number) {
  const clr =
    score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : score >= 30 ? "#fb923c" : "#f87171";
  return L.divIcon({
    className: "",
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${clr};border:3px solid #08080f;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#08080f;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${score}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Компонент для синхронизации карты с выбранным листингом
function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.8 });
  }, [map, lat, lng]);
  return null;
}

interface MapProps {
  listings: Listing[];
  niche: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  radius?: number;
}

export default function MapView({ listings, niche, selectedId, onSelect, radius }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const selected = listings.find((l) => l.id === selectedId);

  // Центр Алматы
  const center: [number, number] = [43.245, 76.9];

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full h-full rounded-xl"
      ref={mapRef}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {selected && <FlyTo lat={selected.lat} lng={selected.lng} />}

      {listings.map((l) => {
        const score = computeScore(l, niche);
        const isSelected = l.id === selectedId;
        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={isSelected ? defaultIcon : createScoreIcon(score)}
            eventHandlers={{ click: () => onSelect(l.id) }}
          >
            <Popup>
              <div className="text-xs">
                <div className="font-bold">{l.area} м² · {l.district}</div>
                <div className="text-[#6b7280]">{l.address}</div>
                <div className="font-black text-[#fbbf24] mt-1">{fmt(l.price)} ₸/мес</div>
                <div className="mt-1">Скоринг: <b>{score}</b>/100</div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {selected && radius && (
        <Circle
          center={[selected.lat, selected.lng]}
          radius={radius}
          pathOptions={{
            color: "#fbbf24",
            fillColor: "#fbbf24",
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: "6 4",
          }}
        />
      )}
    </MapContainer>
  );
}
