import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  /** 0–100 */
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
}

export function ProgressRing({
  progress,
  color,
  size = 56,
  strokeWidth = 5,
  trackColor = 'rgba(255,255,255,0.13)',
}: ProgressRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      {/* Background track */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Filled arc */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
}
