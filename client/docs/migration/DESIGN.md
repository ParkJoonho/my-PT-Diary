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
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/npm/pretendard@latest/dist/web/static/pretendard.css" />
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

#### 접힌 상태 (collapsed)
- segmented control 아래 간격: `16px`
- 아이템 간격: `10px`
- 아이템 높이: `56px`, 배경 `#F0F2F5`, radius `8px`, 좌우 padding `16px`
- 좌측 TimeIcon: `22px × 22px` 원형, **접힌 상태 배경 `#B8C1CC`**, 내부 흰색 시계 아이콘
- 텍스트: `1시간 루틴` / `1시간 30분 루틴` / `2시간 루틴`, `15px / 500 / #00192B`
- 우측 chevron(▾): `20px / #B8C1CC`

#### 펼친 상태 (expanded)
- 아코디언 헤더 배경: 항상 `#F0F2F5` (열림·닫힘 무관하게 유지)
- TimeIcon: **펼친 상태 배경 `#FF6A33`** (주황색으로 전환), 내부 흰색 시계 아이콘
- 우측 chevron(▴): `20px / #B8C1CC` (접힌 상태와 동일한 색상)
- 내용 영역 배경: `rgba(240, 242, 245, 0.45)`
- 헤더·내용 사이 divider 없음

#### 펼친 상태 내부 레이아웃

**휴식 안내 행 (restNoteRow)**
- 좌측 ChatIcon (말풍선 아이콘) + `각 세트당 휴식 N초`
- 텍스트: `13px / 400 / #6B7280`
- restNoteRow 하단 여백(→ 첫 번째 운동 타이틀): `24px`

**운동 스텝 목록**
- 각 스텝: FireIcon(좌측) + 스텝 내용(우측)
- FireIcon: `24px × 24px` 원형, 배경 `#FF6A33`, 내부 흰색 불꽃 아이콘
- FireIcon 아래 커넥터 라인: 마지막 스텝 제외, `#E8EAF0`
- 스텝 내용 구조:
  ```
  [운동명 (좌)]     [세트·횟수 (우, #FF6A33)]
  [칩 태그]
  ```
- 운동명: `15px / 500 / #00192B`
- 세트·횟수: `14px / 600 / #FF6A33`
- 칩 태그: 배경 `#F2F2F7`, radius `999px`, padding `3px 8px`, `11px / 400 / #6B7280`

**스텝 내 여백**
| 구간 | 값 |
|------|----|
| 운동명·세트 행 → 칩 태그 | `marginTop: 10px` |
| 칩 태그 → 다음 스텝 타이틀 | `paddingBottom: 32px` |
| 마지막 스텝 칩 → 운동 시작 버튼 | `paddingBottom: 0` + `marginTop: 24px` (버튼 기준) |

**운동 시작 버튼**
- 전체 너비, 배경 `#FF6A33`, radius `14px`, `paddingVertical: 16px`
- 텍스트: `운동 시작`, `14px / 600 / #FFFFFF`
- 그림자 없음

#### 칩 태그 매핑 규칙 (`resolveStepTag`)
우선순위 순서대로 적용:
1. `step.tag` 값이 존재하고 12자 이하인 경우 → 그대로 사용
2. 운동명이 `EXERCISE_TAG_MAP`에 있는 경우 → 매핑된 태그 사용
3. `step.reason` 문장에서 키워드 추출 (코어, 하체, 상체, 가슴, 등, 어깨, 유산소, 전신 등)
4. 모두 해당 없으면 칩 미표시

주요 매핑 예시:
- 스쿼트·런지 계열 → `하체 근력 강화`
- 플랭크·크런치·자전거 크런치·바이시클 크런치 계열 → `코어 근력 강화`
- 벤치프레스·덤벨 플라이 계열 → `가슴 근력 강화`
- 랫풀다운·풀업 계열 → `등 근력 강화`
- 버피·쓰러스트 계열 → `전신 근력 강화`

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

> **통일 규칙**: 화면 내 모든 우측 chevron은 `#B8C1CC`로 통일 (아코디언 포함)

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

---

## 10. 운동배우기 상세 화면 (exercise-guide)

### 전체 구조
```
[헤더]
[타이틀 영역]
[세그먼트 탭: 부위별 / 기구별]
[필터 행 or 기구 찾기 버튼]
[루틴 리스트 카드]
```
- 전체 배경: `#F2F2F7`

---

### 헤더
- 배경: `#FFFFFF`, 하단 border: `hairline / #E5E5EA`
- 좌우 padding: `12px`, 상하 padding: `10px`

| 위치 | 요소 |
|------|------|
| 좌측 | `<` 뒤로가기 + 앱 아이콘(`28×28`, radius `8`, 배경 `#FF6B35`) + `PT Diary` |
| 우측 | ♡ 아이콘 + `···` 아이콘 + `|` 구분선 + `✕` 닫기 |

