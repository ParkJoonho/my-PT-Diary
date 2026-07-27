import { describe, expect, it } from "@jest/globals";
import { getYoutubeEmbedUrl } from "../get-youtube-embed-url";

describe("유튜브 embed URL 변환", () => {
  it("watch URL을 autoplay embed URL로 변환한다", () => {
    expect(
      getYoutubeEmbedUrl("https://www.youtube.com/watch?v=rT7DgCr-3pg"),
    ).toBe("https://www.youtube.com/embed/rT7DgCr-3pg?autoplay=1&rel=0");
  });

  it("short URL을 autoplay embed URL로 변환한다", () => {
    expect(getYoutubeEmbedUrl("https://youtu.be/CAwf7n6Luuc")).toBe(
      "https://www.youtube.com/embed/CAwf7n6Luuc?autoplay=1&rel=0",
    );
  });

  it("변환할 수 없는 URL은 그대로 반환한다", () => {
    expect(getYoutubeEmbedUrl("https://example.com/video")).toBe(
      "https://example.com/video",
    );
  });
});
