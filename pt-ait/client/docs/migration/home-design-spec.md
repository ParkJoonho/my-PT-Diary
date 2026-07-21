# PT Diary 메인 화면 디자인 스펙

> Replit 구현 기준 문서. 메인 컬러 `#FF6A33`.

---

## 1. 기본 화면 기준

- 기준 너비: `375px`
- 전체 배경색: `#F4F5F7`
- 기본 폰트: `Pretendard`
- 전체 화면: 세로 스크롤
- 하단 탭바: 화면 하단 fixed

---

## 2. 컬러 토큰

```css
:root {
  --color-primary: #FF6A33;
  --color-primary-light: #FFF0EA;

  --color-bg: #F4F5F7;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F0F2F5;
  --color-line: #E8E8E8;

  --color-text-primary: #00192B;
  --color-text-secondary: #6B7280;
  --color-text-tertiary: #8E8E8E;
  --color-icon-muted: #B8C1CC;
}
```

---

## 3. 폰트 규칙

HTML `<head>`에 아래 CDN을 추가하세요.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
```

```css
body {
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

| 용도 | 크기 / 굵기 |
|------|------------|
| 화면 타이틀, 섹션 타이틀 | `17px / 600` |
| 카테고리 탭, segmented control | `15px / 600` |
| 루틴 아이템 텍스트 | `15px / 500` |
| 기능 카드 타이틀 | `16px / 600` |
| 설명문, 요일 텍스트 | `13px / 400` |
| 하단 탭바 텍스트 | `11px / 500` |
| 배지 텍스트 | `10px / 600` |

---

## 4. 레이아웃 구조

```
[PT Diary 헤더]
[주간 트래커 카드]
[루틴 선택 카드]
[야외운동 카드]
[운동배우기 카드]
[하단 탭바]
```

### 공통 여백
- 화면 좌우 여백: `16px`
- 카드 간 세로 간격: `10px`
- 카드 내부 padding: `16px`
- 카드 radius: `14px`
- 카드 배경: `#FFFFFF`
- 본문 하단 padding: `80px` (탭바에 가려지지 않도록)

---

## 5. PT Diary 헤더

- 높이: `48px`
- 배경: `#FFFFFF`
- 좌우 padding: `16px`

| 위치 | 요소 |
|------|------|
| 좌측 | 뒤로가기 chevron (`24px`, `#00192B`) + 앱 아이콘 + `PT Diary` |
| 우측 | 더보기(`···`) 아이콘 + 닫기(`✕`) 아이콘 |

- 앱 아이콘: `16px × 16px`, 원형, 배경 `#FF6A33`, 내부 흰색 심볼
- `PT Diary` 텍스트: `17px / 600 / #00192B`
- 더보기·닫기 아이콘: `24px / #6B7280`

---

## 6. 주간 트래커 카드

- padding: `16px 16px 10px`

### 타이틀 영역
- `주간 트래커`: `17px / 600 / #00192B`
- 우측에 pill 배지: 텍스트 `2일 연속`, `10px / 600 / #FF6A33`, 배경 `#FFF0EA`, radius `999px`, padding `4px 8px`
- 타이틀-배지 간격: `8px`

### 주간 원형 트래커
- 타이틀 아래 간격: `16px`
- 7개 요일 균등 분배 (월·화·수·목·금·토·일)
- 원 크기: `24px × 24px`
- 완료: 배경 `#FF6A33`, 내부 흰색 체크 아이콘
- 미완료: 배경 `#EEF0F3`
- 원-요일 텍스트 간격: `8px`
- 요일 텍스트: `13px / 400 / #8E8E8E`
- **월·화 완료, 수~일 미완료**

---

## 7. 루틴 선택 카드

### 섹션 타이틀
- `루틴 선택`: `17px / 600 / #00192B`
- 타이틀 아래 간격: `16px`

### 카테고리 탭
- 탭 목록: `AI추천` / `헬스장` / `크로스핏` / `홈트`
- 탭 높이: `32px`, 탭 간 간격: `24px`
- 활성(`AI추천`): `15px / 600 / #00192B` + 하단 `2px solid #FF6A33` indicator
- 비활성: `15px / 600 / #6B7280`

### AI 추천 설명문
- 탭 아래 간격: `14px`
- 좌측 원형 아이콘: `14px × 14px`, 배경 `#FF6A33`, 내부 흰색 sparkle 아이콘
- 설명 텍스트: `AI가 체형과 자세를 분석해 만든 루틴이에요. 약한 부위를 강화하고 척추·무릎 정렬을 잡아줘요.`
  - `13px / 400 / #8E8E8E`, line-height `20px`

### 헬스장 / 홈트 Segmented Control
- 설명문 아래 간격: `20px`
- 높이: `38px`, 배경 `#F0F2F5`, radius `8px`, 내부 padding `3px`
- 활성(`헬스장`): 배경 `#FFFFFF`, radius `7px`, `15px / 600 / #00192B`, shadow 또는 border `1px solid #E8E8E8`
- 비활성(`홈트`): 배경 transparent, `15px / 600 / #6B7280`

### 루틴 아코디언 리스트
- segmented control 아래 간격: `16px`
- 아이템 간격: `10px`
- 아이템 높이: `56px`, 배경 `#F0F2F5`, radius `8px`, 좌우 padding `16px`
- 좌측 아이콘: `22px × 22px` 원형, 배경 `#B8C1CC`, 내부 흰색 시계 아이콘
- 텍스트: `1시간 루틴` / `1시간 30분 루틴` / `2시간 루틴`, `15px / 500 / #00192B`
- 우측 chevron: `16px / #B8C1CC`

---

## 8. 하단 기능 카드

- 높이: `72px`, 가로 정렬: `아이콘 + 텍스트 묶음 + 우측 chevron`

### 야외운동
- 아이콘: `34px × 34px` 원형, 배경 `#D7E9FF`, 내부 신발 아이콘 `#246BEB`
- 타이틀: `야외운동` — `16px / 600 / #00192B`
- 설명: `러닝·등산 코스 추천` — `13px / 400 / #8E8E8E`
- 우측 chevron: `#B8C1CC`

### 운동배우기
- 아이콘: `34px × 34px` 원형, 배경 `#E5E9EF`, 내부 영상 아이콘 `#6B7280`
- 타이틀: `운동배우기` — `16px / 600 / #00192B`
- 설명: `부위별·기구별 운동 학습` — `13px / 400 / #8E8E8E`
- 우측 chevron: `#B8C1CC`

---

## 9. 하단 탭바

- fixed, 높이: `62px` + safe area
- 배경: `#FFFFFF`, 상단 border: `1px solid #E8E8E8`
- 탭 5개 균등 분배

| 탭 | 아이콘 | 활성 여부 |
|----|--------|----------|
| 홈 | house | ✅ 활성 |
| 기록 | calendar | ❌ (red dot 표시) |
| PT | dumbbell | ❌ |
| AI | sparkle | ❌ |
| 내 정보 | person | ❌ |

- 활성 아이콘·텍스트: `#00192B`
- 비활성 아이콘: `#B8C1CC`, 텍스트: `#8E8E8E`
- 기록 탭 red dot: 아이콘 우측 상단, `5px × 5px / #FF4D4F`
