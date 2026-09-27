import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Check, Flame, Clock } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface WorkoutCompleteModalProps {
  visible: boolean;
  durationMin: number;
  caloriesBurned: number;
  onClose: () => void;
}

export const WorkoutCompleteModal: React.FC<WorkoutCompleteModalProps> = ({
  visible,
  durationMin,
  caloriesBurned,
  onClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.contentCard}>
          {/* Big Checkmark Circle (Image 3 style) */}
          <View style={styles.checkmarkCircle}>
            <Check size={44} color={COLORS.text} strokeWidth={3} />
          </View>

          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>
            Your workout session is completed successfully and saved directly to your history.
          </Text>

          {/* Stat recap card */}
          <View style={styles.recapCard}>
            <View style={styles.recapItem}>
              <Clock size={18} color={COLORS.primary} />
              <Text style={styles.recapValue}>{durationMin} min</Text>
              <Text style={styles.recapLabel}>DURATION</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.recapItem}>
              <Flame size={18} color={COLORS.primary} />
              <Text style={styles.recapValue}>{caloriesBurned} kcal</Text>
              <Text style={styles.recapLabel}>BURNED</Text>
            </View>
          </View>

          {/* Close / Return to Home Button */}
          <TouchableOpacity style={styles.closeButton} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.closeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 54, 0.3)',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  recapCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recapItem: {
    alignItems: 'center',
  },
  recapValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 2,
  },
  recapLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.border,
  },
  closeButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
});
