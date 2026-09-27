import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Footprints, TrendingUp } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface StepsCardProps {
  currentSteps: number;
  stepGoal: number;
}

export const StepsCard: React.FC<StepsCardProps> = ({ currentSteps, stepGoal }) => {
  const safeGoal = Math.max(stepGoal, 1);
  const percentage = Math.min(Math.round((currentSteps / safeGoal) * 100), 100);
  const targetRatio = Math.min(Math.max(currentSteps / safeGoal, 0), 1);

  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: targetRatio,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [targetRatio]);

  const widthInterpolation = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconContainer}>
            <Footprints size={18} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>STEPS TODAY</Text>
        </View>
        <View style={styles.percentBadge}>
          <TrendingUp size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.percentText}>{percentage}%</Text>
        </View>
      </View>

      <View style={styles.numbersRow}>
        <Text style={styles.currentSteps}>{currentSteps.toLocaleString()}</Text>
        <Text style={styles.goalText}>/ {safeGoal.toLocaleString()} steps</Text>
      </View>

      {/* Smooth Animated Horizontal Progress Bar */}
      <View style={styles.progressBarTrack}>
        <Animated.View style={[styles.progressBarFill, { width: widthInterpolation }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 42, 54, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 42, 54, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  numbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  currentSteps: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});
