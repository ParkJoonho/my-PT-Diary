export function generateRoutePoints(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number },
  numberOfSegments: number,
) {
  return Array.from({ length: numberOfSegments + 1 }, (_, index) => {
    const fraction = index / numberOfSegments;

    return {
      latitude: start.latitude + (end.latitude - start.latitude) * fraction,
      longitude: start.longitude + (end.longitude - start.longitude) * fraction,
    };
  });
}
