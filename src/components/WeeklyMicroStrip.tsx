import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Sun } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { WeekDayCheckmark } from '../types';

interface WeeklyMicroStripProps {
  weekGrid: WeekDayCheckmark[];
  onPressDay?: (item: WeekDayCheckmark) => void;
}

export const WeeklyMicroStrip: React.FC<WeeklyMicroStripProps> = ({
  weekGrid,
  onPressDay,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {weekGrid.map((item, index) => {
          const isToday = item.isToday;
          const isChecked = item.checked;

          return (
            <TouchableOpacity
              key={`${item.date}-${index}`}
              style={[
                styles.dayColumn,
                isToday && styles.todayColumn,
              ]}
              activeOpacity={0.7}
              onPress={() => onPressDay && onPressDay(item)}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.todayLabel,
                ]}
              >
                {item.day}
              </Text>

              {/* Status Circle */}
              {isToday ? (
                // Solar Chartreuse Halo
                <View style={styles.todayCircle}>
                  <Sun size={15} color={COLORS.text} strokeWidth={2.5} />
                </View>
              ) : isChecked ? (
                // Completed Checkmark
                <View style={styles.checkedCircle}>
                  <Check size={14} color={COLORS.textSecondary} strokeWidth={2.5} />
                </View>
              ) : (
                // Empty dot
                <View style={styles.emptyCircle}>
                  <Text style={styles.dotText}>•</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 14,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    borderRadius: 10,
  },
  todayColumn: {
    backgroundColor: COLORS.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  todayLabel: {
    color: COLORS.text,
    fontWeight: '800',
  },
  checkedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceHighest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 14,
  },
});
