import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Bell, Zap } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';

interface HeaderProps {
  onPressProfile?: () => void;
  onPressNotification?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onPressProfile, onPressNotification }) => {
  const { userProfile } = useFitness();

  return (
    <View style={styles.header}>
      {/* Brand Title: KINETIC Today */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Zap size={15} color="#121310" strokeWidth={2.8} />
        </View>
        <View style={styles.brandCol}>
          <Text style={styles.brandText}>KINETIC</Text>
          <Text style={styles.subBrandText}>Daily Performance</Text>
        </View>
      </View>

      {/* Right Actions: Notifications & Avatar */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          aria-label="Notifications"
          style={styles.notifButton}
          activeOpacity={0.7}
          onPress={onPressNotification}
        >
          <Bell size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.avatarButton}
          onPress={onPressProfile}
        >
          <Image
            source={{
              uri: userProfile?.avatarUri || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
            }}
            style={styles.avatarImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(200, 224, 30, 0.4)',
  },
  brandCol: {
    flexDirection: 'column',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
    lineHeight: 19,
  },
  subBrandText: {
    fontSize: 8.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: COLORS.textMuted,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'rgba(200, 224, 30, 0.6)',
    overflow: 'hidden',
    marginLeft: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
});
