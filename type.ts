/// <reference types="google.maps" />
// src/type.ts
export interface CityNode {
  id: string;
  name: string;
  // Upgrade from x/y percentages to true real-world geographic coordinates
  lat: number; 
  lng: number; 
  type: 'hospital' | 'fire_station' | 'dispatch_center' | 'intersection';
}

export interface UrbanRoute {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  baseWeight: number;
  crowdDensity: number;
  isBlocked: boolean;
  // A road on a real map isn't always a straight line! 
  // We can track the path shape as a list of real geo-coordinates.
  polylinePoints?: google.maps.LatLngLiteral[]; 
}

export interface EmergencyVehicle {
  id: string;
  type: 'ambulance' | 'fire_truck' | 'police_car';
  status: 'idle' | 'en_route' | 'at_scene';
  // The vehicle's exact continuous real-time coordinate position
  currentLocation: { lat: number; lng: number }; 
  targetNodeId: string;
  assignedPath: string[]; 
}
