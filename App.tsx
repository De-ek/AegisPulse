// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { ShieldAlert, Truck, Clock, MapPin, Compass, Activity, Eye } from 'lucide-react';
import Directions from './Directions';

const BENGALURU_DEFAULT = { lat: 13.0450, lng: 77.5350 };
const HOSPITAL_LOC = { lat: 13.0300, lng: 77.5600 }; 

export default function App() {
  const [activeIncidents, setActiveIncidents] = useState(0);
  const [isDispatched, setIsDispatched] = useState(false);
  const [personLocation, setPersonLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [assignedPath, setAssignedPath] = useState<google.maps.LatLngLiteral[]>([]);
  
  const [simStatus, setSimStatus] = useState<'STANDBY' | 'RESPONDING' | 'ARRIVED'>('STANDBY');
  const [eta, setEta] = useState<string>('--');

  // 💡 NEW FIRST-PERSON STATES: Tracks camera direction angle and window reference
  const [vehicleHeading, setVehicleHeading] = useState<number>(0);
  const streetViewRef = useRef<HTMLDivElement | null>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  // Helper function to calculate the driving compass angle between two GPS points
  const calculateHeading = (from: google.maps.LatLngLiteral, to: google.maps.LatLngLiteral) => {
    const lat1 = from.lat * (Math.PI / 180);
    const lng1 = from.lng * (Math.PI / 180);
    const lat2 = to.lat * (Math.PI / 180);
    const lng2 = to.lng * (Math.PI / 180);
    const dLng = lng2 - lng1;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let brng = Math.atan2(y, x) * (180 / Math.PI);
    return (brng + 360) % 360; // Returns compass angle from 0 to 360 degrees
  };

  // 🔄 REAL-TIME DRIVING LOOP WITH FIRST-PERSON SENSOR TRACKING
  useEffect(() => {
    if (assignedPath.length === 0) return;

    let currentStepIndex = 0;
    setVehicleLocation(assignedPath[0]);
    setSimStatus('RESPONDING');

    // Initialize the physical first-person photography box view if it exists
    if (streetViewRef.current && !panoramaRef.current) {
      panoramaRef.current = new google.maps.StreetViewPanorama(streetViewRef.current, {
        position: assignedPath[0],
        disableDefaultUI: true, // Hides standard map buttons to keep layout luxury and clean
        clickToGo: false
      });
    }

    const totalSteps = assignedPath.length;
    const drivingTimer = setInterval(() => {
      currentStepIndex++;
      
      if (currentStepIndex < totalSteps) {
        const nextPos = assignedPath[currentStepIndex];
        const currentPos = assignedPath[currentStepIndex - 1];

        // 1. Calculate the forward angle the truck is traveling toward
        const headingAngle = calculateHeading(currentPos, nextPos);
        setVehicleHeading(headingAngle);

        // 2. Update 2D Map position state
        setVehicleLocation(nextPos);

        // 3. 🚨 UPDATE FIRST-PERSON SENSOR: Move the camera photography frame down the street live!
        if (panoramaRef.current) {
          panoramaRef.current.setPosition(nextPos);
          panoramaRef.current.setPov({
            heading: headingAngle,
            pitch: 0 // Keeps camera looking straight ahead down the road layout
          });
        }

        const remainingMinutes = Math.ceil(totalSteps - currentStepIndex);
        setEta(`${remainingMinutes} mins`);
      } else {
        clearInterval(drivingTimer);
        setSimStatus('ARRIVED');
        setEta('Arrived');
      }
    }, 600); // 600ms updates give Google images time to load gracefully down the street grid

    return () => clearInterval(drivingTimer);
  }, [assignedPath]);

  return (
    <APIProvider apiKey="AIzaSyBvCoYLlmAjUjqlMO5HJoEQ_dNYPslhq5s">
      <style>{`
        @keyframes radar-pulse {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .luxury-siren { animation: radar-pulse 1.4s infinite ease-in-out; }
        body { margin: 0; background-color: #090d16; }
      `}</style>

      <div style={{ backgroundColor: '#090d16', color: '#f3f4f6', minHeight: '100vh', padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', boxSizing: 'border-box' }}>
        
        {/* Navigation Header */}
                {/* 1. Global Navigation Header Bar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #161e31', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
              <Activity size={12} /> SPATIAL TELEMETRY NETWORK
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              AegisPulse
              <span style={{ fontSize: '11px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '6px', fontWeight: '600', border: '1px solid rgba(59, 130, 246, 0.2)', marginLeft: '4px' }}>
                AI DISPATCH &amp; REAL-TIME TRACKING
              </span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#111827', border: '1px solid #161e31', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            CORE SYSTEM ONLINE
          </div>
        </header>

        {/* 3-Column Modern Control Room Split Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Panel A: 2D Drone Top-Down Overview Map */}
          <main style={{ borderRadius: '24px', height: '550px', border: '1px solid #161e31', overflow: 'hidden', backgroundColor: '#111827', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <Map
              style={{ width: '100%', height: '100%' }}
              defaultZoom={13}
              defaultCenter={BENGALURU_DEFAULT}
              gestureHandling={'greedy'}
              mapId="DEMO_MAP_ID"
            >
              <AdvancedMarker position={HOSPITAL_LOC}>
                <Pin background={'#ef4444'} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={1.1} />
              </AdvancedMarker>

              {personLocation && (
                <AdvancedMarker position={personLocation}>
                  <Pin background={'#f59e0b'} borderColor={'#ffffff'} glyphColor={'#ffffff'} scale={1.1} />
                </AdvancedMarker>
              )}

              {vehicleLocation && (
                <AdvancedMarker position={vehicleLocation}>
                  <div className="luxury-siren" style={{ backgroundColor: '#3b82f6', padding: '12px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2.5px solid #ffffff', transition: 'all 0.6s linear' }}>
                    <Truck size={16} color="white" />
                  </div>
                </AdvancedMarker>
              )}

              <MapUpdater targetLocation={personLocation} />

              {isDispatched && personLocation && (
                <Directions 
                  origin={HOSPITAL_LOC} 
                  destination={personLocation} 
                  onPathCalculated={(path) => setAssignedPath(path)} 
                />
              )}
            </Map>
          </main>

          {/* 🚨 PANEL B: THE NEW FIRST-PERSON DRIVER Windshield VIEWPORT SENSOR */}
          <section style={{ borderRadius: '24px', height: '550px', border: '1px solid #161e31', overflow: 'hidden', position: 'relative', backgroundColor: '#111827', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, backgroundColor: 'rgba(17, 24, 39, 0.85)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: '20px', border: '1px solid #161e31', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '600', color: '#60a5fa' }}>
              <Eye size={14} /> LIVE FIRST-PERSON STREAM
            </div>
            
            {/* The physical div where Google will stream street level photographs */}
            <div ref={streetViewRef} style={{ width: '100%', height: '100%' }} />
            
            {simStatus === 'STANDBY' && (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(17, 24, 39, 0.9)', color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '24px', boxSizing: 'border-box' }}>
                <div>
                  <Compass size={32} style={{ marginBottom: '12px', color: '#4b5563' }} />
                  <p style={{ margin: 0 }}>Driver sensor camera offline.</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Camera activates instantly upon vehicle dispatch.</p>
                </div>
              </div>
            )}
          </section>

          {/* Panel C: Clean Metric Operations Sidebar Controls */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Metric Box 1: Active Incident Status */}
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '20px', border: '1px solid #161e31', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <Activity size={22} color="#60a5fa" />
              </div>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  ACTIVE INCIDENTS
                </div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                  {activeIncidents}
                </div>
              </div>
            </div>

            {/* Metric Box 2: Expected Arrival Timeline */}
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '20px', border: '1px solid #161e31', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <Clock size={22} color="#f59e0b" />
              </div>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  EXPECTED ARRIVAL
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                  {eta}
                </div>
              </div>
            </div>

            {/* Metric Box 3: Total Dispatches Audit Log */}
            <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '20px', border: '1px solid #161e31', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <MapPin size={22} color="#10b981" />
              </div>
              <div>
                <div style={{ color: '#9ca3af', fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  TOTAL DISPATCHES
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>
                  {activeIncidents} {activeIncidents === 1 ? 'Incident Fixed' : 'Incidents Tracked'}
                </div>
              </div>
            </div>

            {/* Premium Call Button Trigger */}
            <button
              onClick={() => {
                if (!navigator.geolocation) return;
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const liveCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setPersonLocation(liveCoords);
                    setIsDispatched(true);
                    setActiveIncidents((prev) => prev + 1);
                  },
                  () => {},
                  { enableHighAccuracy: true }
                );
              }}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '18px 24px',
                borderRadius: '16px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                letterSpacing: '0.3px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s ease',
                marginTop: '12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              <ShieldAlert size={20} /> DETECT MY LOCATION &amp; DISPATCH
            </button>
          </aside>
        </div>
      </div>
    </APIProvider>
  );
}

// 🌐 Map Camera Panning Utility Component (Lives independently at the root file bottom)
function MapUpdater({ targetLocation }: { targetLocation: google.maps.LatLngLiteral | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (map && targetLocation) {
      map.panTo(targetLocation);
      map.setZoom(14);
    }
  }, [map, targetLocation]);
  
  return null;
}
