import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { AppModal } from '../components/AppModal';
import {
  X,
  Check,
  Trash2,
  Calendar,
  Flame,
  Footprints,
  Clock,
  Sparkles,
  Dumbbell,
  Compass,
  Activity as ActivityIcon,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { ActivityEntry, ActivityType } from '../types';
import { useFitness } from '../context/FitnessContext';
import { getTodayDateString, validateActivity } from '../database/db';

interface AddEditEntryModalProps {
  visible: boolean;
  onClose: () => void;
  initialEntry?: ActivityEntry | null;
}

const ACTIVITY_TYPES: { type: ActivityType; label: string; icon: any; defaultCalPerMin: number; stepsPerMin: number }[] = [
  { type: 'running', label: 'Running', icon: ActivityIcon, defaultCalPerMin: 11.5, stepsPerMin: 140 },
  { type: 'walking', label: 'Walking', icon: Footprints, defaultCalPerMin: 4.5, stepsPerMin: 100 },
  { type: 'gym', label: 'Gym', icon: Dumbbell, defaultCalPerMin: 8.0, stepsPerMin: 30 },
  { type: 'cycling', label: 'Cycling', icon: Compass, defaultCalPerMin: 9.0, stepsPerMin: 0 },
  { type: 'custom', label: 'Custom', icon: Flame, defaultCalPerMin: 7.0, stepsPerMin: 50 },
];

export const AddEditEntryModal: React.FC<AddEditEntryModalProps> = ({
  visible,
  onClose,
  initialEntry,
}) => {
  const { addNewActivity, modifyActivity, deleteExistingActivity } = useFitness();

  const [selectedType, setSelectedType] = useState<ActivityType>('running');
  const [duration, setDuration] = useState<string>('30');
  const [steps, setSteps] = useState<string>('3500');
  const [calories, setCalories] = useState<string>('280');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialEntry) {
      setSelectedType(initialEntry.type);
      setDuration(String(initialEntry.duration));
      setSteps(String(initialEntry.steps));
      setCalories(String(initialEntry.calories));
      setDate(initialEntry.date);
      setErrorMsg(null);
    } else {
      setSelectedType('running');
      setDuration('30');
      setSteps('3500');
      setCalories('280');
      setDate(getTodayDateString());
      setErrorMsg(null);
    }
  }, [initialEntry, visible]);

  const handleTypeSelect = (type: ActivityType) => {
    setSelectedType(type);
    const meta = ACTIVITY_TYPES.find((a) => a.type === type);
    const durNum = Number(duration) || 30;
    if (meta) {
      // Auto-suggest values when changing type if creating new
      if (!initialEntry) {
        setCalories(String(Math.round(durNum * meta.defaultCalPerMin)));
        setSteps(String(Math.round(durNum * meta.stepsPerMin)));
      }
    }
  };

  const handleAutoEstimate = () => {
    const durNum = Number(duration) || 0;
    const meta = ACTIVITY_TYPES.find((a) => a.type === selectedType);
    if (meta && durNum > 0) {
      setCalories(String(Math.round(durNum * meta.defaultCalPerMin)));
      if (meta.stepsPerMin > 0) {
        setSteps(String(Math.round(durNum * meta.stepsPerMin)));
      }
    }
  };

  const handleSave = async () => {
    setErrorMsg(null);

    const validation = validateActivity({
      type: selectedType,
      duration: Number(duration),
      steps: Number(steps || 0),
      calories: Number(calories || 0),
      date: date.trim(),
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || 'Please check your inputs');
      return;
    }

    try {
      setIsSubmitting(true);
      if (initialEntry) {
        await modifyActivity(initialEntry.id, {
          type: selectedType,
          duration: Number(duration),
          steps: Number(steps || 0),
          calories: Number(calories || 0),
          date: date.trim(),
        });
      } else {
        await addNewActivity({
          type: selectedType,
          duration: Number(duration),
          steps: Number(steps || 0),
          calories: Number(calories || 0),
          date: date.trim(),
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialEntry) return;

    const performDelete = async () => {
      try {
        await deleteExistingActivity(initialEntry.id);
        onClose();
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to delete activity');
      }
    };

    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Delete this activity permanently?')) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Delete Activity',
        'Are you sure you want to permanently delete this entry?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const setDatePreset = (preset: 'today' | 'yesterday') => {
    const today = getTodayDateString();
    if (preset === 'today') {
      setDate(today);
    } else {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      setDate(yStr);
    }
  };

  return (
    <AppModal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {initialEntry ? 'Edit Activity' : 'Add Activity Log'}
              </Text>
              <Text style={styles.sheetSubtitle}>Direct SQLite persistence</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
            </View>
          )}

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Activity Type Pill Selector */}
            <Text style={styles.sectionLabel}>ACTIVITY TYPE</Text>
            <View style={styles.chipsRow}>
              {ACTIVITY_TYPES.map((item) => {
                const isSelected = selectedType === item.type;
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    activeOpacity={0.75}
                    onPress={() => handleTypeSelect(item.type)}
                  >
                    <IconComponent
                      size={16}
                      color={isSelected ? COLORS.text : COLORS.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Numeric Inputs */}
            <View style={styles.inputsGrid}>
              {/* Duration Input */}
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Clock size={16} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>Duration (min) *</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={duration}
                  onChangeText={(val) => setDuration(val.replace(/[^0-9]/g, ''))}
                  placeholder="30"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>

              {/* Calories Input */}
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Flame size={16} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>Calories (kcal) *</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={calories}
                  onChangeText={(val) => setCalories(val.replace(/[^0-9]/g, ''))}
                  placeholder="250"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>

              {/* Steps Input */}
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Footprints size={16} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>Steps Count</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={steps}
                  onChangeText={(val) => setSteps(val.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                />
              </View>

              {/* Date Input with Presets */}
              <View style={styles.inputCard}>
                <View style={styles.inputHeader}>
                  <Calendar size={16} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={COLORS.textMuted}
                />
                <View style={styles.datePresetRow}>
                  <TouchableOpacity
                    style={[
                      styles.datePresetBtn,
                      date === getTodayDateString() && styles.datePresetBtnActive,
                    ]}
                    onPress={() => setDatePreset('today')}
                  >
                    <Text style={styles.datePresetText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePresetBtn}
                    onPress={() => setDatePreset('yesterday')}
                  >
                    <Text style={styles.datePresetText}>Yesterday</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Smart Auto Estimate Helper */}
            <TouchableOpacity
              style={styles.estimateButton}
              activeOpacity={0.8}
              onPress={handleAutoEstimate}
            >
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.estimateText}>
                Auto-estimate calories & steps based on duration
              </Text>
            </TouchableOpacity>

            {/* Actions: Save & Delete */}
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.disabledButton]}
              activeOpacity={0.85}
              disabled={isSubmitting}
              onPress={handleSave}
            >
              <Check size={20} color={COLORS.text} style={{ marginRight: 6 }} />
              <Text style={styles.saveButtonText}>
                {initialEntry ? 'Update Entry' : 'Save Activity Entry'}
              </Text>
            </TouchableOpacity>

            {initialEntry && (
              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.8}
                onPress={handleDelete}
              >
                <Trash2 size={18} color={COLORS.error} style={{ marginRight: 6 }} />
                <Text style={styles.deleteButtonText}>Delete Activity</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 12, 0.85)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
  },
  bodyScroll: {
    paddingHorizontal: 22,
  },
  bodyContent: {
    paddingVertical: 18,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.text,
  },
  inputsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputHeader: {
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
  datePresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  datePresetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceHighlight,
  },
  datePresetBtnActive: {
    backgroundColor: 'rgba(255, 42, 54, 0.2)',
  },
  datePresetText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  estimateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 42, 54, 0.08)',
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 54, 0.2)',
    gap: 8,
  },
  estimateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  deleteButton: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.error,
  },
});
