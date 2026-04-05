export const cityCoordinates = {
  "New Delhi": [28.6139, 77.2090],
  "Delhi": [28.6139, 77.2090],
  "Mumbai": [19.0760, 72.8777],
  "Chennai": [13.0827, 80.2707],
  "Bengaluru": [12.9716, 77.5946],
  "Varanasi": [25.3176, 82.9739],
  "Kolkata": [22.5726, 88.3639],
  "Howrah": [22.5726, 88.3639],
  "Lucknow": [26.8467, 80.9462]
};

export function getCoordinates(cityName) {
  return cityCoordinates[cityName] || [20.5937, 78.9629];
}
