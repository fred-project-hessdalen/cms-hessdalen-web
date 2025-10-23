"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";

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
            style={{ height: "400px", width: "100%", margin: "2rem 0" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validMembers.map((member, idx) =>
                member.location ? (
                    <Marker key={idx} position={[member.location.lat, member.location.lng]}>
                        <Popup>{member.name}</Popup>
                    </Marker>
                ) : null
            )}
        </MapContainer>
    );
}
