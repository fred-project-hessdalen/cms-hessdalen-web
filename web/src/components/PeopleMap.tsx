"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";

// Override Leaflet's high z-index
const mapStyles = `
.leaflet-container-low-z .leaflet-pane {
  z-index: 1 !important;
}
.leaflet-container-low-z .leaflet-tile-pane {
  z-index: 1 !important;
}
.leaflet-container-low-z .leaflet-overlay-pane {
  z-index: 2 !important;
}
.leaflet-container-low-z .leaflet-marker-pane {
  z-index: 3 !important;
}
.leaflet-container-low-z .leaflet-control-zoom {
  z-index: 4 !important;
}
.leaflet-container-low-z .leaflet-control {
  z-index: 4 !important;
}
.leaflet-container-low-z .leaflet-control-container {
  position: relative !important;
  z-index: 4 !important;
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mapStyles;
  document.head.appendChild(style);
}

// Fix default icon issue in Leaflet + React
if (typeof window !== "undefined" && L && L.Icon && L.Icon.Default) {
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
}

export interface MemberLocation {
    name: string;
    displayName?: string;
    location: {
        lat: number;
        lng: number;
    } | null;
}

interface PeopleMapProps {
    members: MemberLocation[];
}

export default function PeopleMap({ members }: PeopleMapProps) {
    // Center on Europe by default
    const defaultPosition: [number, number] = [52, -36];
    
    const validMembers = members.filter((m) => m.location);
    return (
        <MapContainer
            center={defaultPosition}
            zoom={2}
            className="leaflet-container-low-z"
            style={{ height: "400px", width: "100%", margin: "2rem 0", borderRadius: "8px" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validMembers.map((member, idx) =>
                member.location ? (
                    <Marker key={idx} position={[member.location.lat, member.location.lng]}>
                        <Popup>{member.displayName || member.name}</Popup>
                    </Marker>
                ) : null
            )}
            </MapContainer>
      
    );
}
