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

function workerIsEligible(worker, category, rejectedWorkers = []) {
  if (!worker || !worker.userId) return false;
  if (worker.verified !== 'approved') return false;
  if (worker.availability !== 'available') return false;
  if (!worker.skills || !worker.skills.includes(category)) return false;
  if (rejectedWorkers.some((id) => id.toString() === worker._id.toString())) return false;
  if (worker.userId.isBlocked) return false;
  return true;
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

  const eligible = candidates.filter((w) => workerIsEligible(w, request.category, request.rejectedWorkers || []));
  if (eligible.length === 0) return null;

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

async function findNearbyWorkers({ category, city, lat, lng, radiusKm = 20, limit = 20 }) {
  const query = {
    skills: { $in: [category] },
    verified: 'approved',
    availability: 'available',
  };

  const workers = await Worker.find(query)
    .populate('userId', 'name email phone isBlocked');

  const normalizedCity = (city || '').trim().toLowerCase();
  const result = workers
    .filter((worker) => worker.userId && !worker.userId.isBlocked)
    .map((worker) => {
      const workerCity = (worker.location?.city || '').trim().toLowerCase();
      const hasCoordinates = Number.isFinite(worker.location?.lat) && Number.isFinite(worker.location?.lng);
      const hasCustomerCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
      const distance = hasCustomerCoordinates && hasCoordinates
        ? distanceKm(lat, lng, worker.location.lat, worker.location.lng)
        : Infinity;

      const cityMatch = normalizedCity && workerCity && workerCity === normalizedCity;
      const withinRadius = hasCustomerCoordinates && hasCoordinates ? distance <= radiusKm : false;

      return { worker, cityMatch, distance, withinRadius };
    })
    .filter(({ worker, cityMatch, withinRadius }) => {
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return (worker.location?.lat !== null && worker.location?.lng !== null) ? withinRadius : cityMatch;
      }
      return cityMatch || (worker.location?.city || '').trim().length > 0;
    })
    .sort((a, b) => {
      if (a.withinRadius !== b.withinRadius) return Number(b.withinRadius) - Number(a.withinRadius);
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.cityMatch !== b.cityMatch) return Number(b.cityMatch) - Number(a.cityMatch);
      return (b.worker.rating || 0) - (a.worker.rating || 0);
    })
    .slice(0, Number(limit) || 20)
    .map(({ worker, distance, cityMatch, withinRadius }) => ({
      ...worker.toObject(),
      distanceKm: Number.isFinite(distance) ? Number(distance.toFixed(1)) : null,
      cityMatch,
      withinRadius,
    }));

  return result;
}

module.exports = { findBestWorker, findNearbyWorkers, distanceKm, workerIsEligible };
