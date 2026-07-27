import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import Colors from 'shared/constants/colors';

// YouTube 오류 153을 방지하기 위해 앱을 식별할 수 있는 HTTP Referer를 전달한다.
const YOUTUBE_REFERRER = 'https://pt-diary.replit.app';

export function YoutubeVideoPlayer({ embedUrl }: { embedUrl: string }) {
  if (!embedUrl) {
    return (
      <View style={[styles.container, styles.errorState]}>
        <Text style={styles.errorText}>영상을 불러올 수 없어요.</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {React.createElement('iframe', {
          allow: 'autoplay; encrypted-media',
          allowFullScreen: true,
          src: embedUrl,
          style: { border: 'none', height: '100%', width: '100%' },
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        allowsInlineMediaPlayback
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        source={{
          uri: embedUrl,
          headers: {
            Referer: YOUTUBE_REFERRER,
          },
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    width: '100%',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.white,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
});
