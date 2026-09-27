import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Check, Footprints, Flame, Clock } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';

interface EditGoalsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditGoalsModal: React.FC<EditGoalsModalProps> = ({ visible, onClose }) => {
  const { goals, saveGoals } = useFitness();

  const [stepTarget, setStepTarget] = useState<string>(String(goals.step_target));
  const [calorieTarget, setCalorieTarget] = useState<string>(String(goals.calorie_target));
  const [activeMinutesTarget, setActiveMinutesTarget] = useState<string>(
    String(goals.active_minutes_target)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStepTarget(String(goals.step_target));
      setCalorieTarget(String(goals.calorie_target));
      setActiveMinutesTarget(String(goals.active_minutes_target));
      setErrorMsg(null);
    }
  }, [visible, goals]);

  const handleSave = async () => {
    const s = Number(stepTarget);
    const c = Number(calorieTarget);
    const m = Number(activeMinutesTarget);

    if (isNaN(s) || s < 100) {
      setErrorMsg('Step goal must be at least 100 steps');
      return;
    }
    if (isNaN(c) || c < 50) {
      setErrorMsg('Calorie goal must be at least 50 kcal');
      return;
    }
    if (isNaN(m) || m < 5) {
      setErrorMsg('Active minutes goal must be at least 5 min');
      return;
    }

    try {
      await saveGoals({
        step_target: s,
        calorie_target: c,
        active_minutes_target: m,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update goals in database');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Edit Daily Goals</Text>
              <Text style={styles.subtitle}>Saved directly to SQLite goals table</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          {/* Step Target Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Footprints size={16} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Daily Steps Target</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={stepTarget}
              onChangeText={(val) => setStepTarget(val.replace(/[^0-9]/g, ''))}
              placeholder="10000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            {/* Quick Step Presets */}
            <View style={styles.presetRow}>
              {[8000, 10000, 12000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.presetChip,
                    Number(stepTarget) === val && styles.presetChipActive,
                  ]}
                  onPress={() => setStepTarget(String(val))}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      Number(stepTarget) === val && styles.presetChipTextActive,
                    ]}
                  >
                    {val.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Calorie Target Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Flame size={16} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Daily Calorie Burn Target (kcal)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={calorieTarget}
              onChangeText={(val) => setCalorieTarget(val.replace(/[^0-9]/g, ''))}
              placeholder="600"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            {/* Quick Calorie Presets */}
            <View style={styles.presetRow}>
              {[500, 600, 800].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.presetChip,
                    Number(calorieTarget) === val && styles.presetChipActive,
                  ]}
                  onPress={() => setCalorieTarget(String(val))}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      Number(calorieTarget) === val && styles.presetChipTextActive,
                    ]}
                  >
                    {val} kcal
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Active Minutes Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.inputLabel}>Daily Active Minutes Target</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={activeMinutesTarget}
              onChangeText={(val) => setActiveMinutesTarget(val.replace(/[^0-9]/g, ''))}
              placeholder="45"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={handleSave}>
            <Check size={20} color={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>Update Goals</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  textInput: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    paddingVertical: 4,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceHighlight,
  },
  presetChipActive: {
    backgroundColor: 'rgba(255, 42, 54, 0.2)',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  presetChipTextActive: {
    color: COLORS.primary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
});
