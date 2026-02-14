import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
    iconSize: [45, 45],
    iconAnchor: [22, 45],
});

export default function HospitalMap({ ambulancePos, hospitalPos }) {
    if (!hospitalPos) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500 bg-gray-100">
                Loading map...
            </div>
        );
    }

    return (
        <MapContainer
            center={[hospitalPos.lat, hospitalPos.lon]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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