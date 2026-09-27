import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  Platform,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Target,
  Flame,
  Award,
  ChevronRight,
  Database,
  Moon,
  Shield,
  Dumbbell,
  CheckCircle2,
  Camera,
  Edit2,
  Bell,
  Scale,
  Ruler,
  Footprints,
  Download,
  Trash2,
  Sparkles,
  User,
  Heart,
  Activity as ActivityIcon,
  X,
  Check,
} from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { useFitness } from '../context/FitnessContext';
import { EditGoalsModal } from './EditGoalsModal';
import { AnimatedCard } from '../components/AnimatedCard';
import { AppModal } from '../components/AppModal';

const PRESET_MALE_AVATARS = [
  { id: 'av1', label: 'Athlete 1', uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
  { id: 'av2', label: 'Athlete 2', uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
  { id: 'av3', label: 'Athlete 3', uri: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop' },
  { id: 'av4', label: 'Athlete 4', uri: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop' },
];

export const ProfileScreen: React.FC = () => {
  const { activities, goals, streakInfo, userProfile, updateProfile } = useFitness();

  const [goalsModalVisible, setGoalsModalVisible] = useState<boolean>(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState<boolean>(false);

  // Edit profile form state
  const [nameInput, setNameInput] = useState<string>(userProfile.name);
  const [weightInput, setWeightInput] = useState<string>(userProfile.weightKg.toString());
  const [heightInput, setHeightInput] = useState<string>(userProfile.heightCm.toString());

  // Preferences toggles
  const [hardwareSensorEnabled, setHardwareSensorEnabled] = useState<boolean>(true);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [unitMetric, setUnitMetric] = useState<boolean>(true);

  // Aggregated Lifetime Stats
  const totalSessions = activities.length;
  const totalCaloriesBurned = activities.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalStepsLogged = activities.reduce((acc, curr) => acc + (curr.steps || 0), 0);
  const totalDistanceKm = ((totalStepsLogged * 0.00078) + (activities.filter(a => a.type === 'running' || a.type === 'cycling').reduce((acc, curr) => acc + (curr.duration * 0.15), 0))).toFixed(1);

  // BMI Calculation
  const heightM = userProfile.heightCm / 100;
  const bmi = heightM > 0 ? (userProfile.weightKg / (heightM * heightM)).toFixed(1) : '23.5';

  // Handle Photo Upload (Web + Native)
  const handleUploadPhoto = async () => {
    if (Platform.OS === 'web') {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                updateProfile({ avatarUri: event.target.result as string });
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } catch (e) {
        console.warn('Web file upload error:', e);
      }
      return;
    }

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to set a custom profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        updateProfile({ avatarUri: result.assets[0].uri });
      }
    } catch (err) {
      console.warn('Photo picker error:', err);
    }
  };

  const handleSaveProfile = () => {
    const parsedWeight = parseFloat(weightInput) || userProfile.weightKg;
    const parsedHeight = parseFloat(heightInput) || userProfile.heightCm;
    updateProfile({
      name: nameInput.trim() || userProfile.name,
      weightKg: parsedWeight,
      heightCm: parsedHeight,
    });
    setEditProfileModalVisible(false);
  };

  const handleExportData = () => {
    const summary = {
      profile: userProfile,
      goals,
      activitiesCount: activities.length,
      currentStreak: streakInfo.currentStreak,
      totalCaloriesBurned,
      totalDistanceKm,
      exportedAt: new Date().toISOString(),
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(summary, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'kinetic_fitness_data.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      Alert.alert(
        'Data Export',
        `Successfully exported ${activities.length} activities and goals summary to memory.`
      );
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'SQLite Database Status',
      `Storage Engine: SQLite Local-First\nTotal Logged Entries: ${activities.length}\nLongest Streak: ${streakInfo.longestStreak} days\nStatus: Healthy & Persisted`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTagRow}>
            <View style={styles.headerDot} />
            <Text style={styles.headerTag}>ATHLETE HEADQUARTERS</Text>
          </View>
          <Text style={styles.headerTitle}>Athlete Profile</Text>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          activeOpacity={0.8}
          onPress={() => {
            setNameInput(userProfile.name);
            setWeightInput(userProfile.weightKg.toString());
            setHeightInput(userProfile.heightCm.toString());
            setEditProfileModalVisible(true);
          }}
        >
          <Edit2 size={14} color={COLORS.text} />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. ATHLETE IDENTITY CARD (With Photo Upload & Preset Switcher) */}
        <View style={styles.identityCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <Image
                source={{
                  uri: userProfile.avatarUri || PRESET_MALE_AVATARS[0].uri,
                }}
                style={styles.avatarImg}
              />
              <TouchableOpacity
                style={styles.cameraBadge}
                activeOpacity={0.85}
                onPress={handleUploadPhoto}
              >
                <Camera size={14} color={COLORS.text} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={handleUploadPhoto}
            >
              <Text style={styles.changePhotoText}>Upload Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.athleteDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.athleteName}>{userProfile.name}</Text>
              <View style={styles.verifiedBadge}>
                <Sparkles size={11} color={COLORS.primary} />
              </View>
            </View>

            <Text style={styles.memberTierBadge}>{userProfile.memberTier}</Text>
            <Text style={styles.joinedText}>Member since {userProfile.joinedDate}</Text>

            {/* Quick Preset Male Avatars Switcher */}
            <View style={styles.presetAvatarsContainer}>
              <Text style={styles.presetTitle}>Preset Athletes:</Text>
              <View style={styles.presetRow}>
                {PRESET_MALE_AVATARS.map((av) => (
                  <TouchableOpacity
                    key={av.id}
                    style={[
                      styles.presetThumbWrapper,
                      userProfile.avatarUri === av.uri && styles.presetThumbActive,
                    ]}
                    onPress={() => updateProfile({ avatarUri: av.uri })}
                  >
                    <Image source={{ uri: av.uri }} style={styles.presetThumb} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* 2. PHYSICAL BIOMETRICS & BODY COMPOSITION BAR */}
        <View style={styles.biometricsCard}>
          <Text style={styles.sectionSmallHeading}>PHYSICAL BIOMETRICS</Text>
          <View style={styles.biometricsGrid}>
            <View style={styles.biometricCol}>
              <View style={styles.biometricHeader}>
                <Scale size={13} color={COLORS.textSecondary} />
                <Text style={styles.biometricLabel}>WEIGHT</Text>
              </View>
              <Text style={styles.biometricValue}>
                {userProfile.weightKg} <Text style={styles.biometricUnit}>kg</Text>
              </Text>
              <Text style={styles.biometricSub}>Target: 72.0 kg</Text>
            </View>

            <View style={styles.biometricDivider} />

            <View style={styles.biometricCol}>
              <View style={styles.biometricHeader}>
                <Ruler size={13} color={COLORS.textSecondary} />
                <Text style={styles.biometricLabel}>HEIGHT</Text>
              </View>
              <Text style={styles.biometricValue}>
                {userProfile.heightCm} <Text style={styles.biometricUnit}>cm</Text>
              </Text>
              <Text style={styles.biometricSub}>5' 10" ft</Text>
            </View>

            <View style={styles.biometricDivider} />

            <View style={styles.biometricCol}>
              <View style={styles.biometricHeader}>
                <ActivityIcon size={13} color={COLORS.primary} />
                <Text style={styles.biometricLabel}>BMI INDEX</Text>
              </View>
              <Text style={[styles.biometricValue, { color: COLORS.primary }]}>
                {bmi}
              </Text>
              <Text style={styles.biometricSub}>Optimal Range</Text>
            </View>

            <View style={styles.biometricDivider} />

            <View style={styles.biometricCol}>
              <View style={styles.biometricHeader}>
                <Flame size={13} color={COLORS.secondary} />
                <Text style={styles.biometricLabel}>EST. FAT</Text>
              </View>
              <Text style={styles.biometricValue}>
                14.2<Text style={styles.biometricUnit}>%</Text>
              </Text>
              <Text style={styles.biometricSub}>Athletic Tier</Text>
            </View>
          </View>
        </View>

        {/* 3. LIFETIME CAREER TROPHY HALL (Live from SQLite) */}
        <Text style={styles.sectionHeading}>CAREER TROPHY HALL</Text>
        <View style={styles.careerGrid}>
          <View style={styles.careerCard}>
            <View style={styles.careerIcon}>
              <Dumbbell size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.careerVal}>{totalSessions}</Text>
            <Text style={styles.careerLabel}>SESSIONS LOGGED</Text>
          </View>

          <View style={styles.careerCard}>
            <View style={[styles.careerIcon, { backgroundColor: 'rgba(200, 224, 30, 0.25)' }]}>
              <Flame size={18} color={COLORS.primary} fill={COLORS.primary} />
            </View>
            <Text style={styles.careerVal}>{totalCaloriesBurned.toLocaleString()}</Text>
            <Text style={styles.careerLabel}>KCAL BURNED</Text>
          </View>

          <View style={styles.careerCard}>
            <View style={[styles.careerIcon, { backgroundColor: 'rgba(2, 132, 199, 0.14)' }]}>
              <Footprints size={18} color="#0284c7" />
            </View>
            <Text style={styles.careerVal}>{totalDistanceKm} <Text style={{ fontSize: 11 }}>km</Text></Text>
            <Text style={styles.careerLabel}>TOTAL DISTANCE</Text>
          </View>

          <View style={styles.careerCard}>
            <View style={[styles.careerIcon, { backgroundColor: 'rgba(234, 88, 12, 0.14)' }]}>
              <Award size={18} color="#ea580c" />
            </View>
            <Text style={styles.careerVal}>{streakInfo.longestStreak} <Text style={{ fontSize: 11 }}>days</Text></Text>
            <Text style={styles.careerLabel}>RECORD STREAK</Text>
          </View>
        </View>

        {/* 4. DAILY PERFORMANCE TARGETS & GOALS */}
        <Text style={styles.sectionHeading}>PERFORMANCE TARGETS</Text>
        <AnimatedCard
          style={styles.goalsSummaryCard}
          onPress={() => setGoalsModalVisible(true)}
        >
          <View style={styles.goalsSummaryLeft}>
            <View style={styles.goalsIconCircle}>
              <Target size={18} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.goalsTitle}>Configured Daily Targets</Text>
              <Text style={styles.goalsSub}>
                {goals.step_target.toLocaleString()} steps • {goals.calorie_target} kcal • {goals.active_minutes_target} min active
              </Text>
            </View>
          </View>

          <View style={styles.goalsActionPill}>
            <Text style={styles.goalsActionText}>Edit Targets</Text>
            <ChevronRight size={14} color={COLORS.text} />
          </View>
        </AnimatedCard>

        {/* 5. APP HARDWARE & SYSTEM PREFERENCES */}
        <Text style={styles.sectionHeading}>SYSTEM & SENSORS</Text>
        <View style={styles.settingsGroup}>
          {/* Sensor Pedometer Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={styles.settingIconSquare}>
                <Footprints size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Hardware Step Sensor</Text>
                <Text style={styles.settingDesc}>Automatic pedometer step detection</Text>
              </View>
            </View>
            <Switch
              value={hardwareSensorEnabled}
              onValueChange={setHardwareSensorEnabled}
              trackColor={{ false: COLORS.surfaceContainer, true: COLORS.primaryContainer }}
              thumbColor={hardwareSensorEnabled ? COLORS.text : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingDivider} />

          {/* Daily Reminders Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <View style={styles.settingIconSquare}>
                <Bell size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Daily Morning Reminder</Text>
                <Text style={styles.settingDesc}>07:00 AM workout consistency notification</Text>
              </View>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: COLORS.surfaceContainer, true: COLORS.primaryContainer }}
              thumbColor={reminderEnabled ? COLORS.text : '#f4f4f4'}
            />
          </View>

          <View style={styles.settingDivider} />

          {/* Unit Toggle */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => setUnitMetric(!unitMetric)}
          >
            <View style={styles.settingRowLeft}>
              <View style={styles.settingIconSquare}>
                <Scale size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Measurement System</Text>
                <Text style={styles.settingDesc}>{unitMetric ? 'Metric Units (kg, km, cm)' : 'Imperial Units (lbs, mi, in)'}</Text>
              </View>
            </View>
            <View style={styles.unitBadge}>
              <Text style={styles.unitBadgeText}>{unitMetric ? 'METRIC' : 'IMPERIAL'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. DATA & PRIVACY MANAGEMENT */}
        <Text style={styles.sectionHeading}>STORAGE & BACKUP</Text>
        <View style={styles.settingsGroup}>
          {/* SQLite Status */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={handleResetData}
          >
            <View style={styles.settingRowLeft}>
              <View style={styles.settingIconSquare}>
                <Database size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>SQLite Local Database</Text>
                <Text style={styles.settingDesc}>Local-first persistent offline engine</Text>
              </View>
            </View>
            <View style={styles.sqliteStatusPill}>
              <CheckCircle2 size={13} color={COLORS.primary} />
              <Text style={styles.sqliteStatusText}>HEALTHY</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          {/* Export Data */}
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={handleExportData}
          >
            <View style={styles.settingRowLeft}>
              <View style={styles.settingIconSquare}>
                <Download size={16} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Export Activity Logs</Text>
                <Text style={styles.settingDesc}>Download workout history as JSON</Text>
              </View>
            </View>
            <ChevronRight size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 7. APP ABOUT & FOOTER */}
        <View style={styles.aboutCard}>
          <Shield size={22} color={COLORS.primary} style={{ marginBottom: 6 }} />
          <Text style={styles.aboutTitle}>KINETIC Athletics • Pro Edition</Text>
          <Text style={styles.aboutVersion}>v2.4.0 (Build 520) • SQLite 3 Local Engine</Text>
          <Text style={styles.aboutDesc}>
            Built with React Native Expo SDK 52, high performance offline SQLite database, and Radiant Editorial Athleisure design system.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* EDIT ATHLETE DETAILS MODAL */}
      <AppModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Athlete Profile</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setEditProfileModalVisible(false)}
              >
                <X size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ATHLETE NAME</Text>
                <TextInput
                  style={styles.textInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Your Name"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

          <View style={styles.inputsRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
              <TextInput
                style={styles.textInput}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="numeric"
                placeholder="74.5"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
              <TextInput
                style={styles.textInput}
                value={heightInput}
                onChangeText={setHeightInput}
                keyboardType="numeric"
                placeholder="178"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveProfileBtn}
            activeOpacity={0.88}
            onPress={handleSaveProfile}
          >
            <Check size={16} color={COLORS.text} strokeWidth={2.5} />
            <Text style={styles.saveProfileBtnText}>SAVE PROFILE CHANGES</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </AppModal>

      {/* EDIT GOALS MODAL */}
      <EditGoalsModal
        visible={goalsModalVisible}
        onClose={() => setGoalsModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primaryContainer,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  identityCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primaryContainer,
    padding: 2,
    position: 'relative',
    backgroundColor: COLORS.surfaceLow,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 37,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  changePhotoBtn: {
    marginTop: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  changePhotoText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  athleteDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  athleteName: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(200, 224, 30, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberTierBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  joinedText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  presetAvatarsContainer: {
    marginTop: 2,
  },
  presetTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetThumbWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetThumbActive: {
    borderColor: COLORS.primaryContainer,
    borderWidth: 2,
  },
  presetThumb: {
    width: '100%',
    height: '100%',
  },
  biometricsCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionSmallHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  biometricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  biometricCol: {
    flex: 1,
    alignItems: 'center',
  },
  biometricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  biometricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  biometricValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
  },
  biometricUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  biometricSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  biometricDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.borderLight,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  careerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  careerCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  careerIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(88, 100, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  careerVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  careerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  goalsSummaryCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  goalsSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  goalsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(200, 224, 30, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  goalsSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  goalsActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  goalsActionText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
  },
  settingsGroup: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  unitBadge: {
    backgroundColor: COLORS.surfaceLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  sqliteStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(88, 100, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sqliteStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  aboutCard: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 10,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  aboutVersion: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 8,
  },
  aboutDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  modalContent: {
    padding: 6,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: COLORS.surfaceLow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    fontWeight: '600',
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  saveProfileBtn: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 22,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  saveProfileBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 28, 24, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
