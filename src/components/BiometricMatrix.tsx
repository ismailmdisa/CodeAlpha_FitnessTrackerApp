import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, Moon, Activity, TrendingDown, TrendingUp, CheckCircle, Edit2 } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';

export const BiometricMatrix: React.FC = () => {
  const { telemetry, setTelemetryModalVisible } = useFitness();

  return (
    <View style={styles.container}>
      {/* Section Header with Quick Edit Action */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>BIOMETRIC TELEMETRY</Text>
        <TouchableOpacity
          style={styles.editPill}
          activeOpacity={0.75}
          onPress={() => setTelemetryModalVisible(true)}
        >
          <Edit2 size={11} color={COLORS.primary} />
          <Text style={styles.editPillText}>EDIT DATA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {/* Card 1: Rest HR (BPM) */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.82}
          onPress={() => setTelemetryModalVisible(true)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>REST HR</Text>
            <Heart size={14} color="#dc2626" />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.valueRow}>
              <Text style={styles.valueText}>{telemetry.restHeartRateBpm}</Text>
              <Text style={styles.unitText}>bpm</Text>
            </View>
            <View style={styles.trendRow}>
              <TrendingDown size={12} color={COLORS.primary} />
              <Text style={styles.trendText}>Optimal</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 2: Sleep Duration & Quality */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.82}
          onPress={() => setTelemetryModalVisible(true)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>SLEEP</Text>
            <Moon size={14} color="#0284c7" />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.valueRow}>
              <Text style={styles.valueText}>
                {telemetry.sleepHours}h {telemetry.sleepMinutes}
              </Text>
              <Text style={styles.unitText}>m</Text>
            </View>
            <View style={styles.trendRow}>
              <CheckCircle size={12} color={COLORS.primary} />
              <Text style={styles.trendText}>{telemetry.sleepRestScorePct}% Rest</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 3: HRV */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.82}
          onPress={() => setTelemetryModalVisible(true)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>HRV</Text>
            <Activity size={14} color={COLORS.primary} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.valueRow}>
              <Text style={styles.valueText}>{telemetry.hrvMs}</Text>
              <Text style={styles.unitText}>ms</Text>
            </View>
            <View style={styles.trendRow}>
              <TrendingUp size={12} color={COLORS.primary} />
              <Text style={styles.trendText}>+6 Prime</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
  },
  editPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  editPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  cardBody: {},
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
