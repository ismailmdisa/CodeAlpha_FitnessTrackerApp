import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HeartPulse, Zap } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export const MetabolicStrainTelemetry: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerTitleGroup}>
          <View style={styles.iconCircle}>
            <HeartPulse size={15} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.subhead}>CARDIOVASCULAR INTENSITY</Text>
            <Text style={styles.title}>Metabolic Strain</Text>
          </View>
        </View>

        <View style={styles.strainScorePill}>
          <Zap size={12} color={COLORS.text} fill={COLORS.text} />
          <Text style={styles.strainScoreVal}>14.8</Text>
          <Text style={styles.strainScoreMax}>/ 21</Text>
        </View>
      </View>

      {/* Segmented Heart Rate Zone Bar */}
      <View style={styles.barWrapper}>
        <View style={[styles.barSegment, { flex: 20, backgroundColor: '#0284c7' }]} />
        <View style={[styles.barSegment, { flex: 45, backgroundColor: COLORS.primary }]} />
        <View style={[styles.barSegment, { flex: 25, backgroundColor: COLORS.primaryContainer }]} />
        <View style={[styles.barSegment, { flex: 10, backgroundColor: '#dc2626' }]} />
      </View>

      {/* Zone Legend */}
      <View style={styles.legendGrid}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0284c7' }]} />
          <Text style={styles.legendName}>Zone 1 Warmup</Text>
          <Text style={styles.legendMinutes}>22 min</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendName}>Zone 2 Aerobic</Text>
          <Text style={styles.legendMinutes}>45 min</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primaryContainer }]} />
          <Text style={styles.legendName}>Zone 4 Threshold</Text>
          <Text style={styles.legendMinutes}>20 min</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#dc2626' }]} />
          <Text style={styles.legendName}>Zone 5 Peak</Text>
          <Text style={styles.legendMinutes}>6 min</Text>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(88, 100, 0, 0.12)',
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
  strainScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  strainScoreVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.text,
  },
  strainScoreMax: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  barWrapper: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceContainer,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
    marginBottom: 12,
  },
  barSegment: {
    height: '100%',
    borderRadius: 2,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  legendMinutes: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 'auto',
  },
});
