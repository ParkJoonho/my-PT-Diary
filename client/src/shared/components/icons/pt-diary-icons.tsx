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
  | 'accessibilityOutline'
  | 'analyticsOutline'
  | 'barbell'
  | 'barbellOutline'
  | 'body'
  | 'bodyOutline'
  | 'calendar'
  | 'calendarOutline'
  | 'cafeOutline'
  | 'chatbubbleEllipsesOutline'
  | 'checkmarkCircle'
  | 'close'
  | 'clipboardOutline'
  | 'documentText'
  | 'fitnessOutline'
  | 'footstepsOutline'
  | 'heart'
  | 'heartOutline'
  | 'lightbulbOutline'
  | 'logOutOutline'
  | 'mic'
  | 'person'
  | 'pulse'
  | 'refresh'
  | 'restaurantOutline'
  | 'searchOutline'
  | 'timeOutline'
  | 'trendingUpOutline'
  | 'videocam'
  | 'volumeHigh'
  | 'walk'
  | 'walkOutline';

type SemanticIconProps = IconProps & {
  name: SemanticIconName;
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

  const filledPath = {
    barbell:
      'M467 176a29.94 29.94 0 0 0-25.32 12.5 2 2 0 0 1-3.64-1.14v-36.65c0-20.75-16.34-38.21-37.08-38.7A38 38 0 0 0 362 150v82a2 2 0 0 1-2 2H152a2 2 0 0 1-2-2v-81.29c0-20.75-16.34-38.21-37.08-38.7A38 38 0 0 0 74 150v37.38a2 2 0 0 1-3.64 1.14A29.94 29.94 0 0 0 45 176c-16.3.51-29 14.31-29 30.62v98.72c0 16.31 12.74 30.11 29 30.62a29.94 29.94 0 0 0 25.32-12.5A2 2 0 0 1 74 324.62v36.67C74 382 90.34 399.5 111.08 400A38 38 0 0 0 150 362v-82a2 2 0 0 1 2-2h208a2 2 0 0 1 2 2v81.29c0 20.75 16.34 38.21 37.08 38.7A38 38 0 0 0 438 362v-37.38a2 2 0 0 1 3.64-1.14A29.94 29.94 0 0 0 467 336c16.3-.51 29-14.31 29-30.62v-98.74C496 190.33 483.26 176.53 467 176Z',
    body: 'M437 128H75a27 27 0 0 0 0 54h101.88c6.91 0 15 3.09 19.58 15 5.35 13.83 2.73 40.54-.57 61.23l-4.32 24.45a.42.42 0 0 1-.12.35l-34.6 196.81A27.43 27.43 0 0 0 179 511.58a27.06 27.06 0 0 0 31.42-22.29l23.91-136.8S242 320 256 320c14.23 0 21.74 32.49 21.74 32.49l23.91 136.92a27.24 27.24 0 1 0 53.62-9.6L320.66 283a.45.45 0 0 0-.11-.35l-4.33-24.45c-3.3-20.69-5.92-47.4-.57-61.23 4.56-11.88 12.91-15 19.28-15H437a27 27 0 0 0 0-54Z',
    heart:
      'M256 448a32 32 0 0 1-18-5.57c-78.59-53.35-112.62-89.93-131.39-112.8-40-48.75-59.15-98.8-58.61-153C48.63 114.52 98.46 64 159.08 64c44.08 0 74.61 24.83 92.39 45.51a6 6 0 0 0 9.06 0C278.31 88.81 308.84 64 352.92 64 413.54 64 463.37 114.52 464 176.64c.54 54.21-18.63 104.26-58.61 153-18.77 22.87-52.8 59.45-131.39 112.8A32 32 0 0 1 256 448Z',
    pulse:
      'M432 272a48.09 48.09 0 0 0-45.25 32h-39.22l-28.35-85.06a16 16 0 0 0-30.56.66l-44.51 155.76-52.33-314a16 16 0 0 0-31.3-1.25L99.51 304H48a16 16 0 0 0 0 32h64a16 16 0 0 0 15.52-12.12l45.34-181.37 51.36 308.12A16 16 0 0 0 239.1 464c.3 0 .6 0 .91 0a16 16 0 0 0 15.37-11.6l49.8-174.28 15.64 46.94A16 16 0 0 0 336 336h50.75A48 48 0 1 0 432 272Z',
  }[name];

  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      {name === 'body' ? <Circle cx="256" cy="56" r="56" fill={color} /> : null}
      <Path d={filledPath} fill={color} />
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
