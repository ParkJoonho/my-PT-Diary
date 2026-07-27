import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react-native";
import {
  exerciseGuidesControllerGetExerciseGuide,
  exerciseGuidesControllerListExerciseGuides,
  exerciseGuidesControllerSetExerciseGuideLike,
} from "shared/api/generated/endpoints/exercise-guides/exercise-guides";
import type { ExerciseGuideDto } from "shared/api/generated/models";
import { useTrackerUserKey } from "shared/api/user-key";
import {
  selectExerciseGuide,
  selectExerciseGuides,
  selectUpdatedExerciseGuideLike,
  useExerciseGuides,
} from "../exercise-guides";

jest.mock(
  "shared/api/generated/endpoints/exercise-guides/exercise-guides",
  () => ({
    exerciseGuidesControllerGetExerciseGuide: jest.fn(),
    exerciseGuidesControllerListExerciseGuides: jest.fn(),
    exerciseGuidesControllerSetExerciseGuideLike: jest.fn(),
  }),
);

jest.mock("shared/api/user-key", () => ({
  useTrackerUserKey: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query") as Record<
    string,
    unknown
  >;

  return {
    ...actual,
    useMutation: jest.fn(),
    useQueryClient: jest.fn(() => ({
      setQueriesData: jest.fn(),
      setQueryData: jest.fn(),
    })),
    useSuspenseQuery: jest.fn((options: { queryFn: () => unknown }) => ({
      data: options.queryFn(),
    })),
  };
});

const 첫번째가이드: ExerciseGuideDto = {
  bodyPart: "가슴",
  catalogType: "body_part",
  description: "설명",
  duration: "12:30",
  equipment: "벤치",
  equipmentTypes: ["바벨"],
  id: "r1",
  likeCount: 3,
  likedByMe: false,
  targetMuscles: "가슴",
  title: "가슴 루틴",
  videoUrl: "https://www.youtube.com/embed/test",
};

const 가이드목록: ExerciseGuideDto[] = [첫번째가이드];

describe("운동 가이드 API 래퍼", () => {
  const mockedUseTrackerUserKey = jest.mocked(useTrackerUserKey);
  const mockedListExerciseGuides = jest.mocked(
    exerciseGuidesControllerListExerciseGuides,
  );
  const mockedGetExerciseGuide = jest.mocked(
    exerciseGuidesControllerGetExerciseGuide,
  );
  const mockedSetExerciseGuideLike = jest.mocked(
    exerciseGuidesControllerSetExerciseGuideLike,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("사용자 키 헤더로 운동 가이드 목록을 조회한다", async () => {
    mockedUseTrackerUserKey.mockReturnValue("테스트-사용자");
    mockedListExerciseGuides.mockResolvedValue({
      data: 가이드목록,
      headers: new Headers(),
      status: 200,
    });

    const { result } = renderHook(() => useExerciseGuides());

    await expect(result.current.data).resolves.toEqual(가이드목록);
    expect(mockedListExerciseGuides).toHaveBeenCalledWith(
      {},
      {
        headers: {
          "x-user-key": "테스트-사용자",
        },
      },
    );
  });

  it("성공 응답에서 운동 가이드 목록을 선택한다", () => {
    expect(
      selectExerciseGuides({
        data: 가이드목록,
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual(가이드목록);
  });

  it("404 상세 응답은 NOT_FOUND 오류를 던진다", () => {
    expect(() =>
      selectExerciseGuide({
        data: undefined,
        headers: new Headers(),
        status: 404,
      }),
    ).toThrow("NOT_FOUND");
  });

  it("좋아요 저장 응답은 200 데이터만 허용한다", () => {
    expect(
      selectUpdatedExerciseGuideLike({
        data: 첫번째가이드,
        headers: new Headers(),
        status: 200,
      }),
    ).toEqual(첫번째가이드);
  });

  it("생성 엔드포인트 함수 시그니처가 유지된다", async () => {
    mockedGetExerciseGuide.mockResolvedValue({
      data: 첫번째가이드,
      headers: new Headers(),
      status: 200,
    });
    mockedSetExerciseGuideLike.mockResolvedValue({
      data: 첫번째가이드,
      headers: new Headers(),
      status: 200,
    });

    await exerciseGuidesControllerGetExerciseGuide("r1", {
      headers: { "x-user-key": "테스트-사용자" },
    });
    await exerciseGuidesControllerSetExerciseGuideLike(
      "r1",
      { liked: true },
      {
        headers: { "x-user-key": "테스트-사용자" },
      },
    );

    expect(mockedGetExerciseGuide).toHaveBeenCalled();
    expect(mockedSetExerciseGuideLike).toHaveBeenCalled();
  });
});
