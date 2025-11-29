import { describe, it, expect } from 'vitest';
import { calculateDistance } from './geo';

describe('calculateDistance', () => {
  it('should calculate distance between two points correctly', () => {
    // New York (40.7128, -74.0060) to London (51.5074, -0.1278)
    // Distance is approx 5570 km
    const ny = { latitude: 40.7128, longitude: -74.0060 };
    const london = { latitude: 51.5074, longitude: -0.1278 };
    
    const distance = calculateDistance(ny, london);
    
    // Allow small margin of error due to rounding
    expect(distance).toBeGreaterThan(5500);
    expect(distance).toBeLessThan(5600);
  });

  it('should return 0 for same coordinates', () => {
    const point = { latitude: 10.0, longitude: 20.0 };
    expect(calculateDistance(point, point)).toBe(0);
  });

  it('should handle small distances (meters)', () => {
    const p1 = { latitude: 40.7128, longitude: -74.0060 };
    const p2 = { latitude: 40.7129, longitude: -74.0060 }; // very close
    
    const distance = calculateDistance(p1, p2);
    expect(distance).toBeLessThan(0.1); // less than 100m
  });
});
