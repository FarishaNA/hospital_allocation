import { useEffect, useState } from 'react';
import { useMap, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';

// Polyline decoder
function decodePolyline(encoded) {
    if (!encoded) return [];
    const points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1E5, lng / 1E5]);
    }
    return points;
}

const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893049.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const startIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

const hospitalIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4320/4320371.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

export default function AnimatedRoute({ route, ambulancePosition, polylineString }) {
    const map = useMap();
    const [decodedPath, setDecodedPath] = useState([]);

    useEffect(() => {
        if (polylineString) {
            try {
                const points = decodePolyline(polylineString);
                if (points.length > 0) {
                    setDecodedPath(points);
                    const bounds = L.latLngBounds(points);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (e) {
                console.error('Polyline decode error:', e);
                fallbackToRoutePoints();
            }
        } else {
            fallbackToRoutePoints();
        }
    }, [route, polylineString, map]);

    const fallbackToRoutePoints = () => {
        if (route && route.length > 0) {
            const points = route.map(p => [p.lat, p.lon]);
            setDecodedPath(points);
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    };

    if (decodedPath.length === 0) return null;

    return (
        <>
            {/* Route line */}
            <Polyline
                positions={decodedPath}
                pathOptions={{ color: '#3B82F6', weight: 5, opacity: 0.7 }}
            />

            {/* Start marker */}
            <Marker position={decodedPath[0]} icon={startIcon}>
                <Popup>Start Point</Popup>
            </Marker>

            {/* Destination marker */}
            <Marker position={decodedPath[decodedPath.length - 1]} icon={hospitalIcon}>
                <Popup>Hospital</Popup>
            </Marker>

            {/* Moving ambulance */}
            {ambulancePosition && (
                <Marker
                    position={[ambulancePosition.lat, ambulancePosition.lon]}
                    icon={ambulanceIcon}
                    zIndexOffset={1000}
                >
                    <Popup>Ambulance</Popup>
                </Marker>
            )}
        </>
    );
}