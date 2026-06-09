/**
 * Check if a user's location is within an allowed area
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} centerLat - Allowed zone center latitude
 * @param {number} centerLon - Allowed zone center longitude
 * @param {number} radiusKm - Allowed radius in kilometers
 * @returns {boolean}
 */
export function isInAllowedArea(userLat: number, userLon: number, centerLat = 40.125934, centerLon = 67.826732, radiusKm = 10): boolean {
  const R = 6371;
  const dLat = (centerLat - userLat) * Math.PI / 180;
  const dLon = (centerLon - userLon) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(userLat * Math.PI / 180) *
    Math.cos(centerLat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return distanceKm <= radiusKm;
}