- `PT Diary` 텍스트: `16px / Inter_600SemiBold / Colors.text`
- 구분선: `1px × 18px / #E5E5EA`, `marginHorizontal: 4`

---

### 타이틀 영역
- `paddingHorizontal: 16`, `paddingTop: 12`, `paddingBottom: 4`
- 타이틀 텍스트: `18px / Inter_700Bold / Colors.text`, `marginBottom: 4`

---

### 세그먼트 탭 (부위별 / 기구별)
- 배경: `#EAEAEA`, `borderRadius: 12`, `padding: 4`
- `marginHorizontal: 16`, `marginVertical: 12`

| 상태 | 스타일 |
|------|--------|
| 활성 | 배경 `#FFFFFF` + `iosShadowLight`, `Inter_600SemiBold / Colors.text` |
| 비활성 | 배경 투명, `Inter_500Medium / #8E8E8E` |

- 탭 항목: `paddingVertical: 9`, `borderRadius: 10`

---

### 부위별 필터 행
- 가로 스크롤, `contentContainerStyle paddingHorizontal: 12`, `gap: 8`
- 아이콘 박스: `44×44`, `borderRadius: 10`, 배경 `#FFFFFF`
  - 활성: `border: 2px solid #FF6B35`
  - 비활성: border 없음
- 부위 이미지: PNG `40×40` (`contentFit: contain`), 하체만 예외 `60×60`
- "전체" 항목: `All` 텍스트, `15px / Inter_700Bold`
  - 활성: `Colors.accent(#FF6B35)`, 비활성: `#B0B0B0`
- 레이블 텍스트: `11px / Inter_500Medium / Colors.text` (활성), `#8E8E8E` (비활성)
- 레이블 위 간격: `4px`

---

### 기구별 — 사진으로 기구 찾기 버튼
- 배경: `#FFFFFF`, `borderRadius: 14`, `iosShadowLight`
- `marginHorizontal: 16`, `marginTop: 4`, `marginBottom: 10`
- `paddingVertical: 16`
- 아이콘: PNG `20×20` (카메라 아이콘)
- 텍스트: `15px / Inter_500Medium / Colors.text`
- 아이콘–텍스트 간격: `8px`, 가운데 정렬

---

### 루틴 리스트 카드 (공통)
- 카드 컨테이너: `borderRadius: 14`, 배경 `#FFFFFF`, `iosShadowLight`
- `paddingHorizontal: 24`
- 첫 항목 상단 padding: `24px`
- 마지막 항목 하단 padding: `24px`
- 나머지 항목 상단 padding: `16px`

#### 항목 간 구분선
- `height: StyleSheet.hairlineWidth`, 배경 `#E5E5EA`
- `marginTop: 16` (콘텐츠 → 구분선)

#### 부위별 탭 항목 레이아웃
```
[뱃지]  [타이틀]
[사용기구 · 시간]        [♡ N]
```
- 뱃지: 배경 `#F2F3F6`, `borderRadius: 5`, `paddingHorizontal: 6 / paddingVertical: 2`
  - 텍스트: `11px / Inter_600SemiBold / #8E8E8E`
- 뱃지–타이틀 간격: `10px`
- 타이틀: `15px / Inter_600SemiBold / Colors.text`
- 뱃지행–메타행 간격: `10px`
- 메타 텍스트: `13px / Inter_400Regular / #8E8E8E`

#### 기구별 탭 항목 레이아웃
```
[타이틀]
[부위 · 시간]            [♡ N]
```
- 뱃지 없음, 타이틀 단독 표시
- 메타: `부위 · 시간` 형태

#### 좋아요 영역
- 하트 PNG `16×16` + 숫자 텍스트 `12px / Inter_500Medium / #8E8E8E`
- 아이콘–숫자 간격: `4px`
- likes = 0 이면 미표시

---

## 11. UX 라이팅 규칙

화면에 표시되는 모든 문구는 아래 규칙을 따릅니다.

### 기본 원칙
- 모든 문구는 **해요체**로 씁니다. 예외 없음.
- **능동형** 문장을 씁니다. (됐어요 → 했어요, ~었 빼기)
- **긍정형** 문장을 씁니다. (없어요 → 있어요, 안 돼요 X)
- **캐주얼한 경어**를 씁니다. (~시겠어요, ~께 X)
- **명사+명사** 나열을 피하고 동사형으로 풀어씁니다.
- **되어요 → 돼요**로 통일합니다.
- 다이얼로그 왼쪽 버튼은 항상 **닫기** (취소 X)

### 예외적으로 수동형·경어를 써도 되는 경우
- 서비스 종료, 기간 만료 안내
- 사용자에게 미치는 영향을 설명할 때 (연체, 해지, 적용 등)
- 민감한 정보 수집 안내로 사용자를 안심시킬 때
- 사용자의 맥락을 활용해 질문할 때 (~시나요?, ~셨나요?)
- 사용자의 상황을 추정하거나 선의가 필요한 질문 (설문 등)
