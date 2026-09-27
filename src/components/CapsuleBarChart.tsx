import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DayChartPoint } from '../types';
import { COLORS } from '../theme/colors';

interface CapsuleBarChartProps {
  data: DayChartPoint[];
  metric: 'calories' | 'steps';
  goal?: number;
}

export const CapsuleBarChart: React.FC<CapsuleBarChartProps> = ({
  data,
  metric = 'calories',
  goal = 600,
}) => {
  // Determine max value for proportional scaling
  const values = data.map((d) => (metric === 'calories' ? d.calories : d.steps));
  const maxValue = Math.max(...values, goal, 1);

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {data.map((item, index) => {
          const val = metric === 'calories' ? item.calories : item.steps;
          const ratio = Math.min(Math.max(val / maxValue, 0), 1);
          const isHighest = val > 0 && val === Math.max(...values);
          const hasData = val > 0;

          return (
            <View key={`${item.date}-${index}`} style={styles.column}>
              {/* Vertical Capsule Pill Track */}
              <View style={styles.capsuleTrack}>
                <View
                  style={[
                    styles.capsuleFill,
                    {
                      height: `${Math.max(ratio * 100, hasData ? 12 : 6)}%`,
                      backgroundColor: isHighest
                        ? COLORS.primary
                        : hasData
                        ? COLORS.primaryDark
                        : COLORS.surfaceHighlight,
                    },
                  ]}
                />
              </View>

              {/* Day Label below */}
              <Text
                style={[
                  styles.dayLabel,
                  isHighest && styles.dayLabelActive,
                  !hasData && styles.dayLabelInactive,
                ]}
              >
                {item.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    width: '100%',
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 8,
  },
  column: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  capsuleTrack: {
    width: 20,
    height: 105,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capsuleFill: {
    width: '100%',
    borderRadius: 10,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  dayLabelActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  dayLabelInactive: {
    color: COLORS.textMuted,
  },
});
