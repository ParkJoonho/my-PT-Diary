export function calculateDistanceKilometers(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
) {
  const earthRadiusKilometers = 6371;
  const deltaLatitudeRadians =
    ((end.latitude - start.latitude) * Math.PI) / 180;
  const deltaLongitudeRadians =
    ((end.longitude - start.longitude) * Math.PI) / 180;
  const startLatitudeRadians = (start.latitude * Math.PI) / 180;
  const endLatitudeRadians = (end.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(deltaLatitudeRadians / 2) *
      Math.sin(deltaLatitudeRadians / 2) +
    Math.cos(startLatitudeRadians) *
      Math.cos(endLatitudeRadians) *
      Math.sin(deltaLongitudeRadians / 2) *
      Math.sin(deltaLongitudeRadians / 2);
  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return earthRadiusKilometers * angularDistance;
}
