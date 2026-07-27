import type { OutdoorWorkoutElevationPointDto } from 'shared/api/generated/models';

export async function fetchElevationData(
  points: Array<{ latitude: number; longitude: number }>,
): Promise<OutdoorWorkoutElevationPointDto[]> {
  try {
    const latitudes = points.map((point) => point.latitude).join(',');
    const longitudes = points.map((point) => point.longitude).join(',');
    const response = await fetch(
      `https://api.open-meteo.com/v1/elevation?latitude=${latitudes}&longitude=${longitudes}`,
    );
    const data = (await response.json()) as {
      elevation?: number[];
    };

    if (Array.isArray(data.elevation)) {
      return points.map((point, index) => ({
        elevation: data.elevation?.[index] ?? 0,
        lat: point.latitude,
        lng: point.longitude,
        point: index,
      }));
    }
  } catch {
    // Fall back below to stay source-faithful.
  }

  return points.map((point, index) => ({
    elevation: 0,
    lat: point.latitude,
    lng: point.longitude,
    point: index,
  }));
}
