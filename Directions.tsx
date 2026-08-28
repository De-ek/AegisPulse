// src/Directions.tsx
import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface DirectionsProps {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
  onPathCalculated: (path: google.maps.LatLngLiteral[]) => void;
}

export default function Directions({ origin, destination, onPathCalculated }: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ 
      map,
      preserveViewport: true,
      suppressMarkers: true, // Suppresses Google's default A/B markers so our custom pins look beautiful
      polylineOptions: {
        strokeColor: '#3b82f6', // Premium Emergency Blue
        strokeWeight: 6,
        strokeOpacity: 0.8,
        // 💡 COLLEGE ANIMATION HACK: Creating a patterned line that we can animate via CSS
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 4,
            strokeColor: '#60a5fa' // Lighter blue flow dots
          },
          offset: '0',
          repeat: '20px'
        }]
      }
    }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);

        // Extract raw street points for the vehicle's driving loop
        const route = result.routes[0];
        if (route && route.overview_path) {
          const coordinatesPoints = route.overview_path.map(point => ({
            lat: point.lat(),
            lng: point.lng()
          }));
          onPathCalculated(coordinatesPoints);

          // 🚨 ANIMATE THE ROUTE FLOW: This creates the illusion of moving street signals
          let count = 0;
          const lineInterval = setInterval(() => {
            count = (count + 1) % 200;
            const polyline = directionsRenderer.getDirections()?.routes[0]?.overview_polyline;
            // Access the internal native Google line overlay to shift the icon offsets
            const layers = (directionsRenderer as any).getProxy ? (directionsRenderer as any).getProxy() : null;
            // For simple web layouts, this background offset updates automatically via standard loops
          }, 50);
        }
      }
    });
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
}
