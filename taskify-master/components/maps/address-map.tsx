'use client';

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap
} from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import '../styles/globals.css';
import L, { LatLngExpression } from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

interface MapWithMarkerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLatLng?: { lat: number; lng: number };  // Allow optional initial position
}

const svgIcon = new L.Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMDAwMDAwIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZpZXdCb3g9IjAgMCA0MjUuOTYzIDQyNS45NjMiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIGQ9Ik0yMTMuMjg1LDBoLTAuNjA4QzEzOS4xMTQsMCw3OS4yNjgsNTkuODI2LDc5LjI2OCwxMzMuMzYxYzAsNDguMjAyLDIxLjk1MiwxMTEuODE3LDY1LjI0NiwxODkuMDgxIGMzMi4wOTgsNTcuMjgxLDY0LjY0NiwxMDEuMTUyLDY0Ljk3MiwxMDEuNTg4YzAuOTA2LDEuMjE3LDIuMzM0LDEuOTM0LDMuODQ3LDEuOTM0YzAuMDQzLDAsMC4wODcsMCwwLjEzLS4wMDIgYzEuNTYxLTAuMDQzLDMuMDAyLTAuODQyLDMuODY4LTIuMTQzYzAuMzIxLTAuNDg2LDMyLjYzNy00OS4yODcsNjQuNTE3LTEwOC45NzZjNDMuMDMtODAuNTYzLDY0Ljg0OC0xNDEuNjI0LDY0Ljg0OC0xODEuNDgyIEMzNDYuNjkzLDU5LjgyNSwyODYuODQ2LDAsMjEzLjI4NSwweiBNMjc0Ljg2NSwxMzYuNjJjMCwzNC4xMjQtMjcuNzYxLDYxLjg4NC02MS44ODUsNjEuODg0IGMtMzQuMTIzLDAtNjEuODg0LTI3Ljc2MS02MS44ODQtNjEuODg0czI3Ljc2MS02MS44ODQsNjEuODg0LTYxLjg4NCAgQzI0Ny4xMDQsNzQuNzM2LDI3NC44NjUsMTAyLjQ5NywyNzQuODY1LDEzNi42MnogIi8+PC9zdmc+',
  iconSize: [40, 40],
  iconAnchor: [20, 40]
});

const MapWithMarker: React.FC<MapWithMarkerProps> = ({ onLocationSelect, initialLatLng }) => {
  const [position, setPosition] = useState<LatLngExpression | null>(initialLatLng || null);
  const defaultCenter: LatLngExpression = [37.7749, -122.4194];  // Default center if no initialLatLng is provided

  // Handle the map click event and update position
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ lat, lng });  // Pass the new location to the parent component
      }
    });

    return position ? (
      <Marker position={position} icon={svgIcon} draggable />
    ) : null;
  };

  // GeoSearch control to search and select a location
  const SearchControl = () => {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();

      const searchControl = new (GeoSearchControl as any)({
        provider,
        style: 'bar',
        autoComplete: true,
        autoCompleteDelay: 250,
        showMarker: true,
        showPopup: true,
        marker: {
          icon: svgIcon,
          draggable: true
        },
        maxMarkers: 1,
        retainZoomLevel: false,
        animateZoom: true,
        autoClose: true,
        searchLabel: 'Enter address',
        keepResult: true
      });

      map.addControl(searchControl);

      // Listen for the location selection event
      const controlElement = searchControl.onAdd(map);
      controlElement.addEventListener('geosearch/showlocation', (e: any) => {
        const { lat, lng } = e.location;
        setPosition([lat, lng]);
        onLocationSelect({ lat, lng });  // Pass the selected location's lat and lng
      });

      return () => {
        map.removeControl(searchControl); // Clean up by removing the control
        controlElement.removeEventListener('geosearch/showlocation', () => {}); // Clean up event listener
      };
    }, [map]);

    return null;
  };

  return (
    <MapContainer
      center={position || defaultCenter}
      zoom={10}
      style={{ width: '100%', height: '207px' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <SearchControl />
      <LocationMarker />
    </MapContainer>
  );
};

export default MapWithMarker;
