import { Coordinates } from "../types";

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
};

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export const formatDistance = (distance?: number): string => {
  if (distance === undefined) return '';
  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance.toFixed(1)} km`;
};