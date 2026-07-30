import { fetchAlbumPhotos, openCamera } from '@apps-in-toss/native-modules';
import { Platform } from 'react-native';

export type PickedImage = {
  base64: string;
  capturedAt?: string;
  uri: string;
};

function toDataUri(base64: string) {
  return `data:image/jpeg;base64,${base64}`;
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
          capturedAt: useCamera ? new Date().toISOString() : undefined,
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
    const image = await openCamera({
      base64: true,
      maxWidth: 1280,
    });

    return {
      base64: image.dataUri,
      capturedAt: new Date().toISOString(),
      uri: toDataUri(image.dataUri),
    };
  }

  const images = await fetchAlbumPhotos({
    base64: true,
    maxCount: 1,
    maxWidth: 1280,
  });
  const image = images[0];

  if (!image) {
    return null;
  }

  return {
    base64: image.dataUri,
    uri: toDataUri(image.dataUri),
  };
}
