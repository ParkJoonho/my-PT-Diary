import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

type IconProps = { color?: string; size?: number };

export type SemanticIconName =
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronUp'
  | 'chevronDown'
  | 'play';

export type OriginalAppIconName =
  | 'add'
  | 'addCircle'
  | 'accessibilityOutline'
  | 'analyticsOutline'
  | 'arrowDown'
  | 'arrowForward'
  | 'arrowUp'
  | 'armFlexOutline'
  | 'barbell'
  | 'barbellOutline'
  | 'bike'
  | 'body'
  | 'bodyOutline'
  | 'brain'
  | 'calendar'
  | 'calendarOutline'
  | 'camera'
  | 'cameraOutline'
  | 'cafeOutline'
  | 'chartBoxOutline'
  | 'chatbubbleEllipsesOutline'
  | 'checkmarkCircle'
  | 'checkmark'
  | 'close'
  | 'closeCircle'
  | 'clipboardOutline'
  | 'compare'
  | 'compareHorizontal'
  | 'documentText'
  | 'fitness'
  | 'fitnessOutline'
  | 'foodApple'
  | 'foodAppleOutline'
  | 'foodVariant'
  | 'footsteps'
  | 'footstepsOutline'
  | 'helpCircleOutline'
  | 'heart'
  | 'heartOutline'
  | 'human'
  | 'humanHandsDown'
  | 'humanHandsUp'
  | 'humanMaleBoard'
  | 'humanMaleHeight'
  | 'images'
  | 'informationCircle'
  | 'lightbulb'
  | 'lightbulbOutline'
  | 'lightningBolt'
  | 'location'
  | 'logOutOutline'
  | 'medicalBag'
  | 'mic'
  | 'moonOutline'
  | 'person'
  | 'personOutline'
  | 'pieChart'
  | 'pulse'
  | 'refresh'
  | 'remove'
  | 'removeCircleOutline'
  | 'restaurant'
  | 'restaurantOutline'
  | 'robot'
  | 'run'
  | 'saveOutline'
  | 'searchOutline'
  | 'shoePrint'
  | 'star'
  | 'starCircle'
  | 'speedometerOutline'
  | 'sunnyOutline'
  | 'timeOutline'
  | 'trendingUpOutline'
  | 'trendingDownOutline'
  | 'trashOutline'
  | 'videocam'
  | 'volumeHigh'
  | 'walk'
  | 'walkOutline'
  | 'warningOutline'
  | 'weightLifter';

type SemanticIconProps = IconProps & {
  name: SemanticIconName;
};

const MATERIAL_ICON_PATHS: Partial<Record<OriginalAppIconName, string>> = {
  brain:
    'M21.33 12.91c.09 1.55-.62 3.04-1.89 3.95l.77 1.49c.23.45.26.98.06 1.45-.19.47-.58.84-1.06 1l-.79.25c-.17.06-.36.09-.54.09-.51 0-.99-.23-1.32-.64L14.44 18A5.3 5.3 0 0 1 12 16.9a5.21 5.21 0 0 1-4-.56 5.48 5.48 0 0 1-3.92-.23 4 4 0 0 1-2.43-3.61 4.53 4.53 0 0 1 .35-2.11 3.8 3.8 0 0 1-.07-2.33 4.36 4.36 0 0 1 1.94-2.24A4.07 4.07 0 0 1 7.87 3.12a4.48 4.48 0 0 1 5.83-.37 5.13 5.13 0 0 1 4.8 1.47 4.72 4.72 0 0 1 3.58 4.47 5.4 5.4 0 0 1-.86 3.13c.07.36.11.72.11 1.09M16.33 11.5c.57.07 1.02.5 1.02 1.07a1 1 0 0 1-1 1h-.63a5.44 5.44 0 0 1-1.62 2.29c.25.09.51.14.77.21 5.13-.07 4.53-3.2 4.53-3.25a2.59 2.59 0 0 0-2.69-2.49 1 1 0 0 1 0-2c1.23.03 2.41.49 3.33 1.3.05-.29.08-.59.08-.89-.06-1.24-.62-2.32-2.87-2.53C16 3.25 12.85 4.89 12.85 5.81c-.03.23.21.72.25.75a1 1 0 0 1 0 2 2.34 2.34 0 0 1-1.43-.56 3.9 3.9 0 0 1-1.6.56 1 1 0 0 1-.19-2c.16-.02.94-.14.94-.77 0-.66.25-1.29.68-1.79-.92-.25-1.91.08-2.91 1.29C6.75 5 6 5.25 5.45 7.2 4.5 7.67 4 8 3.78 9c1.08-.22 2.19-.13 3.22.25.5.19.78.75.59 1.29-.19.52-.77.78-1.29.59A3.32 3.32 0 0 0 4 11.07c-.32.27-.32.83-.32 1.27 0 .74.37 1.43 1 1.83.53.27 1.12.41 1.71.4-.15-.26-.28-.53-.39-.81a1 1 0 1 1 1.96-.68 3.04 3.04 0 0 0 2.62 2.05A3.82 3.82 0 0 0 13.77 13c.23-1.38 1.34-1.5 2.56-1.5m2 7.47-.62-1.3-.71.16 1 1.25.33-.11M13.68 10.36a1 1 0 0 0-.91-1.03 2.92 2.92 0 0 0-2.77 2.86 1 1 0 1 0 2 0c0-.27.07-.54.23-.76.12-.1.27-.15.43-.15.55.03 1.02-.38 1.02-.92Z',
  compare:
    'M19 3h-5v2h5v13l-5-6v9h5a2 2 0 0 0 2-2V5c0-1.11-.9-2-2-2M10 18H5l5-6m0-9H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v2h2V1h-2v2Z',
  compareHorizontal: 'M9 7 5 11h3v2H5l4 4v-3h6v3l4-4h-3v-2h3l-4-4v3H9V7Z',
  human:
    'M21 9h-6v13h-2v-6h-2v6H9V9H3V7h18M12 2a2 2 0 0 1 2 2 2 2 0 0 1-2 2c-1.11 0-2-.9-2-2 0-1.11.89-2 2-2Z',
  humanHandsDown:
    'M12 1c-1.11 0-2 .9-2 2 0 1.11.89 2 2 2 1.11 0 2-.89 2-2a2 2 0 0 0-2-2m-2 5c-.27 0-.5.11-.69.28H9.3L4 11.59 5.42 13 9 9.41V22h2v-7h2v7h2V9.41L18.58 13 20 11.59l-5.3-5.31C14.5 6.11 14.27 6 14 6',
  humanHandsUp:
    'M5 1c0 2.7 1.56 5.16 4 6.32V22h2v-7h2v7h2V7.31C17.44 6.16 19 3.7 19 1h-2a5 5 0 0 1-5 5 5 5 0 0 1-5-5m5 0c-1.11 0-2 .89-2 2s.89 2 2 2 2-.89 2-2-.89-2-2-2Z',
  humanMaleBoard:
    'M20 17a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H9.46C9.81 2.61 10 3.3 10 4h10v11h-9v2m4-10v2H9v13H7v-6H5v6H3v-8H1.5V9a2 2 0 0 1 2-2H15M8 4a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2Z',
  humanMaleHeight:
    'M7 2c1.78 0 2.67 2.16 1.42 3.42C7.16 6.67 5 5.78 5 4a2 2 0 0 1 2-2M5.5 7h3a2 2 0 0 1 2 2v5.5H9V22H5v-7.5H3.5V9a2 2 0 0 1 2-2M21 8h-6v2h6m0 1h-3v2h3m0-11h-6v2h6m0 1h-3v2h3m0 7h-6v2h6m0 4h-6v2h6m0-5h-3v2h3',
  medicalBag:
    'M10 3 8 5v2H5c-1.15 0-1.88 1-2 2L2 19c-.12 1 .54 2 2 2h16c1.46 0 2.12-1 2-2L21 9c-.12-1-.94-2-2-2h-3V5l-2-2h-4m0 2h4v2h-4V5m1 5h2v3h3v2h-3v3h-2v-3H8v-2h3v-3Z',
  shoePrint:
    'M10.74 11.72c.47 1.23.42 2.51-.99 3.02-2.9 1.07-3.55-1.74-3.59-1.88l4.58-1.14M5.71 10.91l4.32-1.07c-.19-1.05.1-2.1.1-3.34 0-1.68-1.33-4.97-3.45-4.44C4.26 2.66 3.91 5.35 4 6.65c.12 1.3 1.64 4.08 1.71 4.26m12.14 8.94c-.03.15-.69 2.95-3.59 1.89-1.4-.52-1.46-1.8-.99-3.03l4.58 1.14M20 13.65c.1-1.3-.24-4-2.67-4.6-2.11-.55-3.44 2.76-3.44 4.45 0 1.23.28 2.28.11 3.33l4.3 1.07c.08-.18 1.59-2.96 1.7-4.25Z',
  weightLifter:
    'M7 6.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0M1 8h2v3h2V9h2v2h5V9h2v2h2V8h2v8h-2v-3h-2v2h-2v-2H7v2H5v-2H3v3H1V8m7 7h3l2 7h-3l-1.5-4L7 22H4l2.5-7H8Z',
};

