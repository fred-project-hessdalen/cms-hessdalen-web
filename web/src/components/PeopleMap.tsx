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
    // Debug: Log the members data
    console.log('PeopleMap received members:', members);
    console.log('Members count:', members.length);
    
    // Center on Europe by default
    const defaultPosition: [number, number] = [52, -36];
    
    // TEMPORARY: Add mock data to test displayName feature
    const mockMembers: MemberLocation[] = [
        {
            name: "John Smith",
            displayName: "Privacy User", // This should show instead of "John Smith"
            location: { lat: 59.9139, lng: 10.7522 } // Oslo
        },
        {
            name: "Jane Doe", 
            // No displayName - should show "Jane Doe"
            location: { lat: 55.6761, lng: 12.5683 } // Copenhagen
        },
        {
            name: "Bob Johnson",
            displayName: "Anonymous Researcher", // This should show instead of "Bob Johnson"
            location: { lat: 59.3293, lng: 18.0686 } // Stockholm
        }
    ];
    
    // FORCE mock data for testing displayName feature
    const testMembers = [...members, ...mockMembers];
    console.log('Combined testMembers:', testMembers);
    console.log('TestMembers with displayName:', testMembers.filter(m => m.displayName));
    
    const validMembers = testMembers.filter((m) => m.location);
    console.log('Valid members (with location):', validMembers);
    return (
        <MapContainer
            center={defaultPosition}
            zoom={2}
            className="leaflet-container-low-z"
            style={{ height: "400px", width: "100%", margin: "2rem 0", border: "4px solid red", borderRadius: "8px" }}
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
