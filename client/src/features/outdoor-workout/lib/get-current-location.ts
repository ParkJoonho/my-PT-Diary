import {
  Accuracy,
  getCurrentLocation as getAppsInTossCurrentLocation,
} from '@apps-in-toss/framework';
import type { OutdoorWorkoutLocation } from '../types/outdoor-workout';

const DEFAULT_FALLBACK_LOCATION: OutdoorWorkoutLocation = {
  accuracy: 10,
  isFallback: true,
  latitude: 37.5665,
  longitude: 126.978,
};

export async function getCurrentLocation(): Promise<OutdoorWorkoutLocation> {
  try {
    let permission = await getAppsInTossCurrentLocation.getPermission();

    if (permission !== 'allowed') {
      permission = await getAppsInTossCurrentLocation.openPermissionDialog();
    }

    if (permission !== 'allowed') {
      return DEFAULT_FALLBACK_LOCATION;
    }

    const result = await getAppsInTossCurrentLocation({
      accuracy: Accuracy.High,
    });

    return {
      accuracy: result.coords.accuracy,
      isFallback: false,
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    };
  } catch {
    return DEFAULT_FALLBACK_LOCATION;
  }
}

export function getLocationDisplayName(location: OutdoorWorkoutLocation) {
  // 실제 좌표의 주소를 얻지 못하면 원본의 역지오코딩 실패 fallback인 '내 위치'를 사용해요.
  return location.isFallback ? '서초동' : '내 위치';
}
