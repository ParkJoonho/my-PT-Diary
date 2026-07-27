function resolveVideoId(url: string) {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  const embedMatch = url.match(/\/embed\/([^?&]+)/);

  if (watchMatch?.[1]) {
    return watchMatch[1];
  }

  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  if (embedMatch?.[1]) {
    return embedMatch[1];
  }

  return "";
}

export function getYoutubeEmbedUrl(url: string) {
  const videoId = resolveVideoId(url);

  if (!videoId) {
    return url;
  }

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}
