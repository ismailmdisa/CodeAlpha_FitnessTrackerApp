import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Sun, Dumbbell, Plus, BarChart3, User } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export type TabType = 'home' | 'workouts' | 'progress' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onPressAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onPressAdd,
}) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {/* Tab 1: Today */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onSelectTab('home')}
        >
          <View
            style={[
              styles.iconGlow,
              currentTab === 'home' && styles.iconGlowActive,
            ]}
          >
            <Sun
              size={19}
              color={currentTab === 'home' ? COLORS.text : COLORS.textMuted}
              strokeWidth={currentTab === 'home' ? 2.5 : 2}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'home' && styles.tabLabelActive,
            ]}
          >
            Today
          </Text>
          <View
            style={[
              styles.indicatorDot,
              currentTab === 'home' && styles.indicatorDotActive,
            ]}
          />
        </TouchableOpacity>

        {/* Tab 2: Workouts */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onSelectTab('workouts')}
        >
          <View
            style={[
              styles.iconGlow,
              currentTab === 'workouts' && styles.iconGlowActive,
            ]}
          >
            <Dumbbell
              size={19}
              color={currentTab === 'workouts' ? COLORS.text : COLORS.textMuted}
              strokeWidth={currentTab === 'workouts' ? 2.5 : 2}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'workouts' && styles.tabLabelActive,
            ]}
          >
            Workouts
          </Text>
          <View
            style={[
              styles.indicatorDot,
              currentTab === 'workouts' && styles.indicatorDotActive,
            ]}
          />
        </TouchableOpacity>

        {/* Center Raised Action Button: + Add Log */}
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity
            style={styles.centerButton}
            activeOpacity={0.85}
            onPress={onPressAdd}
          >
            <Plus size={24} color={COLORS.text} strokeWidth={3} />
          </TouchableOpacity>
        </View>

        {/* Tab 3: Analytics */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onSelectTab('progress')}
        >
          <View
            style={[
              styles.iconGlow,
              currentTab === 'progress' && styles.iconGlowActive,
            ]}
          >
            <BarChart3
              size={19}
              color={currentTab === 'progress' ? COLORS.text : COLORS.textMuted}
              strokeWidth={currentTab === 'progress' ? 2.5 : 2}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'progress' && styles.tabLabelActive,
            ]}
          >
            Analytics
          </Text>
          <View
            style={[
              styles.indicatorDot,
              currentTab === 'progress' && styles.indicatorDotActive,
            ]}
          />
        </TouchableOpacity>

        {/* Tab 4: Profile */}
        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.7}
          onPress={() => onSelectTab('profile')}
        >
          <View
            style={[
              styles.iconGlow,
              currentTab === 'profile' && styles.iconGlowActive,
            ]}
          >
            <User
              size={19}
              color={currentTab === 'profile' ? COLORS.text : COLORS.textMuted}
              strokeWidth={currentTab === 'profile' ? 2.5 : 2}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              currentTab === 'profile' && styles.tabLabelActive,
            ]}
          >
            Profile
          </Text>
          <View
            style={[
              styles.indicatorDot,
              currentTab === 'profile' && styles.indicatorDotActive,
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fafaf3',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    shadowColor: '#384128',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 100,
  },
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    minHeight: 44,
  },
  iconGlow: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconGlowActive: {
    backgroundColor: COLORS.primaryContainer,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  tabLabelActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginTop: 2,
  },
  indicatorDotActive: {
    backgroundColor: COLORS.primaryContainer,
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -6,
  },
  centerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
