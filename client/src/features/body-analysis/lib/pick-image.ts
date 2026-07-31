import { fetchAlbumPhotos, openCamera } from '@apps-in-toss/framework';
import { Platform } from 'react-native';

export type PickedImage = {
  base64: string;
  uri: string;
};

function toDataUri(base64: string) {
  return `data:image/jpeg;base64,${base64}`;
}

async function requestCameraPermission() {
  let permission = await openCamera.getPermission();

  if (permission !== 'allowed') {
    permission = await openCamera.openPermissionDialog();
  }

  if (permission !== 'allowed') {
    throw new Error(
      '카메라 접근 권한이 필요합니다.\n설정에서 카메라 권한을 허용해 주세요.',
    );
  }
}

async function requestAlbumPermission() {
  let permission = await fetchAlbumPhotos.getPermission();

  if (permission !== 'allowed') {
    permission = await fetchAlbumPhotos.openPermissionDialog();
  }

  if (permission !== 'allowed') {
    throw new Error(
      '사진 접근 권한이 필요합니다.\n설정에서 사진 접근을 허용해 주세요.',
    );
  }
}

async function pickWebImage({
  useCamera,
}: {
  useCamera: boolean;
}): Promise<PickedImage | null> {
  const webDocument = (
    globalThis as unknown as {
      document?: {
        createElement: (tagName: string) => {
          accept: string;
          click: () => void;
          files?: ArrayLike<Blob>;
          onchange: null | (() => void);
          setAttribute: (name: string, value: string) => void;
          type: string;
        };
      };
    }
  ).document;

  if (!webDocument) {
    return null;
  }

  return new Promise<PickedImage | null>((resolve, reject) => {
    const input = webDocument.createElement('input');
    input.accept = 'image/*';
    input.type = 'file';

    if (useCamera) {
      input.setAttribute('capture', 'environment');
    }

    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) {
        resolve(null);
        return;
      }

      const reader = new (
        globalThis as unknown as { FileReader: typeof FileReader }
      ).FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const base64 = result.split(',')[1];

        if (!base64) {
          reject(new Error('이미지 데이터를 읽지 못했어요.'));
          return;
        }

        resolve({
          base64,
          uri: result,
        });
      };
      reader.onerror = () =>
        reject(new Error('이미지 데이터를 읽지 못했어요.'));
      reader.readAsDataURL(file);
    };

    input.click();
  });
}

export async function pickSingleImage({
  useCamera,
}: {
  useCamera: boolean;
}): Promise<PickedImage | null> {
  if (Platform.OS === 'web') {
    return pickWebImage({ useCamera });
  }

  if (useCamera) {
    await requestCameraPermission();

    const image = await openCamera({
      base64: true,
      maxWidth: 1280,
    });

    if (!image.dataUri) {
      throw new Error('이미지 데이터를 읽지 못했어요.');
    }

    return {
      base64: image.dataUri,
      uri: toDataUri(image.dataUri),
    };
  }

  await requestAlbumPermission();

  const images = await fetchAlbumPhotos({
    base64: true,
    maxCount: 1,
    maxWidth: 1280,
  });
  const image = images[0];

  if (!image) {
    return null;
  }

  if (!image.dataUri) {
    throw new Error('이미지 데이터를 읽지 못했어요.');
  }

  return {
    base64: image.dataUri,
    uri: toDataUri(image.dataUri),
  };
}
