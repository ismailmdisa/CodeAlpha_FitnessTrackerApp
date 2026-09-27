import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Heart,
  Activity,
  Moon,
  Zap,
  Droplets,
  Scale,
  Check,
  X,
  Sparkles,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';
import { AppModal } from '../components/AppModal';

export const EditTelemetryModal: React.FC = () => {
  const { telemetry, updateTelemetry, telemetryModalVisible, setTelemetryModalVisible } = useFitness();

  const [bpmInput, setBpmInput] = useState<string>('48');
  const [hrvInput, setHrvInput] = useState<string>('74');
  const [sleepHoursInput, setSleepHoursInput] = useState<string>('8');
  const [sleepMinutesInput, setSleepMinutesInput] = useState<string>('15');
  const [sleepQualityInput, setSleepQualityInput] = useState<string>('92');
  const [readinessInput, setReadinessInput] = useState<string>('88');
  const [strainInput, setStrainInput] = useState<string>('14.8');
  const [bodyFatInput, setBodyFatInput] = useState<string>('14.2');
  const [waterTargetInput, setWaterTargetInput] = useState<string>('3000');

  useEffect(() => {
    if (telemetryModalVisible && telemetry) {
      setBpmInput(String(telemetry.restHeartRateBpm ?? 48));
      setHrvInput(String(telemetry.hrvMs ?? 74));
      setSleepHoursInput(String(telemetry.sleepHours ?? 8));
      setSleepMinutesInput(String(telemetry.sleepMinutes ?? 15));
      setSleepQualityInput(String(telemetry.sleepRestScorePct ?? 92));
      setReadinessInput(String(telemetry.readinessPct ?? 88));
      setStrainInput(String(telemetry.strainScore ?? 14.8));
      setBodyFatInput(String(telemetry.estBodyFatPct ?? 14.2));
      setWaterTargetInput(String(telemetry.waterTargetMl ?? 3000));
    }
  }, [telemetryModalVisible, telemetry]);

  const handleApplyPreset = (preset: {
    bpm: number;
    hrv: number;
    hours: number;
    mins: number;
    quality: number;
    readiness: number;
    strain: number;
    fat: number;
  }) => {
    setBpmInput(String(preset.bpm));
    setHrvInput(String(preset.hrv));
    setSleepHoursInput(String(preset.hours));
    setSleepMinutesInput(String(preset.mins));
    setSleepQualityInput(String(preset.quality));
    setReadinessInput(String(preset.readiness));
    setStrainInput(String(preset.strain));
    setBodyFatInput(String(preset.fat));
  };

  const handleSave = () => {
    const bpm = Math.max(30, Math.min(180, parseInt(bpmInput, 10) || 48));
    const hrv = Math.max(10, Math.min(200, parseInt(hrvInput, 10) || 74));
    const sleepH = Math.max(0, Math.min(24, parseInt(sleepHoursInput, 10) || 8));
    const sleepM = Math.max(0, Math.min(59, parseInt(sleepMinutesInput, 10) || 15));
    const sleepQ = Math.max(10, Math.min(100, parseInt(sleepQualityInput, 10) || 92));
    const read = Math.max(1, Math.min(100, parseInt(readinessInput, 10) || 88));
    const strain = Math.max(0, Math.min(21, parseFloat(strainInput) || 14.8));
    const fat = Math.max(3, Math.min(50, parseFloat(bodyFatInput) || 14.2));
    const water = Math.max(500, Math.min(10000, parseInt(waterTargetInput, 10) || 3000));

    updateTelemetry({
      restHeartRateBpm: bpm,
      hrvMs: hrv,
      sleepHours: sleepH,
      sleepMinutes: sleepM,
      sleepRestScorePct: sleepQ,
      readinessPct: read,
      strainScore: strain,
      estBodyFatPct: fat,
      waterTargetMl: water,
    });

    setTelemetryModalVisible(false);
  };

  return (
    <AppModal
      visible={telemetryModalVisible}
      onClose={() => setTelemetryModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.headerTagRow}>
                <View style={styles.headerDot} />
                <Text style={styles.headerTag}>SENSOR TELEMETRY</Text>
              </View>
              <Text style={styles.title}>Edit Biometric Telemetry</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setTelemetryModalVisible(false)}
            >
              <X size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Presets Strip */}
            <Text style={styles.sectionHeading}>QUICK ATHLETE PRESETS</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={styles.presetChip}
                activeOpacity={0.8}
                onPress={() =>
                  handleApplyPreset({
                    bpm: 44,
                    hrv: 82,
                    hours: 8,
                    mins: 30,
                    quality: 96,
                    readiness: 94,
                    strain: 16.5,
                    fat: 12.8,
                  })
                }
              >
                <Sparkles size={11} color={COLORS.primary} />
                <Text style={styles.presetChipText}>Peak Athlete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                activeOpacity={0.8}
                onPress={() =>
                  handleApplyPreset({
                    bpm: 52,
                    hrv: 68,
                    hours: 7,
                    mins: 45,
                    quality: 86,
                    readiness: 85,
                    strain: 12.0,
                    fat: 14.5,
                  })
                }
              >
                <Text style={styles.presetChipText}>Balanced Daily</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetChip}
                activeOpacity={0.8}
                onPress={() =>
                  handleApplyPreset({
                    bpm: 58,
                    hrv: 54,
                    hours: 9,
                    mins: 0,
                    quality: 78,
                    readiness: 72,
                    strain: 6.0,
                    fat: 15.0,
                  })
                }
              >
                <Text style={styles.presetChipText}>Active Recovery</Text>
              </TouchableOpacity>
            </View>

            {/* Input 1: Rest Heart Rate & HRV */}
            <Text style={styles.sectionHeading}>CARDIOVASCULAR TELEMETRY</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Heart size={14} color="#dc2626" />
                  <Text style={styles.fieldLabel}>REST HEART RATE</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={bpmInput}
                    onChangeText={setBpmInput}
                    keyboardType="numeric"
                    placeholder="48"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>bpm</Text>
                </View>
              </View>

              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Activity size={14} color={COLORS.primary} />
                  <Text style={styles.fieldLabel}>HRV (VARIABILITY)</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={hrvInput}
                    onChangeText={setHrvInput}
                    keyboardType="numeric"
                    placeholder="74"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>ms</Text>
                </View>
              </View>
            </View>

            {/* Input 2: Sleep Duration & Quality */}
            <Text style={styles.sectionHeading}>SLEEP & RESTORATION</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Moon size={14} color="#0284c7" />
                  <Text style={styles.fieldLabel}>SLEEP TIME</Text>
                </View>
                <View style={styles.dualInputRow}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <TextInput
                      style={styles.textInput}
                      value={sleepHoursInput}
                      onChangeText={setSleepHoursInput}
                      keyboardType="numeric"
                      placeholder="8"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <Text style={styles.inputUnit}>h</Text>
                  </View>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <TextInput
                      style={styles.textInput}
                      value={sleepMinutesInput}
                      onChangeText={setSleepMinutesInput}
                      keyboardType="numeric"
                      placeholder="15"
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <Text style={styles.inputUnit}>m</Text>
                  </View>
                </View>
              </View>

              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Check size={14} color={COLORS.primary} />
                  <Text style={styles.fieldLabel}>REST SCORE</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={sleepQualityInput}
                    onChangeText={setSleepQualityInput}
                    keyboardType="numeric"
                    placeholder="92"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>%</Text>
                </View>
              </View>
            </View>

            {/* Input 3: Readiness Score & Metabolic Strain */}
            <Text style={styles.sectionHeading}>INTENSITY & READINESS</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Sparkles size={14} color={COLORS.primary} />
                  <Text style={styles.fieldLabel}>READINESS</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={readinessInput}
                    onChangeText={setReadinessInput}
                    keyboardType="numeric"
                    placeholder="88"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>%</Text>
                </View>
              </View>

              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Zap size={14} color={COLORS.text} fill={COLORS.text} />
                  <Text style={styles.fieldLabel}>METABOLIC STRAIN</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={strainInput}
                    onChangeText={setStrainInput}
                    keyboardType="numeric"
                    placeholder="14.8"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>/ 21</Text>
                </View>
              </View>
            </View>

            {/* Input 4: Body Fat & Water Target */}
            <Text style={styles.sectionHeading}>BODY COMPOSITION & HYDRATION</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Scale size={14} color={COLORS.secondary} />
                  <Text style={styles.fieldLabel}>EST. BODY FAT</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={bodyFatInput}
                    onChangeText={setBodyFatInput}
                    keyboardType="numeric"
                    placeholder="14.2"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>%</Text>
                </View>
              </View>

              <View style={styles.inputField}>
                <View style={styles.fieldLabelRow}>
                  <Droplets size={14} color="#0284c7" />
                  <Text style={styles.fieldLabel}>WATER GOAL</Text>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={waterTargetInput}
                    onChangeText={setWaterTargetInput}
                    keyboardType="numeric"
                    placeholder="3000"
                    placeholderTextColor={COLORS.textMuted}
                  />
                  <Text style={styles.inputUnit}>ml</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.8}
              onPress={() => setTelemetryModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              activeOpacity={0.88}
              onPress={handleSave}
            >
              <Check size={16} color={COLORS.text} strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>Save Telemetry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 28, 24, 0.65)',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryContainer,
  },
  headerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: 460,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  inputField: {
    flex: 1,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 44,
  },
  dualInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    padding: 0,
  },
  inputUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
});
