import type { OutdoorWorkoutLocation } from '../types/outdoor-workout';

type BrowserGeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

type BrowserGeolocation = {
  getCurrentPosition: (
    success: (position: BrowserGeolocationPosition) => void,
    error?: (error: unknown) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
    },
  ) => void;
};

const DEFAULT_FALLBACK_LOCATION: OutdoorWorkoutLocation = {
  isFallback: true,
  latitude: 37.5665,
  longitude: 126.978,
};

export async function getCurrentLocation(): Promise<OutdoorWorkoutLocation> {
  const browserNavigator = navigator as Navigator & {
    geolocation?: BrowserGeolocation;
  };

  if (
    typeof navigator === 'undefined' ||
    !browserNavigator.geolocation ||
    typeof browserNavigator.geolocation.getCurrentPosition !== 'function'
  ) {
    return DEFAULT_FALLBACK_LOCATION;
  }

  try {
    const position = await new Promise<BrowserGeolocationPosition>(
      (resolve, reject) => {
        browserNavigator.geolocation?.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      },
    );

    return {
      isFallback: false,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  } catch {
    return DEFAULT_FALLBACK_LOCATION;
  }
}

export function getLocationDisplayName(location: OutdoorWorkoutLocation) {
  return location.isFallback ? '서초동' : '내 위치';
}

// TODO(outdoor-workout-migration): 원본 앱은 네이티브에서 위치 권한 요청과 역지오코딩까지 붙어 있었지만,
// 현재 Granite 클라이언트에는 해당 브리지/패키지가 아직 마이그레이션되지 않았어요.
// 그래서 당장은 geolocation API가 있는 환경에서는 현재 위치를 쓰고, 그 외에는 원본 웹과 같은
// 고정 좌표 fallback을 사용해요. 추후 네이티브 위치 권한과 역지오코딩을 붙이면 플랫폼별 동작을 분리해야 해요.
