import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { pickSingleImage } from '../pick-image';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@apps-in-toss/framework', () => ({
  fetchAlbumPhotos: Object.assign(jest.fn(), {
    getPermission: jest.fn(),
    openPermissionDialog: jest.fn(),
  }),
  openCamera: Object.assign(jest.fn(), {
    getPermission: jest.fn(),
    openPermissionDialog: jest.fn(),
  }),
}));

const appsInTossFramework = jest.requireMock('@apps-in-toss/framework') as {
  fetchAlbumPhotos: ReturnType<typeof jest.fn> & {
    getPermission: ReturnType<typeof jest.fn>;
    openPermissionDialog: ReturnType<typeof jest.fn>;
  };
  openCamera: ReturnType<typeof jest.fn> & {
    getPermission: ReturnType<typeof jest.fn>;
    openPermissionDialog: ReturnType<typeof jest.fn>;
  };
};

describe('Apps in Toss 이미지 선택', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appsInTossFramework.fetchAlbumPhotos.getPermission.mockResolvedValue(
      'allowed',
    );
    appsInTossFramework.openCamera.getPermission.mockResolvedValue('allowed');
  });

  it('카메라 권한을 확인하고 촬영 이미지를 base64와 미리보기 URI로 반환한다', async () => {
    appsInTossFramework.openCamera.mockResolvedValue({
      dataUri: 'camera-base64',
      id: 'camera-image',
    });

    const result = await pickSingleImage({ useCamera: true });

    expect(appsInTossFramework.openCamera.getPermission).toHaveBeenCalledTimes(
      1,
    );
    expect(
      appsInTossFramework.openCamera.openPermissionDialog,
    ).not.toHaveBeenCalled();
    expect(appsInTossFramework.openCamera).toHaveBeenCalledWith({
      base64: true,
      maxWidth: 1280,
    });
    expect(result).toMatchObject({
      base64: 'camera-base64',
      uri: 'data:image/jpeg;base64,camera-base64',
    });
    expect(result).not.toHaveProperty('capturedAt');
  });

  it('카메라 권한이 정해지지 않았으면 권한 다이얼로그를 연다', async () => {
    appsInTossFramework.openCamera.getPermission.mockResolvedValue(
      'notDetermined',
    );
    appsInTossFramework.openCamera.openPermissionDialog.mockResolvedValue(
      'allowed',
    );
    appsInTossFramework.openCamera.mockResolvedValue({
      dataUri: 'camera-base64',
      id: 'camera-image',
    });

    await expect(pickSingleImage({ useCamera: true })).resolves.toMatchObject({
      base64: 'camera-base64',
    });

    expect(
      appsInTossFramework.openCamera.openPermissionDialog,
    ).toHaveBeenCalledTimes(1);
  });

  it('카메라 권한을 허용하지 않으면 촬영 브리지를 호출하지 않는다', async () => {
    appsInTossFramework.openCamera.getPermission.mockResolvedValue('denied');
    appsInTossFramework.openCamera.openPermissionDialog.mockResolvedValue(
      'denied',
    );

    await expect(pickSingleImage({ useCamera: true })).rejects.toThrow(
      '카메라 접근 권한이 필요합니다.',
    );
    expect(appsInTossFramework.openCamera).not.toHaveBeenCalled();
  });

  it('앨범 권한을 확인하고 첫 번째 이미지를 반환한다', async () => {
    appsInTossFramework.fetchAlbumPhotos.mockResolvedValue([
      {
        dataUri: 'album-base64',
        id: 'album-image',
      },
    ]);

    await expect(pickSingleImage({ useCamera: false })).resolves.toEqual({
      base64: 'album-base64',
      uri: 'data:image/jpeg;base64,album-base64',
    });

    expect(
      appsInTossFramework.fetchAlbumPhotos.getPermission,
    ).toHaveBeenCalledTimes(1);
    expect(appsInTossFramework.fetchAlbumPhotos).toHaveBeenCalledWith({
      base64: true,
      maxCount: 1,
      maxWidth: 1280,
    });
  });

  it('앨범 선택을 취소하면 null을 반환한다', async () => {
    appsInTossFramework.fetchAlbumPhotos.mockResolvedValue([]);

    await expect(pickSingleImage({ useCamera: false })).resolves.toBeNull();
  });

  it('앨범 권한을 허용하지 않으면 앨범 브리지를 호출하지 않는다', async () => {
    appsInTossFramework.fetchAlbumPhotos.getPermission.mockResolvedValue(
      'denied',
    );
    appsInTossFramework.fetchAlbumPhotos.openPermissionDialog.mockResolvedValue(
      'denied',
    );

    await expect(pickSingleImage({ useCamera: false })).rejects.toThrow(
      '사진 접근 권한이 필요합니다.',
    );
    expect(appsInTossFramework.fetchAlbumPhotos).not.toHaveBeenCalled();
  });

  it('SDK가 빈 이미지 데이터를 반환하면 분석에 전달하지 않는다', async () => {
    appsInTossFramework.openCamera.mockResolvedValue({
      dataUri: '',
      id: 'empty-image',
    });

    await expect(pickSingleImage({ useCamera: true })).rejects.toThrow(
      '이미지 데이터를 읽지 못했어요.',
    );
  });
});
