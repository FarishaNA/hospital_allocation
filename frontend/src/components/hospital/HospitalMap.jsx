import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893049.png',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
    className: 'animate-pulse'
});

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

export default function HospitalMap({ ambulancePos, hospitalPos }) {
    if (!hospitalPos) return <div className="p-10 text-center text-gray-500">Loading Map...</div>;

    return (
        <MapContainer center={[hospitalPos.lat, hospitalPos.lon]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Hospital Location */}
            <Marker position={[hospitalPos.lat, hospitalPos.lon]} icon={hospitalIcon}>
                <Popup>Your Hospital</Popup>
            </Marker>

            {/* Ambulance Location */}
            {ambulancePos && (
                <Marker position={[ambulancePos.lat, ambulancePos.lon]} icon={ambulanceIcon}>
                    <Popup>Incoming Ambulance</Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
