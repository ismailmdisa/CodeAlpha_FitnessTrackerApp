import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../theme/colors';

interface ProgressRingProps {
  radius?: number;
  strokeWidth?: number;
  progress: number; // 0 to 1
  color?: string;
  backgroundColor?: string;
  centerText?: string;
  centerSubtext?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  radius = 65,
  strokeWidth = 10,
  progress = 0,
  color = COLORS.primary,
  backgroundColor = COLORS.surfaceHighlight,
  centerText,
  centerSubtext,
  children,
}) => {
  const targetProgress = Math.min(Math.max(progress, 0), 1);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    // Smooth animated filling from currentProgress to targetProgress
    const startProgress = currentProgress;
    const diff = targetProgress - startProgress;
    const duration = 850; // ms
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressFraction = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progressFraction, 3);
      setCurrentProgress(startProgress + diff * ease);

      if (progressFraction < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetProgress]);

  const size = radius * 2;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - currentProgress * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Track */}
        <Circle
          stroke={backgroundColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
        />
        {/* Smooth Animated Progress Arc */}
        <Circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
      <View style={styles.content}>
        {children ? (
          children
        ) : (
          <>
            {centerText && <Text style={styles.mainText}>{centerText}</Text>}
            {centerSubtext && <Text style={styles.subText}>{centerSubtext}</Text>}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