export function SemanticIcon({
  color = '#B8C1CC',
  name,
  size = 20,
}: SemanticIconProps) {
  if (name === 'play') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M133 440a35.37 35.37 0 0 1-17.5-4.67C103.5 428.53 96.04 415.37 96.04 401V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440Z"
          fill={color}
        />
      </Svg>
    );
  }

  const path =
    name === 'chevronRight'
      ? 'M184 112l144 144-144 144'
      : name === 'chevronLeft'
        ? 'M328 112 184 256l144 144'
        : name === 'chevronUp'
          ? 'M112 328l144-144 144 144'
          : 'M112 184l144 144 144-144';

  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path
        d={path}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={48}
      />
    </Svg>
  );
}

export function OriginalAppIcon({
  color = '#B8C1CC',
  name,
  size = 20,
}: IconProps & { name: OriginalAppIconName }) {
  const materialPath = MATERIAL_ICON_PATHS[name];

  if (materialPath) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={materialPath} fill={color} />
      </Svg>
    );
  }

  if (name === 'arrowForward') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Line
          x1="80"
          y1="256"
          x2="432"
          y2="256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="48"
        />
        <Polyline
          points="288 112 432 256 288 400"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="48"
        />
      </Svg>
    );
  }

  if (name === 'arrowUp' || name === 'arrowDown') {
    const points =
      name === 'arrowUp'
        ? '112 272 256 128 400 272'
        : '112 240 256 384 400 240';

    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Line
          x1="256"
          y1={name === 'arrowUp' ? '416' : '96'}
          x2="256"
          y2={name === 'arrowUp' ? '128' : '384'}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="48"
        />
        <Polyline
          points={points}
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="48"
        />
      </Svg>
    );
  }

  if (name === 'remove') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Line
          x1="80"
          y1="256"
          x2="432"
          y2="256"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="48"
        />
      </Svg>
    );
  }

  if (name === 'trendingDownOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Polyline
          points="352 368 464 368 464 256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="m48 144 121.37 121.37a32 32 0 0 0 45.26 0l50.74-50.74a32 32 0 0 1 45.26 0L448 352"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'chartBoxOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke={color}
          strokeWidth="2"
        />
        <Line
          x1="8"
          y1="17"
          x2="8"
          y2="12"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Line
          x1="12"
          y1="17"
          x2="12"
          y2="8"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2"
        />
        <Line
          x1="16"
          y1="17"
          x2="16"
          y2="10"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="2"
        />
      </Svg>
    );
  }

  if (name === 'camera') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Circle cx="256" cy="272" r="64" fill={color} />
        <Path
          d="M432 144h-59c-3 0-6.72-1.94-9.62-5l-25.94-40.94a15.52 15.52 0 0 0-1.37-1.85C327.11 85.76 315 80 302 80h-92c-13 0-25.11 5.76-34.07 16.21a15.52 15.52 0 0 0-1.37 1.85l-25.94 41c-2.22 2.42-5.34 5-8.62 5v-8a16 16 0 0 0-16-16h-24a16 16 0 0 0-16 16v8h-4a48.05 48.05 0 0 0-48 48v192a48.05 48.05 0 0 0 48 48h352a48.05 48.05 0 0 0 48-48V192a48.05 48.05 0 0 0-48-48ZM256 368a96 96 0 1 1 96-96 96.11 96.11 0 0 1-96 96Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'cameraOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle cx="256" cy="272" r="64" stroke={color} strokeWidth="32" />
        <Path
          d="M432 144h-59c-3 0-7-2-9-5l-26-41c-9-11-22-18-36-18h-92c-14 0-27 7-36 18l-26 41c-2 3-6 5-9 5H80a48 48 0 0 0-48 48v192a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48V192a48 48 0 0 0-48-48Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="32"
        />
      </Svg>
    );
  }

  if (name === 'foodApple' || name === 'foodAppleOutline') {
    const filled = name === 'foodApple';

    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 8c-1.7-1.6-4.1-2-6-.8C3.9 8.5 3 10.8 3.3 13.2 3.8 17.4 6.2 21 9 21c1 0 1.8-.5 3-.5s2 .5 3 .5c2.8 0 5.2-3.6 5.7-7.8.3-2.4-.6-4.7-2.7-6-1.9-1.2-4.3-.8-6 .8Z"
          fill={filled ? color : 'none'}
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={filled ? 0 : 1.8}
        />
        <Path
          d="M12 8c0-2.8 1.5-4.5 4.5-5"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </Svg>
    );
  }

  if (name === 'sunnyOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle cx="256" cy="256" r="80" stroke={color} strokeWidth="32" />
        {[
          [256, 48, 256, 96],
          [256, 416, 256, 464],
          [48, 256, 96, 256],
          [416, 256, 464, 256],
          [109, 109, 143, 143],
          [369, 369, 403, 403],
          [109, 403, 143, 369],
          [369, 143, 403, 109],
        ].map(([x1, y1, x2, y2]) => (
          <Line
            key={`${x1}-${y1}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeLinecap="round"
            strokeWidth="32"
          />
        ))}
      </Svg>
    );
  }

  if (name === 'moonOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M264 480A232 232 0 0 1 32 248C32 154 88 70 174 34a16 16 0 0 1 21 20c-10 30-12 60-6 90 18 88 103 145 191 127 24-5 46-15 66-30a16 16 0 0 1 25 14c-4 125-106 225-231 225Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="32"
        />
      </Svg>
    );
  }

  if (name === 'restaurant') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="m57 48 369 368a37 37 0 1 1-53 53l-90-92a32 32 0 0 1-9-22v-6a32 32 0 0 0-10-22l-11-11a32 32 0 0 0-30-8 49 49 0 0 1-47-12l-85-86C40 160 22 83 57 48Zm343-16-77 77a64 64 0 0 0-19 46v14a16 16 0 0 1-5 12l-27 27 32 32 27-27a16 16 0 0 1 12-5h14a64 64 0 0 0 46-19L480 112l-23-23-80 80a16 16 0 0 1-23-23l80-80-34-34ZM200 368 100 468a40 40 0 1 1-56-56l84-84 72 40Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'bike') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle cx="112" cy="352" r="80" stroke={color} strokeWidth="32" />
        <Circle cx="400" cy="352" r="80" stroke={color} strokeWidth="32" />
        <Path
          d="m112 352 80-160h96l112 160M192 192l96 160H112m176 0 48-224h56"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="32"
        />
      </Svg>
    );
  }

  if (name === 'foodVariant') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M6 2v8c0 1.1.9 2 2 2v10h2V12c1.1 0 2-.9 2-2V2h-2v6H9V2H7v6H6V2m10 0c-1.66 0-3 1.34-3 3v7h2v10h2V2h-1Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'speedometerOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M96 416a192 192 0 1 1 320 0"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="32"
        />
        <Line
          x1="256"
          y1="320"
          x2="368"
          y2="176"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="32"
        />
        <Circle cx="256" cy="320" r="24" fill={color} />
      </Svg>
    );
  }

  if (name === 'saveOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M96 48h272l48 48v368H96V48Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="32"
        />
        <Rect
          x="160"
          y="48"
          width="176"
          height="112"
          stroke={color}
          strokeWidth="32"
        />
        <Circle cx="256" cy="320" r="72" stroke={color} strokeWidth="32" />
      </Svg>
    );
  }

  if (name === 'warningOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M256 48 32 448h448L256 48Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth="32"
        />
        <Line
          x1="256"
          y1="176"
          x2="256"
          y2="304"
          stroke={color}
          strokeLinecap="round"
          strokeWidth="32"
        />
        <Circle cx="256" cy="376" r="16" fill={color} />
      </Svg>
    );
  }

  if (name === 'robot') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M10 2h4v2h-1v2h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h4V4h-1V2m-2 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4m8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4M8 17h8v-2H8v2Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'starCircle') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path
          d="m12 5 2.1 4.25 4.69.68-3.4 3.31.8 4.68L12 15.7l-4.19 2.22.8-4.68-3.4-3.31 4.69-.68L12 5Z"
          fill="#FFFFFF"
        />
      </Svg>
    );
  }

  if (name === 'pieChart') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path d="M256 32v224h224C480 132.29 379.71 32 256 32Z" fill={color} />
        <Path
          d="M224 64C100.29 64 0 164.29 0 288s100.29 224 224 224 224-100.29 224-224H224V64Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'lightbulb') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M9 21h6v-1H9v1m3-19a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'images') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M450.29 112H142c-34 0-62 27.51-62 61.33v245.34C80 452.49 108 480 142 480h308c34 0 62-26.18 62-60V173.33c0-33.82-27.68-61.33-61.71-61.33Zm-77.15 61.34a46 46 0 1 1-46.28 46 46.19 46.19 0 0 1 46.28-46Zm-231.55 276c-17 0-29.86-13.75-29.86-30.66v-64.82l90.46-80.79a46.54 46.54 0 0 1 63.44 1.83L328.27 337l-113 112.33ZM480 418.67a30.67 30.67 0 0 1-30.71 30.66H259L376.08 333a46.24 46.24 0 0 1 59.44-.16L480 370.59Z"
          fill={color}
        />
        <Path
          d="M384 32H64A64 64 0 0 0 0 96v256a64.11 64.11 0 0 0 48 62V152a72 72 0 0 1 72-72h326A64.11 64.11 0 0 0 384 32Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'fitness') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M193.69 152.84a16 16 0 0 1 29.64 2.56l36.4 121.36 30-59.92a16 16 0 0 1 28.62 0L345.89 272h96.76A213.08 213.08 0 0 0 464 176.65C463.37 114.54 413.54 64 352.92 64c-48.09 0-80 29.54-96.92 51-16.88-21.49-48.83-51-96.92-51C98.46 64 48.63 114.54 48 176.65A211.13 211.13 0 0 0 56.93 240h93.18Z"
          fill={color}
        />
        <Path
          d="M321.69 295.16 304 259.78l-33.69 67.38A16 16 0 0 1 256 336q-.67 0-1.38-.06a16 16 0 0 1-14-11.34l-36.4-121.36-30 59.92A16 16 0 0 1 160 272H69.35q14 29.29 37.27 57.66c18.77 22.88 52.8 59.46 131.39 112.81a31.84 31.84 0 0 0 36 0c78.59-53.35 112.62-89.93 131.39-112.81A316.79 316.79 0 0 0 424.4 304H336a16 16 0 0 1-14.31-8.84ZM464 272h-21.35a260.11 260.11 0 0 1-18.25 32H464a16 16 0 0 0 0-32ZM48 240a16 16 0 0 0 0 32h21.35a225.22 225.22 0 0 1-12.42-32Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'footsteps') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M133.83 361.27c-22.61 0-41-8.17-54.79-24.39S56.2 296.59 50.93 261.57c-7.76-51.61-.06-95.11 21.68-122.48 12.8-16.12 29.6-25.44 48.58-26.94 16.25-1.3 40.54 5.29 64 44 14.69 24.24 25.86 56.44 30.65 88.34 5.79 38.51 1.48 66.86-13.18 86.65-11.64 15.72-29.54 25.46-53.21 29a106.46 106.46 0 0 1-15.62 1.13ZM173 496c-13.21 0-26.6-4.23-38.66-12.36a79.79 79.79 0 0 1-33.52-50.6c-2.85-14.66-1.14-26.31 5.22-35.64 10.33-15.15 28.87-18.56 48.49-22.18 2.07-.38 4.17-.76 6.3-1.17 4.52-.86 9.14-2 13.62-3.11 16.78-4.14 34.14-8.43 48.47 1.75 9.59 6.8 15 18.36 16.62 35.32 1.84 19.57-2.36 39.1-11.83 55-10.19 17.11-25.47 28.42-43 31.86A61 61 0 0 1 173 496ZM378.17 265.27a106.69 106.69 0 0 1-15.6-1.2c-23.66-3.5-41.56-13.25-53.2-29-14.66-19.79-19-48.13-13.18-86.65 4.79-31.93 15.93-64.1 30.55-88.25 23.34-38.57 47.66-45.26 64-44.08 18.92 1.38 35.69 10.57 48.51 26.6 21.89 27.37 29.65 71 21.86 122.84-5.27 35-14.2 58.95-28.11 75.31s-32.22 24.43-54.83 24.43ZM339 400a61 61 0 0 1-11.68-1.13c-17.56-3.44-32.84-14.75-43-31.86-9.47-15.9-13.67-35.43-11.83-55 1.6-17 7-28.52 16.62-35.33 14.33-10.17 31.69-5.89 48.47-1.74 4.48 1.1 9.1 2.24 13.62 3.11l6.29 1.17c19.63 3.61 38.17 7 48.5 22.17 6.36 9.33 8.07 21 5.22 35.64a79.78 79.78 0 0 1-33.52 50.61C365.56 395.78 352.17 400 339 400Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'star') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M394 480a16 16 0 0 1-9.39-3L256 383.76 127.39 477a16 16 0 0 1-24.55-18.08L153 310.35 23 221.2A16 16 0 0 1 32 192h160.38l48.4-148.95a16 16 0 0 1 30.44 0l48.4 149H480a16 16 0 0 1 9.05 29.2L359 310.35l50.13 148.53A16 16 0 0 1 394 480Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'lightningBolt') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M11 15H6L13 1V9H18L11 23V15Z" fill={color} />
      </Svg>
    );
  }

  if (name === 'informationCircle') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56Zm0 82a26 26 0 1 1-26 26 26 26 0 0 1 26-26Zm48 226h-88a16 16 0 0 1 0-32h28v-88h-16a16 16 0 0 1 0-32h32a16 16 0 0 1 16 16v104h28a16 16 0 0 1 0 32Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'helpCircleOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle
          cx="256"
          cy="256"
          r="176"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Path
          d="M200 202.29s.84-17.5 19.57-32.57C230.68 160.77 244 158.18 256 158c10.93-.14 20.69 1.67 26.53 4.45C292.53 167.21 312 178.83 312 203.54c0 26-17 37.81-36.37 50.8S251 281.43 251 296"
          stroke={color}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={28}
        />
        <Circle cx="250" cy="348" r="20" fill={color} />
      </Svg>
    );
  }

  if (name === 'closeCircle') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48Zm75.31 260.69a16 16 0 1 1-22.62 22.62L256 278.63l-52.69 52.68a16 16 0 0 1-22.62-22.62L233.37 256l-52.68-52.69a16 16 0 0 1 22.62-22.62L256 233.37l52.69-52.68a16 16 0 0 1 22.62 22.62L278.63 256Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'location') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Circle cx="256" cy="192" r="32" fill={color} />
        <Path
          d="M256 32C167.78 32 96 100.65 96 185c0 40.17 18.31 93.59 54.42 158.78 29 52.34 62.55 99.67 80 123.22a31.75 31.75 0 0 0 51.22 0c17.42-23.55 51-70.88 80-123.22C397.69 278.61 416 225.19 416 185 416 100.65 344.22 32 256 32Zm0 224a64 64 0 1 1 64-64 64.07 64.07 0 0 1-64 64Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'armFlexOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M7 7.76V16.25H11.08L11.68 15.34C12.84 13.55 14.93 12.75 16.47 12.75C17 12.75 17.45 12.84 17.79 13C18.7 13.41 18.95 14.18 19 14.74C19.08 15.87 18.5 17.03 17.5 17.71C16.6 18.33 14.44 19 11.87 19C10.12 19 7.61 18.69 5.12 17.3C5.41 14.85 6 10.88 7 7.76M7 3C4 7.09 3 18.34 3 18.34C5.9 20.31 9.08 21 11.87 21C14.86 21 17.39 20.21 18.64 19.36C21.64 17.32 21.94 12.71 18.64 11.18C18 10.89 17.26 10.75 16.47 10.75C14.17 10.75 11.5 11.96 10 14.25H9V7.09H11L12 4L7 3Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'run') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M13.5 5.5C14.59 5.5 15.5 4.58 15.5 3.5C15.5 2.38 14.59 1.5 13.5 1.5C12.39 1.5 11.5 2.38 11.5 3.5C11.5 4.58 12.39 5.5 13.5 5.5M9.89 19.38L10.89 15L13 17V23H15V15.5L12.89 13.5L13.5 10.5C14.79 12 16.79 13 19 13V11C17.09 11 15.5 10 14.69 8.58L13.69 7C13.29 6.38 12.69 6 12 6C11.69 6 11.5 6.08 11.19 6.08L6 8.28V13H8V9.58L9.79 8.88L8.19 17L3.29 16L2.89 18L9.89 19.38Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'addCircle') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48Zm80 224h-64v64a16 16 0 0 1-32 0v-64h-64a16 16 0 0 1 0-32h64v-64a16 16 0 0 1 32 0v64h64a16 16 0 0 1 0 32Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'checkmark') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Polyline
          points="416 128 192 384 96 288"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'removeCircleOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192Z"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Line
          x1="336"
          y1="256"
          x2="176"
          y2="256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'trashOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="m112 112 20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="80"
          y1="112"
          x2="432"
          y2="112"
          stroke={color}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Path
          d="M192 112V72a23.93 23.93 0 0 1 24-24h80a23.93 23.93 0 0 1 24 24v40"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="256"
          y1="176"
          x2="256"
          y2="400"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="184"
          y1="176"
          x2="192"
          y2="400"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="328"
          y1="176"
          x2="320"
          y2="400"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'personOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M344 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="M256 304c-87 0-175.3 48-191.64 138.6C62.39 453.52 68.57 464 80 464h352c11.44 0 17.62-10.48 15.65-21.4C431.3 352 343 304 256 304Z"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'add') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Line
          x1="256"
          y1="112"
          x2="256"
          y2="400"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="400"
          y1="256"
          x2="112"
          y2="256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'person') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M332.64 64.58C313.18 43.57 286 32 256 32c-30.16 0-57.43 11.5-76.8 32.38-19.58 21.11-29.12 49.8-26.88 80.78C156.76 206.28 203.27 256 256 256s99.16-49.71 103.67-110.82c2.27-30.7-7.33-59.33-27.03-80.6ZM432 480H80a31 31 0 0 1-24.2-11.13c-6.5-7.77-9.12-18.38-7.18-29.11C57.06 392.94 83.4 353.61 124.8 326c36.78-24.51 83.37-38 131.2-38s94.42 13.5 131.2 38c41.4 27.6 67.74 66.93 76.18 113.75 1.94 10.73-.68 21.34-7.18 29.11A31 31 0 0 1 432 480Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'logOutOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M304 336v40a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V136a40 40 0 0 1 40-40h152c22.09 0 48 17.91 48 40v40"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Polyline
          points="368 336 448 256 368 176"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="176"
          y1="256"
          x2="432"
          y2="256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'close') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M289.94 256l95-95A24 24 0 0 0 351 127l-95 95-95-95A24 24 0 0 0 127 161l95 95-95 95A24 24 0 1 0 161 385l95-95 95 95A24 24 0 0 0 385 351Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'checkmarkCircle') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48Zm108.25 138.29-134.4 160a16 16 0 0 1-12 5.71h-.27a16 16 0 0 1-11.89-5.3l-57.6-64a16 16 0 1 1 23.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0 1 24.5 20.58Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'documentText') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M428 224H288a48 48 0 0 1-48-48V36a4 4 0 0 0-4-4h-92a64 64 0 0 0-64 64v320a64 64 0 0 0 64 64h224a64 64 0 0 0 64-64V228a4 4 0 0 0-4-4Zm-92 160H176a16 16 0 0 1 0-32h160a16 16 0 0 1 0 32Zm0-80H176a16 16 0 0 1 0-32h160a16 16 0 0 1 0 32ZM419.22 188.59 275.41 44.78A2 2 0 0 0 272 46.19V176a16 16 0 0 0 16 16h129.81a2 2 0 0 0 1.41-3.41Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'refresh') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M320 146s24.36-12-64-12a160 160 0 1 0 160 160"
          stroke={color}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Polyline
          points="256 58 336 138 256 218"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'searchOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle
          cx="221.09"
          cy="221.09"
          r="157.09"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Line
          x1="338.29"
          y1="338.29"
          x2="448"
          y2="448"
          stroke={color}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'mic') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Line
          x1="192"
          y1="448"
          x2="320"
          y2="448"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="M384 208v32c0 70.4-57.6 128-128 128s-128-57.6-128-128v-32"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="256"
          y1="368"
          x2="256"
          y2="448"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="M256 320a78.83 78.83 0 0 1-56.55-24.1A80.89 80.89 0 0 1 176 239V128a79.69 79.69 0 0 1 80-80c44.86 0 80 35.14 80 80v111c0 44.66-35.89 81-80 81Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'volumeHigh') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M232 416a23.88 23.88 0 0 1-14.2-4.68 8.27 8.27 0 0 1-.66-.51L125.76 336H56a24 24 0 0 1-24-24V200a24 24 0 0 1 24-24h69.75l91.37-74.81a8.27 8.27 0 0 1 .66-.51A24 24 0 0 1 256 120v272a24 24 0 0 1-24 24Z"
          fill={color}
        />
        <Path
          d="M320 336a16 16 0 0 1-14.29-23.19c9.49-18.87 14.3-38 14.3-56.81 0-19.38-4.66-37.94-14.25-56.73a16 16 0 0 1 28.5-14.54C346.19 208.12 352 231.44 352 256c0 23.86-6 47.81-17.7 71.19A16 16 0 0 1 320 336Zm48 48a16 16 0 0 1-13.86-24C373.05 327.09 384 299.51 384 256c0-44.17-10.93-71.56-29.82-103.94a16 16 0 0 1 27.64-16.12C402.92 172.11 416 204.81 416 256c0 50.43-13.06 83.29-34.13 120A16 16 0 0 1 368 384Zm48 48a16 16 0 0 1-13.39-24.74C429.85 365.47 448 323.76 448 256c0-66.5-18.18-108.62-45.49-151.39a16 16 0 1 1 27-17.22C459.81 134.89 480 181.74 480 256c0 64.75-14.66 113.63-50.6 168.74A16 16 0 0 1 416 432Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'videocam') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M464 384.39a32 32 0 0 1-13-2.77 15.77 15.77 0 0 1-2.71-1.54l-82.71-58.22A32 32 0 0 1 352 295.7v-79.4a32 32 0 0 1 13.58-26.16l82.71-58.22a15.77 15.77 0 0 1 2.71-1.54 32 32 0 0 1 45 29.24v192.76a32 32 0 0 1-32 32ZM268 400H84a68.07 68.07 0 0 1-68-68V180a68.07 68.07 0 0 1 68-68h184.48A67.6 67.6 0 0 1 336 179.52V332a68.07 68.07 0 0 1-68 68Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'cafeOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M368 80h64a16 16 0 0 1 16 16v34a46 46 0 0 1-46 46h-34M96 80h272v192a80 80 0 0 1-80 80H176a80 80 0 0 1-80-80V80Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="64"
          y1="416"
          x2="400"
          y2="416"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'walk') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="m312.55 479.9-56.42-114-44.62-57A72.37 72.37 0 0 1 201.45 272V143.64H217a40 40 0 0 1 40 40v182.21M127.38 291.78v-74.07s37-74.07 74.07-74.07"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="M368.09 291.78a18.49 18.49 0 0 1-10.26-3.11L297.7 250a21.18 21.18 0 0 1-9.7-17.79v-23.7a5.65 5.65 0 0 1 8.69-4.77l81.65 54.11a18.52 18.52 0 0 1-10.25 33.93ZM171.91 493.47a18.5 18.5 0 0 1-14.83-7.41c-6.14-8.18-4-17.18 3.7-25.92l59.95-74.66a7.41 7.41 0 0 1 10.76 2.06c1.56 2.54 3.38 5.65 5.19 9.09 5.24 9.95 6 16.11-1.68 25.7-8 10-52 67.44-52 67.44-2.62 2.98-7.23 3.7-11.09 3.7Z"
          fill={color}
        />
        <Circle
          cx="257"
          cy="69.56"
          r="37.04"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={16}
        />
      </Svg>
    );
  }

  if (name === 'timeOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle
          cx="256"
          cy="256"
          r="192"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Polyline
          points="256 128 256 272 352 272"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'walkOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M314.21 482.32 257.44 367.58l-44.89-57.39a72.82 72.82 0 0 1-10.13-37.05V144h15.67a40.22 40.22 0 0 1 40.23 40.22v183.36"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="M127.9 293.05v-74.52S165.16 144 202.42 144"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="370.1"
          y1="274.42"
          x2="304"
          y2="231"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="170.53"
          y1="478.36"
          x2="224"
          y2="400"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Circle
          cx="258.32"
          cy="69.48"
          r="37.26"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'barbellOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Line
          x1="48"
          y1="256"
          x2="464"
          y2="256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Rect
          x="384"
          y="128"
          width="32"
          height="256"
          rx="16"
          stroke={color}
          strokeWidth={32}
        />
        <Rect
          x="96"
          y="128"
          width="32"
          height="256"
          rx="16"
          stroke={color}
          strokeWidth={32}
        />
        <Rect
          x="32"
          y="192"
          width="16"
          height="128"
          rx="8"
          stroke={color}
          strokeWidth={32}
        />
        <Rect
          x="464"
          y="192"
          width="16"
          height="128"
          rx="8"
          stroke={color}
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'heartOutline' || name === 'fitnessOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M352.92 80C288 80 256 144 256 144s-32-64-96.92-64C106.32 80 64.54 124.14 64 176.81c-1.1 109.33 86.73 187.08 183 252.42a16 16 0 0 0 18 0c96.26-65.34 184.09-143.09 183-252.42C447.46 124.14 405.68 80 352.92 80Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        {name === 'fitnessOutline' ? (
          <Polyline
            points="48 256 160 256 208 160 256 320 304 224 336 288 464 288"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={32}
          />
        ) : null}
      </Svg>
    );
  }

  if (name === 'bodyOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle
          cx="256"
          cy="56"
          r="40"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        <Path
          d="m199.3 295.62-30.4 172.2a24 24 0 0 0 19.5 27.8 23.76 23.76 0 0 0 27.6-19.5l21-119.9v.2s5.2-32.5 17.5-32.5h3.1c12.5 0 17.5 32.5 17.5 32.5v-.1l21 119.9a23.92 23.92 0 1 0 47.1-8.4l-30.4-172.2-4.9-29.7c-2.9-18.1-4.2-47.6.5-59.7 4-10.4 14.13-14.2 23.2-14.2H424a24 24 0 0 0 0-48H88a24 24 0 0 0 0 48h92.5c9.23 0 19.2 3.8 23.2 14.2 4.7 12.1 3.4 41.6.5 59.7Z"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'chatbubbleEllipsesOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M87.48 380c1.2-4.38-1.43-10.47-3.94-14.86a42.63 42.63 0 0 0-2.54-3.8 199.81 199.81 0 0 1-33-110C47.64 139.09 140.72 48 255.82 48 356.2 48 440 117.54 459.57 209.85A199 199 0 0 1 464 251.49c0 112.41-89.49 204.93-204.59 204.93-18.31 0-43-4.6-56.47-8.37s-26.92-8.77-30.39-10.11a31.14 31.14 0 0 0-11.13-2.07 30.7 30.7 0 0 0-12.08 2.43L81.5 462.78A15.92 15.92 0 0 1 76.84 464a9.61 9.61 0 0 1-9.58-9.74 15.85 15.85 0 0 1 .6-3.29Z"
          stroke={color}
          strokeLinecap="round"
          strokeMiterlimit={10}
          strokeWidth={32}
        />
        {[160, 256, 352].map((cx) => (
          <Circle cx={cx} cy="256" fill={color} key={cx} r="32" />
        ))}
      </Svg>
    );
  }

  if (name === 'restaurantOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="m57.49 47.74 368.43 368.43a37.28 37.28 0 0 1 0 52.72 37.29 37.29 0 0 1-52.72 0l-90-91.55a32 32 0 0 1-9.2-22.43v-5.53a32 32 0 0 0-9.52-22.78l-11.62-10.73a32 32 0 0 0-29.8-7.44 48.53 48.53 0 0 1-46.56-12.63l-85.43-85.44C40.39 159.68 21.74 83.15 57.49 47.74Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="m400 32-77.25 77.25A64 64 0 0 0 304 154.51v14.86a16 16 0 0 1-4.69 11.32L288 192M320 224l11.31-11.31A16 16 0 0 1 342.63 208h14.86a64 64 0 0 0 45.26-18.75L480 112M200 368 100.28 468.28a40 40 0 0 1-56.56 0 40 40 0 0 1 0-56.56L128 328"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="440"
          y1="72"
          x2="360"
          y2="152"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'accessibilityOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Circle
          cx="256"
          cy="56"
          r="40"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="M204.23 274.44c2.9-18.06 4.2-35.52-.5-47.59-4-10.38-12.7-16.19-23.2-20.15L88 176.76c-12-4-23.21-10.7-24-23.94-1-17 14-28 29-24 0 0 88 31.14 163 31.14s162-31 162-31c18-5 30 9 30 23.79 0 14.21-11 19.21-24 23.94l-88 31.91c-8 3-21 9-26 18.18-6 10.75-5 29.53-2.1 47.59l5.9 29.63 37.41 163.9c2.8 13.15-6.3 25.44-19.4 27.74S308 489 304.12 476.28l-37.56-115.93q-2.71-8.34-4.8-16.87L256 320l-5.3 21.65q-2.52 10.35-5.8 20.48L208 476.18c-4 12.85-14.5 21.75-27.6 19.46S158 480.05 160.94 467.9l37.39-163.83Z"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'footstepsOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M200 246.84c8.81 58.62-7.33 90.67-52.91 97.41-50.65 7.49-71.52-26.44-80.33-85.06-11.85-78.88 16-127.94 55.71-131.1 36.14-2.87 68.71 60.14 77.53 118.75ZM223.65 409.53c3.13 33.28-14.86 64.34-42 69.66-27.4 5.36-58.71-16.37-65.09-49.19s17.75-34.56 47.32-40.21 55.99-20.4 59.77 19.74ZM312 150.83c-8.81 58.62 7.33 90.67 52.9 97.41 50.66 7.49 71.52-26.44 80.33-85.06 11.86-78.89-16-128.22-55.7-131.1-36.4-2.64-68.71 60.13-77.53 118.75ZM288.35 313.53c-3.13 33.27 14.86 64.34 42 69.66 27.4 5.36 58.71-16.37 65.09-49.19s-17.75-34.56-47.32-40.22-55.99-20.4-59.77 19.75Z"
          stroke={color}
          strokeMiterlimit={10}
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'analyticsOutline') {
    const points = [
      [456, 168],
      [320, 304],
      [208, 192],
      [56, 344],
    ] as const;

    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Line
          x1="344"
          y1="280"
          x2="432"
          y2="192"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="232"
          y1="216"
          x2="296"
          y2="280"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="80"
          y1="320"
          x2="184"
          y2="216"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        {points.map(([cx, cy]) => (
          <Circle
            cx={cx}
            cy={cy}
            key={`${cx}-${cy}`}
            r="24"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={32}
          />
        ))}
      </Svg>
    );
  }

  if (name === 'calendarOutline') {
    const dots = [
      [296, 232],
      [376, 232],
      [296, 312],
      [376, 312],
      [136, 312],
      [216, 312],
      [136, 392],
      [216, 392],
      [296, 392],
    ] as const;

    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Rect
          x="48"
          y="80"
          width="416"
          height="384"
          rx="48"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
        {dots.map(([cx, cy]) => (
          <Circle cx={cx} cy={cy} fill={color} key={`${cx}-${cy}`} r="24" />
        ))}
        <Line
          x1="128"
          y1="48"
          x2="128"
          y2="80"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="384"
          y1="48"
          x2="384"
          y2="80"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Line
          x1="464"
          y1="160"
          x2="48"
          y2="160"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'clipboardOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Path
          d="M336 64h32a48 48 0 0 1 48 48v320a48 48 0 0 1-48 48H144a48 48 0 0 1-48-48V112a48 48 0 0 1 48-48h32"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Rect
          x="176"
          y="32"
          width="160"
          height="64"
          rx="26.13"
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'trendingUpOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
        <Polyline
          points="352 144 464 144 464 256"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
        <Path
          d="m48 368 121.37-121.37a32 32 0 0 1 45.26 0l50.74 50.74a32 32 0 0 0 45.26 0L448 160"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        />
      </Svg>
    );
  }

  if (name === 'lightbulbOutline') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7M9 21v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1m3-17a5 5 0 0 0-5 5c0 2.05 1.23 3.81 3 4.58V16h4v-2.42c1.77-.77 3-2.53 3-4.58a5 5 0 0 0-5-5Z"
          fill={color}
        />
      </Svg>
    );
  }

  if (name === 'calendar') {
    return (
      <Svg width={size} height={size} viewBox="0 0 512 512">
        <Path
          d="M480 128a64 64 0 0 0-64-64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4Z"
          fill={color}
        />
        <Path
          d="M32 416a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V179a3 3 0 0 0-3-3H35a3 3 0 0 0-3 3Zm344-208a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm0 80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm-80-80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm0 80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm0 80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm-80-80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm0 80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm-80-80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Zm0 80a24 24 0 1 1-24 24 24 24 0 0 1 24-24Z"
          fill={color}
        />
      </Svg>
    );
  }

  const filledPath: Partial<Record<OriginalAppIconName, string>> = {
    barbell:
      'M467 176a29.94 29.94 0 0 0-25.32 12.5 2 2 0 0 1-3.64-1.14v-36.65c0-20.75-16.34-38.21-37.08-38.7A38 38 0 0 0 362 150v82a2 2 0 0 1-2 2H152a2 2 0 0 1-2-2v-81.29c0-20.75-16.34-38.21-37.08-38.7A38 38 0 0 0 74 150v37.38a2 2 0 0 1-3.64 1.14A29.94 29.94 0 0 0 45 176c-16.3.51-29 14.31-29 30.62v98.72c0 16.31 12.74 30.11 29 30.62a29.94 29.94 0 0 0 25.32-12.5A2 2 0 0 1 74 324.62v36.67C74 382 90.34 399.5 111.08 400A38 38 0 0 0 150 362v-82a2 2 0 0 1 2-2h208a2 2 0 0 1 2 2v81.29c0 20.75 16.34 38.21 37.08 38.7A38 38 0 0 0 438 362v-37.38a2 2 0 0 1 3.64-1.14A29.94 29.94 0 0 0 467 336c16.3-.51 29-14.31 29-30.62v-98.74C496 190.33 483.26 176.53 467 176Z',
    body: 'M437 128H75a27 27 0 0 0 0 54h101.88c6.91 0 15 3.09 19.58 15 5.35 13.83 2.73 40.54-.57 61.23l-4.32 24.45a.42.42 0 0 1-.12.35l-34.6 196.81A27.43 27.43 0 0 0 179 511.58a27.06 27.06 0 0 0 31.42-22.29l23.91-136.8S242 320 256 320c14.23 0 21.74 32.49 21.74 32.49l23.91 136.92a27.24 27.24 0 1 0 53.62-9.6L320.66 283a.45.45 0 0 0-.11-.35l-4.33-24.45c-3.3-20.69-5.92-47.4-.57-61.23 4.56-11.88 12.91-15 19.28-15H437a27 27 0 0 0 0-54Z',
    heart:
      'M256 448a32 32 0 0 1-18-5.57c-78.59-53.35-112.62-89.93-131.39-112.8-40-48.75-59.15-98.8-58.61-153C48.63 114.52 98.46 64 159.08 64c44.08 0 74.61 24.83 92.39 45.51a6 6 0 0 0 9.06 0C278.31 88.81 308.84 64 352.92 64 413.54 64 463.37 114.52 464 176.64c.54 54.21-18.63 104.26-58.61 153-18.77 22.87-52.8 59.45-131.39 112.8A32 32 0 0 1 256 448Z',
    pulse:
      'M432 272a48.09 48.09 0 0 0-45.25 32h-39.22l-28.35-85.06a16 16 0 0 0-30.56.66l-44.51 155.76-52.33-314a16 16 0 0 0-31.3-1.25L99.51 304H48a16 16 0 0 0 0 32h64a16 16 0 0 0 15.52-12.12l45.34-181.37 51.36 308.12A16 16 0 0 0 239.1 464c.3 0 .6 0 .91 0a16 16 0 0 0 15.37-11.6l49.8-174.28 15.64 46.94A16 16 0 0 0 336 336h50.75A48 48 0 1 0 432 272Z',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      {name === 'body' ? <Circle cx="256" cy="56" r="56" fill={color} /> : null}
      <Path d={filledPath[name] ?? ''} fill={color} />
    </Svg>
  );
}

export function TimeIcon({
  size = 21,
  active = false,
}: { size?: number; active?: boolean }) {
  const fill = active ? '#FF6A33' : '#B0B8C1';
  return (
    <Svg width={size} height={size} viewBox="0 0 21 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5 10.261C11.5 10.294 11.484 10.323 11.481 10.355C11.4754 10.4227 11.4616 10.4895 11.44 10.554C11.4038 10.6736 11.3447 10.785 11.266 10.882C11.222 10.935 11.176 10.982 11.122 11.026C11.097 11.046 11.082 11.075 11.055 11.093L6.329 14.243C6.10832 14.3846 5.84086 14.4338 5.58423 14.3801C5.3276 14.3264 5.10233 14.1741 4.95692 13.9559C4.81152 13.7377 4.75761 13.4712 4.80682 13.2136C4.85602 12.9561 5.0044 12.7282 5.22 12.579L9.5 9.726V5.056C9.5 4.79078 9.60536 4.53643 9.79289 4.34889C9.98043 4.16136 10.2348 4.056 10.5 4.056C10.7652 4.056 11.0196 4.16136 11.2071 4.34889C11.3946 4.53643 11.5 4.79078 11.5 5.056V10.261ZM10.5 0C4.701 0 0 4.701 0 10.5C0 16.299 4.701 21 10.5 21C16.299 21 21 16.299 21 10.5C21 4.701 16.299 0 10.5 0Z"
        fill={fill}
      />
    </Svg>
  );
}

export function AIInfoIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.3 6.96667L8.96667 7.4C8.23333 7.63333 7.7 8.2 7.46667 8.9L6.96667 10.3C6.83333 10.6 6.46667 10.6 6.43333 10.3L6 8.96667C5.76667 8.23333 5.2 7.7 4.5 7.46667L3.03333 6.96667C2.73333 6.83333 2.73333 6.46667 3.03333 6.43333L4.36667 6C5.1 5.76667 5.63333 5.2 5.86667 4.5L6.36667 3.03333C6.5 2.73333 6.86667 2.73333 6.9 3.03333L7.33333 4.36667C7.56667 5.1 8.13333 5.63333 8.83333 5.86667L10.1667 6.3C10.6 6.5 10.6 6.83333 10.3 6.96667ZM6.66667 0C2.96667 0 0 2.96667 0 6.66667C0 10.3667 2.96667 13.3333 6.66667 13.3333C10.3667 13.3333 13.3333 10.3667 13.3333 6.66667C13.3333 2.96667 10.3667 0 6.66667 0Z"
        fill="#FB8800"
      />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM17.68 10.05L11.59 16.14C11.39 16.34 11.11 16.46 10.82 16.46C10.53 16.46 10.25 16.34 10.05 16.14L6.32 12.41C5.89 11.98 5.89 11.29 6.32 10.87C6.75 10.44 7.44 10.44 7.86 10.87L10.82 13.83L16.14 8.51C16.57 8.08 17.26 8.08 17.68 8.51C18.11 8.94 18.11 9.63 17.68 10.05Z"
        fill="#FF6A33"
      />
    </Svg>
  );
}

export function FireIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#FFDACC" />
      <Path
        d="M17.3325 7.99932C17.4819 9.07465 17.3665 9.81998 16.5465 9.81998C15.3539 9.81998 15.3539 7.23532 13.3399 5.82265C11.3265 4.34332 9.90985 4.67932 9.83452 4.74732C11.4752 6.02532 10.5805 8.07198 9.46185 8.60998C8.41785 9.14798 7.21185 8.42465 7.80852 6.81132C6.23452 8.17532 5.33252 9.81798 5.33252 12.0006C5.33252 15.6713 8.34319 18.6673 11.9972 18.6673C15.9992 18.6673 18.6659 15.334 18.6659 12.0006C18.6659 10.6673 18.3139 9.33398 17.3332 7.99998L17.3325 7.99932ZM11.9972 17.9553C10.5179 17.9553 9.37452 16.812 9.37452 15.3326C9.37452 13.1813 11.9972 11.702 11.9972 11.702C11.9972 11.702 14.6199 13.1813 14.6199 15.3326C14.6199 16.744 13.4765 17.9553 11.9972 17.9553Z"
        fill="#FF6A33"
      />
      <Path
        opacity={0.5}
        d="M11.9557 12C11.9557 12 9.33301 13.4793 9.33301 15.6307C9.33301 17.11 10.4763 18.2533 11.9557 18.2533C13.435 18.2533 14.5783 17.0433 14.5783 15.6307C14.5783 13.4793 11.9557 12 11.9557 12Z"
        fill="#FF6A33"
      />
    </Svg>
  );
}

export function ChatIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M6.72467 0C3.01 0 0 2.754 0 6.084C0 7.68533 0.704666 9.158 1.85733 10.2467L1.28067 12.9367C1.21667 13.1927 1.47267 13.3847 1.72867 13.3207L4.73867 11.912C5.37933 12.104 6.01933 12.168 6.724 12.168C10.4387 12.168 13.4487 9.414 13.4487 6.084C13.4487 2.754 10.4393 0 6.72467 0Z"
        fill="#B0B7C0"
      />
    </Svg>
  );
}

const ICON_SIZE = 24;

export function HomeTabIcon({
  color = '#B8C1CC',
  size = ICON_SIZE,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 21" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.894 6.93454L10.447 0.217539C10.2703 0.0766956 10.051 0 9.825 0C9.59902 0 9.37972 0.0766956 9.203 0.217539L0.755 6.93454C0.519551 7.12182 0.329384 7.3598 0.198664 7.63076C0.067943 7.90173 3.6043e-05 8.19869 0 8.49954V17.9175C0 18.5541 0.252856 19.1645 0.702944 19.6146C1.15303 20.0647 1.76348 20.3175 2.4 20.3175H7.825V15.5655C7.825 15.3003 7.93036 15.046 8.11789 14.8584C8.30543 14.6709 8.55978 14.5655 8.825 14.5655H10.825C11.0902 14.5655 11.3446 14.6709 11.5321 14.8584C11.7196 15.046 11.825 15.3003 11.825 15.5655V20.3175H17.249C17.8855 20.3175 18.496 20.0647 18.9461 19.6146C19.3961 19.1645 19.649 18.5541 19.649 17.9175V8.50054C19.649 8.19969 19.5811 7.90273 19.4503 7.63176C19.3196 7.3608 19.1294 7.12182 18.894 6.93454Z"
        fill={color}
      />
    </Svg>
  );
}

export function HistoryTabIcon({
  color = '#B8C1CC',
  size = ICON_SIZE,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 19" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.702 5.50982L7.71 2.87282C7.531 2.71505 7.3006 2.628 7.062 2.628C6.8234 2.628 6.593 2.71505 6.414 2.87282L0.332 8.23282C0.227683 8.32476 0.144128 8.43786 0.0868862 8.56458C0.0296442 8.69131 2.61572e-05 8.82876 0 8.96782V16.4498C0 16.9696 0.206499 17.4682 0.574071 17.8357C0.941642 18.2033 1.44018 18.4098 1.96 18.4098H17.64C18.1598 18.4098 18.6584 18.2033 19.0259 17.8357C19.3935 17.4682 19.6 16.9696 19.6 16.4498V0.979816C19.6 0.791257 19.5455 0.606712 19.4432 0.448316C19.3409 0.28992 19.1951 0.164399 19.0233 0.0868108C18.8514 0.00922218 18.6608 -0.0171401 18.4743 0.010886C18.2879 0.038912 18.1135 0.120136 17.972 0.244816L11.998 5.50982C11.819 5.66758 11.5886 5.75463 11.35 5.75463C11.1114 5.75463 10.881 5.66758 10.702 5.50982Z"
        fill={color}
      />
    </Svg>
  );
}

export function PTTabIcon({ color = '#B8C1CC', size = ICON_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.166 12.0589C11.359 12.2859 10.266 13.1479 9.54797 13.6699C9.24797 13.8879 8.83297 13.6539 8.88497 13.2869L9.46997 9.44391C9.49497 9.28291 9.61597 9.15391 9.77697 9.12891C10.23 9.05891 11.177 8.81291 11.907 7.96291C12.307 7.49791 12.527 6.90491 12.617 6.29791C12.693 5.78491 12.705 5.18491 12.524 4.70691C12.221 3.69291 10.714 2.67091 8.98296 3.10291C7.82896 3.44591 7.01497 4.25991 6.47597 6.15491L3.83897 17.3399C3.59097 18.4009 4.00597 19.5059 4.88997 20.1419L4.90797 20.1559C5.29197 20.4339 5.73997 20.6099 6.21397 20.6669C8.74297 20.9659 17.947 21.7239 20.559 19.0819C22.2 17.4199 19.114 11.6239 13.166 12.0589Z"
        fill={color}
      />
    </Svg>
  );
}

export function AITabIcon({ color = '#B8C1CC', size = ICON_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.746 12.501L10.842 18.771C10.344 19.299 9.465 18.844 9.609 18.132L10.504 13.712L7.541 12.677C7.42735 12.6374 7.32541 12.57 7.24449 12.4809C7.16356 12.3919 7.10622 12.284 7.07768 12.1671C7.04915 12.0501 7.05034 11.9279 7.08113 11.8116C7.11193 11.6953 7.17136 11.5885 7.254 11.501L13.157 5.23C13.655 4.702 14.534 5.157 14.391 5.869L13.495 10.29L16.458 11.324C16.5717 11.3636 16.6738 11.431 16.7548 11.5202C16.8358 11.6093 16.8932 11.7172 16.9219 11.8342C16.9505 11.9512 16.9494 12.0735 16.9187 12.19C16.888 12.3064 16.8286 12.4133 16.746 12.501ZM12 1C5.925 1 1 5.925 1 12C1 18.075 5.925 23 12 23C18.075 23 23 18.075 23 12C23 5.925 18.075 1 12 1Z"
        fill={color}
      />
    </Svg>
  );
}

export function MyTabIcon({ color = '#B8C1CC', size = ICON_SIZE }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.8881 6.64412C16.8881 7.94249 16.3724 9.18768 15.4543 10.1058C14.5362 11.0238 13.291 11.5396 11.9926 11.5396C10.6943 11.5396 9.44909 11.0238 8.53101 10.1058C7.61292 9.18768 7.09715 7.94249 7.09715 6.64412C7.08399 5.99297 7.20087 5.34574 7.44095 4.74033C7.68104 4.13492 8.0395 3.58349 8.49535 3.11834C8.95119 2.65318 9.49526 2.28365 10.0957 2.03138C10.6961 1.77911 11.3409 1.64917 11.9921 1.64917C12.6434 1.64917 13.2882 1.77911 13.8886 2.03138C14.489 2.28365 15.0331 2.65318 15.489 3.11834C15.9448 3.58349 16.3033 4.13492 16.5433 4.74033C16.7834 5.34574 16.9003 5.99297 16.8871 6.64412M11.9921 13.0371C4.94315 13.0371 2.20215 17.5231 2.20215 19.6101C2.20215 21.6961 8.03815 22.2521 11.9921 22.2521C15.9461 22.2521 21.7831 21.6961 21.7831 19.6101C21.7831 17.5231 19.0411 13.0371 11.9931 13.0371"
        fill={color}
      />
    </Svg>
  );
}
