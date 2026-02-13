import { useEffect } from 'react';
import { useMap, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

const ambulanceIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2893/2893049.png', // Temporary external placeholder, replace with local asset for offline
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'ambulance-marker'
});

const startIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

export default function AnimatedRoute({ route, ambulancePosition }) {
    const map = useMap();

    // Fit bounds to show full route
    useEffect(() => {
        if (route && route.length > 0) {
            const bounds = L.latLngBounds(route.map(p => [p.lat, p.lon]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [route, map]);

    if (!route || route.length === 0) return null;

    const pathCoordinates = route.map(p => [p.lat, p.lon]);

    // Find current progress index to style past vs future path differently could be added here
    // For now, simpler implementation: Full blue path

    return (
        <>
            {/* The Route Path */}
            <Polyline
                positions={pathCoordinates}
                pathOptions={{ color: '#3B82F6', weight: 6, opacity: 0.7, dashArray: '10, 10' }}
            />

            {/* Start Point */}
            <Marker position={pathCoordinates[0]} icon={startIcon} />

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
