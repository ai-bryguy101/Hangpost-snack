/** Curated places for the home-base picker (ADR-0009 — Hinge-style one-home).
 *
 * A user sets ONE home location; non-DC users and movers pick another city.
 * This is a curated list (no external geocoding for the beta) covering DC
 * neighbourhoods + major US cities — enough to set a home anywhere people are
 * likely to move. Swap in a geocoding search later for arbitrary addresses.
 */

export interface Place {
  label: string;
  latitude: number;
  longitude: number;
}

export const PLACES: readonly Place[] = [
  // DC neighbourhoods (the beta market)
  { label: "Washington DC (Downtown)", latitude: 38.9072, longitude: -77.0369 },
  { label: "Dupont Circle, DC", latitude: 38.9097, longitude: -77.0434 },
  { label: "Georgetown, DC", latitude: 38.9076, longitude: -77.0723 },
  { label: "Capitol Hill, DC", latitude: 38.8899, longitude: -77.0091 },
  { label: "Adams Morgan, DC", latitude: 38.9221, longitude: -77.0419 },
  { label: "U Street, DC", latitude: 38.917, longitude: -77.028 },
  { label: "Arlington, VA", latitude: 38.8816, longitude: -77.0910 },
  { label: "Alexandria, VA", latitude: 38.8048, longitude: -77.0469 },
  { label: "Bethesda, MD", latitude: 38.9847, longitude: -77.0947 },
  { label: "Silver Spring, MD", latitude: 38.9907, longitude: -77.0261 },
  // Major US cities
  { label: "New York, NY", latitude: 40.7128, longitude: -74.006 },
  { label: "Brooklyn, NY", latitude: 40.6782, longitude: -73.9442 },
  { label: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437 },
  { label: "San Francisco, CA", latitude: 37.7749, longitude: -122.4194 },
  { label: "Oakland, CA", latitude: 37.8044, longitude: -122.2712 },
  { label: "San Diego, CA", latitude: 32.7157, longitude: -117.1611 },
  { label: "San Jose, CA", latitude: 37.3382, longitude: -121.8863 },
  { label: "Sacramento, CA", latitude: 38.5816, longitude: -121.4944 },
  { label: "Seattle, WA", latitude: 47.6062, longitude: -122.3321 },
  { label: "Portland, OR", latitude: 45.5152, longitude: -122.6784 },
  { label: "Denver, CO", latitude: 39.7392, longitude: -104.9903 },
  { label: "Boulder, CO", latitude: 40.015, longitude: -105.2705 },
  { label: "Austin, TX", latitude: 30.2672, longitude: -97.7431 },
  { label: "Dallas, TX", latitude: 32.7767, longitude: -96.797 },
  { label: "Houston, TX", latitude: 29.7604, longitude: -95.3698 },
  { label: "San Antonio, TX", latitude: 29.4241, longitude: -98.4936 },
  { label: "Chicago, IL", latitude: 41.8781, longitude: -87.6298 },
  { label: "Minneapolis, MN", latitude: 44.9778, longitude: -93.265 },
  { label: "Madison, WI", latitude: 43.0731, longitude: -89.4012 },
  { label: "Detroit, MI", latitude: 42.3314, longitude: -83.0458 },
  { label: "Ann Arbor, MI", latitude: 42.2808, longitude: -83.743 },
  { label: "Columbus, OH", latitude: 39.9612, longitude: -82.9988 },
  { label: "Pittsburgh, PA", latitude: 40.4406, longitude: -79.9959 },
  { label: "Philadelphia, PA", latitude: 39.9526, longitude: -75.1652 },
  { label: "Boston, MA", latitude: 42.3601, longitude: -71.0589 },
  { label: "Atlanta, GA", latitude: 33.749, longitude: -84.388 },
  { label: "Nashville, TN", latitude: 36.1627, longitude: -86.7816 },
  { label: "Charlotte, NC", latitude: 35.2271, longitude: -80.8431 },
  { label: "Raleigh, NC", latitude: 35.7796, longitude: -78.6382 },
  { label: "Miami, FL", latitude: 25.7617, longitude: -80.1918 },
  { label: "Orlando, FL", latitude: 28.5383, longitude: -81.3792 },
  { label: "New Orleans, LA", latitude: 29.9511, longitude: -90.0715 },
  { label: "Phoenix, AZ", latitude: 33.4484, longitude: -112.074 },
  { label: "Las Vegas, NV", latitude: 36.1699, longitude: -115.1398 },
  { label: "Salt Lake City, UT", latitude: 40.7608, longitude: -111.891 },
  { label: "Kansas City, MO", latitude: 39.0997, longitude: -94.5786 },
  { label: "Richmond, VA", latitude: 37.5407, longitude: -77.436 },
];

/** Case-insensitive name filter, capped. Empty query → no filter (caller shows
 * a default slice). */
export function searchPlaces(query: string, limit = 20): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...PLACES].slice(0, limit);
  return PLACES.filter((p) => p.label.toLowerCase().includes(q)).slice(0, limit);
}

export interface RadiusOption {
  label: string;
  meters: number;
}

export const RADII: readonly RadiusOption[] = [
  { label: "3 mi", meters: 4828 },
  { label: "5 mi", meters: 8047 },
  { label: "9 mi", meters: 14484 },
  { label: "15 mi", meters: 24140 },
];

/** ~9 mi — the operator's default home-base reach. */
export const DEFAULT_RADIUS_M = 14484;
