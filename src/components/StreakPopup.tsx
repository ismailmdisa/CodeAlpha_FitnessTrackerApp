import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AppModal } from './AppModal';
import { Flame, Check, ChevronRight } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';

interface StreakPopupProps {
  visible: boolean;
  onClose: () => void;
  streakCount?: number;
}

export const StreakPopup: React.FC<StreakPopupProps> = ({
  visible,
  onClose,
  streakCount,
}) => {
  const { streakInfo } = useFitness();
  const displayStreak = streakCount !== undefined ? streakCount : streakInfo.currentStreak;

  return (
    <AppModal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          {/* Subtle Red Ambient Glow behind Flame */}
          <View style={styles.glowCircle} />

          {/* Flame Icon */}
          <View style={styles.flameContainer}>
            <Flame size={54} color={COLORS.primary} fill={COLORS.primary} />
          </View>

          {/* Big Bold Streak Number */}
          <Text style={styles.streakNumber}>{displayStreak}</Text>
          <Text style={styles.newStreakText}>
            {displayStreak > 1 ? 'Days Streak' : 'New Streak'}
          </Text>

          {/* Motivational Subtext */}
          <Text style={styles.motivationalText}>
            "Your focus streak is growing — and so is your discipline. Every session you complete is a step closer to your goals."
          </Text>

          {/* Week Checklist Capsule Box (Image 2 style) */}
          <View style={styles.weekCard}>
            <View style={styles.weekDaysRow}>
              {streakInfo.weekGrid.map((item, idx) => (
                <View key={`popup-${item.date}-${idx}`} style={styles.dayCol}>
                  <Text style={[styles.dayLabel, item.isToday && styles.dayLabelToday]}>
                    {item.day}
                  </Text>
                  <View
                    style={[
                      styles.checkCircle,
                      item.checked && styles.checkCircleChecked,
                      item.isToday && !item.checked && styles.checkCircleToday,
                    ]}
                  >
                    {item.checked ? (
                      <Check size={14} color={COLORS.text} strokeWidth={3} />
                    ) : (
                      <View style={styles.emptyDot} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Exponential Growth Teaser (Image 2 Screen 1 concept) */}
          <View style={styles.compoundBox}>
            <Text style={styles.compoundTitle}>100 Straight Mornings of Winning</Text>
            <Text style={styles.compoundSubtitle}>The compound effect is real. Keep logging daily!</Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            activeOpacity={0.85}
            onPress={onClose}
          >
            <Text style={styles.continueText}>Continue</Text>
            <ChevronRight size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 54, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 42, 54, 0.15)',
  },
  flameContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 42, 54, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -1,
  },
  newStreakText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
  },
  motivationalText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  weekCard: {
    width: '100%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dayCol: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  dayLabelToday: {
    color: COLORS.primary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleChecked: {
    backgroundColor: COLORS.primary,
  },
  checkCircleToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
  },
  compoundBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 42, 54, 0.08)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  compoundTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  compoundSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  continueButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
});
