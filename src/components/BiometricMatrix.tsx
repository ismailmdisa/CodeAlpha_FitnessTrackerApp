import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Moon, Activity, TrendingDown, TrendingUp, CheckCircle } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export const BiometricMatrix: React.FC = () => {
  return (
    <View style={styles.grid}>
      {/* Card 1: Rest HR */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>REST HR</Text>
          <Heart size={15} color={COLORS.secondary} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.valueRow}>
            <Text style={styles.valueText}>48</Text>
            <Text style={styles.unitText}>bpm</Text>
          </View>
          <View style={styles.trendRow}>
            <TrendingDown size={13} color={COLORS.primary} />
            <Text style={styles.trendText}>-2 vs avg</Text>
          </View>
        </View>
      </View>

      {/* Card 2: Sleep */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>SLEEP</Text>
          <Moon size={15} color={COLORS.secondary} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.valueRow}>
            <Text style={styles.valueText}>8h 15</Text>
            <Text style={styles.unitText}>m</Text>
          </View>
          <View style={styles.trendRow}>
            <CheckCircle size={13} color={COLORS.primary} />
            <Text style={styles.trendText}>92% Rest</Text>
          </View>
        </View>
      </View>

      {/* Card 3: HRV */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>HRV</Text>
          <Activity size={15} color={COLORS.secondary} />
        </View>
        <View style={styles.cardBody}>
          <View style={styles.valueRow}>
            <Text style={styles.valueText}>74</Text>
            <Text style={styles.unitText}>ms</Text>
          </View>
          <View style={styles.trendRow}>
            <TrendingUp size={13} color={COLORS.primary} />
            <Text style={styles.trendText}>+6 Prime</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
    fontSize: 19,
    fontWeight: '800',
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
