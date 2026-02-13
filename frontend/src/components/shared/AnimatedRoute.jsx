import { useEffect, useState } from 'react';
import { useMap, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
// import polyline from '@mapbox/polyline'; // Removed to use local decoder

// Simple decoder to avoid dependency if we want to keep it light
function decodePolyline(encoded) {
    if (!encoded) return [];
    var points = [];
    var index = 0, len = encoded.length;
    var lat = 0, lng = 0;
    while (index < len) {
        var b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;
        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;
        points.push([lat / 1E5, lng / 1E5]);
    }
    return points;
}

const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893049.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'ambulance-marker'
});

const startIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

export default function AnimatedRoute({ route, ambulancePosition, polylineString }) {
    const map = useMap();
    const [decodedPath, setDecodedPath] = useState([]);

    useEffect(() => {
        if (polylineString) {
            try {
                const points = decodePolyline(polylineString);
                setDecodedPath(points);
                if (points.length > 0) {
                    const bounds = L.latLngBounds(points);
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            } catch (e) {
                console.error("Polyline decode error:", e);
                // Fallback to minimal line
                if (route && route.length > 0) {
                    setDecodedPath(route.map(p => [p.lat, p.lon]));
                }
            }
        } else if (route && route.length > 0) {
            // Fallback to legacy waypoint route if no polyline
            const points = route.map(p => [p.lat, p.lon]);
            setDecodedPath(points);
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, polylineString, map]);

    if (decodedPath.length === 0) return null;

    return (
        <>
            {/* The Route Path */}
            <Polyline
                positions={decodedPath}
                pathOptions={{ color: '#3B82F6', weight: 6, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }}
            />

            {/* Start Point */}
            <Marker position={decodedPath[0]} icon={startIcon} />

            {/* Moving Ambulance */}
            {ambulancePosition && (
                <Marker
                    position={[ambulancePosition.lat, ambulancePosition.lon]}
                    icon={ambulanceIcon}
                    zIndexOffset={100}
                />
            )}
        </>
    );
}
