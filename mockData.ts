// src/mockData.ts
import { type CityNode, type UrbanRoute } from './type';



// A tiny sample city map with 4 locations
export const mockNodes: CityNode[] = [
  { id: 'N1', name: 'Central Hospital', lng: 20, lat: 30, type: 'hospital' },
  { id: 'N2', name: 'Downtown Fire Station', lng: 80, lat: 30, type: 'fire_station' },
  { id: 'N3', name: 'Main Intersection', lng: 50, lat: 60, type: 'intersection' },
  { id: 'N4', name: 'South Transit Hub', lng: 50, lat: 90, type: 'intersection' }
];

// The streets connecting our locations together
export const mockRoutes: UrbanRoute[] = [
  { id: 'R1', sourceNodeId: 'N1', targetNodeId: 'N3', baseWeight: 5, crowdDensity: 1, isBlocked: false }, // Hospital to Intersection
  { id: 'R2', sourceNodeId: 'N2', targetNodeId: 'N3', baseWeight: 4, crowdDensity: 1, isBlocked: false }, // Fire Station to Intersection
  { id: 'R3', sourceNodeId: 'N3', targetNodeId: 'N4', baseWeight: 6, crowdDensity: 1, isBlocked: false }  // Intersection to Transit Hub
];
