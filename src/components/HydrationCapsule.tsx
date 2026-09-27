import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Droplets, Plus } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';

export const HydrationCapsule: React.FC = () => {
  const { telemetry, updateTelemetry, setTelemetryModalVisible } = useFitness();
  const waterMl = telemetry.waterMl ?? 2250;
  const targetMl = telemetry.waterTargetMl ?? 3000;
  const pct = Math.min(Math.round((waterMl / targetMl) * 100), 100);

  const addWater = (amount: number) => {
    updateTelemetry({ waterMl: Math.min(waterMl + amount, 6000) });
  };

  const resetWater = () => {
    updateTelemetry({ waterMl: 0 });
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.iconCircle}>
            <Droplets size={16} color="#0284c7" />
          </View>
          <View>
            <Text style={styles.subhead}>HYDRATION EQUILIBRIUM</Text>
            <Text style={styles.title}>Water Intake</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.percentagePill}
          activeOpacity={0.8}
          onPress={() => setTelemetryModalVisible(true)}
        >
          <Text style={styles.percentageText}>{pct}% Target ⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Numerical Volume & Liquid Bar */}
      <View style={styles.volumeRow}>
        <Text style={styles.volumeVal}>
          {(waterMl / 1000).toFixed(2)}{' '}
          <Text style={styles.volumeUnit}>/ {(targetMl / 1000).toFixed(1)} L</Text>
        </Text>
        <Text style={styles.remainingText}>
          {waterMl >= targetMl ? 'Goal Surpassed 🎉' : `${targetMl - waterMl} ml remaining`}
        </Text>
      </View>

      {/* Sleek Segmented Liquid Progress Track */}
      <View style={styles.trackBackground}>
        <View style={[styles.liquidFill, { width: `${pct}%` }]} />
      </View>

      {/* Quick Increment Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.incrementBtn}
          activeOpacity={0.8}
          onPress={() => addWater(250)}
        >
          <Plus size={13} color={COLORS.text} strokeWidth={2.5} />
          <Text style={styles.incrementText}>+250 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.incrementBtn}
          activeOpacity={0.8}
          onPress={() => addWater(500)}
        >
          <Plus size={13} color={COLORS.text} strokeWidth={2.5} />
          <Text style={styles.incrementText}>+500 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.incrementBtn, styles.resetBtn]}
          activeOpacity={0.8}
          onPress={resetWater}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subhead: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  percentagePill: {
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7',
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  volumeVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  volumeUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  trackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainer,
    overflow: 'hidden',
    marginBottom: 12,
  },
  liquidFill: {
    height: '100%',
    backgroundColor: '#0284c7',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incrementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  incrementText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  resetBtn: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  resetText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
