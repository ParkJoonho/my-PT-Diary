import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  getCurrentLocation,
  getLocationDisplayName,
} from '../get-current-location';

jest.mock('@apps-in-toss/framework', () => {
  class MockGetCurrentLocationPermissionError extends Error {}

  return {
    Accuracy: {
      High: 4,
    },
    getCurrentLocation: Object.assign(jest.fn(), {
      getPermission: jest.fn(),
      openPermissionDialog: jest.fn(),
    }),
    GetCurrentLocationPermissionError: MockGetCurrentLocationPermissionError,
  };
});

const appsInTossFramework = jest.requireMock('@apps-in-toss/framework') as {
  getCurrentLocation: ReturnType<typeof jest.fn> & {
    getPermission: ReturnType<typeof jest.fn>;
    openPermissionDialog: ReturnType<typeof jest.fn>;
  };
  GetCurrentLocationPermissionError: new () => Error;
};

describe('야외운동 현재 위치', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appsInTossFramework.getCurrentLocation.getPermission.mockResolvedValue(
      'allowed',
    );
    appsInTossFramework.getCurrentLocation.mockResolvedValue({
      coords: {
        accuracy: 8,
        latitude: 37.4979,
        longitude: 127.0276,
      },
    });
  });

  it('허용된 위치 권한으로 앱인토스 SDK의 고정밀 현재 좌표를 가져온다', async () => {
    await expect(getCurrentLocation()).resolves.toEqual({
      accuracy: 8,
      isFallback: false,
      latitude: 37.4979,
      longitude: 127.0276,
    });

    expect(
      appsInTossFramework.getCurrentLocation.openPermissionDialog,
    ).not.toHaveBeenCalled();
    expect(appsInTossFramework.getCurrentLocation).toHaveBeenCalledWith({
      accuracy: 4,
    });
  });

  it('위치 권한이 결정되지 않았으면 권한 다이얼로그를 연다', async () => {
    appsInTossFramework.getCurrentLocation.getPermission.mockResolvedValue(
      'notDetermined',
    );
    appsInTossFramework.getCurrentLocation.openPermissionDialog.mockResolvedValue(
      'allowed',
    );

    await expect(getCurrentLocation()).resolves.toMatchObject({
      latitude: 37.4979,
      longitude: 127.0276,
    });

    expect(
      appsInTossFramework.getCurrentLocation.openPermissionDialog,
    ).toHaveBeenCalledTimes(1);
  });

  it('위치 권한이 허용되지 않으면 고정 좌표 fallback을 사용한다', async () => {
    appsInTossFramework.getCurrentLocation.getPermission.mockResolvedValue(
      'denied',
    );
    appsInTossFramework.getCurrentLocation.openPermissionDialog.mockResolvedValue(
      'denied',
    );

    await expect(getCurrentLocation()).resolves.toEqual({
      accuracy: 10,
      isFallback: true,
      latitude: 37.5665,
      longitude: 126.978,
    });
    expect(appsInTossFramework.getCurrentLocation).not.toHaveBeenCalled();
  });

  it('SDK 위치 획득에 실패하면 고정 좌표 fallback을 사용한다', async () => {
    appsInTossFramework.getCurrentLocation.mockRejectedValue(
      new Error('SDK 오류'),
    );

    await expect(getCurrentLocation()).resolves.toEqual({
      accuracy: 10,
      isFallback: true,
      latitude: 37.5665,
      longitude: 126.978,
    });
  });

  it('실제 좌표의 역지오코딩을 사용할 수 없으면 내 위치를 사용한다', () => {
    expect(
      getLocationDisplayName({
        accuracy: 8,
        isFallback: false,
        latitude: 37.4979,
        longitude: 127.0276,
      }),
    ).toBe('내 위치');
  });

  it('위치 획득 fallback 좌표에는 서초동을 사용한다', () => {
    expect(
      getLocationDisplayName({
        accuracy: 10,
        isFallback: true,
        latitude: 37.5665,
        longitude: 126.978,
      }),
    ).toBe('서초동');
  });
});
