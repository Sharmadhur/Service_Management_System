const Worker = require('../models/Worker');

// Haversine distance in km between two lat/lng points
function distanceKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => v === null || v === undefined)) return Infinity;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the best available worker for a service request.
 * Matching order: skill match -> approved & available -> not already rejected -> nearest by location/city.
 * @param {Object} request - ServiceRequest document (category, location, rejectedWorkers)
 * @returns {Worker|null}
 */
async function findBestWorker(request) {
  const candidates = await Worker.find({
    skills: { $in: [request.category] },
    availability: 'available',
    verified: 'approved',
    _id: { $nin: request.rejectedWorkers || [] },
  }).populate('userId', 'name email phone isBlocked');

  const eligible = candidates.filter((w) => w.userId && !w.userId.isBlocked);
  if (eligible.length === 0) return null;

  // Prefer same city, then nearest by coordinates, then highest rating
  const reqLat = request.location?.lat;
  const reqLng = request.location?.lng;
  const reqCity = (request.location?.city || '').toLowerCase();

  eligible.sort((a, b) => {
    const aCity = (a.location?.city || '').toLowerCase();
    const bCity = (b.location?.city || '').toLowerCase();
    const aCityMatch = aCity && aCity === reqCity ? 0 : 1;
    const bCityMatch = bCity && bCity === reqCity ? 0 : 1;
    if (aCityMatch !== bCityMatch) return aCityMatch - bCityMatch;

    const distA = distanceKm(reqLat, reqLng, a.location?.lat, a.location?.lng);
    const distB = distanceKm(reqLat, reqLng, b.location?.lat, b.location?.lng);
    if (distA !== distB) return distA - distB;

    return (b.rating || 0) - (a.rating || 0);
  });

  return eligible[0];
}

module.exports = { findBestWorker, distanceKm };
