import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { FitnessProvider, useFitness } from './src/context/FitnessContext';
import { COLORS } from './src/theme/colors';
import { BottomNav, TabType } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { WorkoutsScreen } from './src/screens/WorkoutsScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AddEditEntryModal } from './src/screens/AddEditEntryModal';
import { WorkoutDetailModal } from './src/screens/WorkoutDetailModal';
import { ActiveWorkoutModal } from './src/screens/ActiveWorkoutModal';
import { WorkoutCompleteModal } from './src/screens/WorkoutCompleteModal';
import { EditTelemetryModal } from './src/screens/EditTelemetryModal';
import { StreakPopup } from './src/components/StreakPopup';
import { MobileDeviceFrame } from './src/components/MobileDeviceFrame';
import { ActivityEntry, WorkoutProgram } from './src/types';

const MainApp: React.FC = () => {
  const { streakCelebrationVisible, setStreakCelebrationVisible, newStreakCount } = useFitness();

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [addEditModalVisible, setAddEditModalVisible] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);

  // Workout Flow Modals
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutProgram | null>(null);
  const [workoutDetailVisible, setWorkoutDetailVisible] = useState<boolean>(false);
  const [activeSessionVisible, setActiveSessionVisible] = useState<boolean>(false);
  const [completeModalVisible, setCompleteModalVisible] = useState<boolean>(false);
  const [completedSessionStats, setCompletedSessionStats] = useState<{
    durationMin: number;
    caloriesBurned: number;
  }>({ durationMin: 0, caloriesBurned: 0 });

  // Add Entry Handlers
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setAddEditModalVisible(true);
  };

  const handleEditEntry = (entry: ActivityEntry) => {
    setEditingEntry(entry);
    setAddEditModalVisible(true);
  };

  // Workout Navigation Handlers
  const handleSelectWorkout = (workout: WorkoutProgram) => {
    setSelectedWorkout(workout);
    setWorkoutDetailVisible(true);
  };

  const handleStartWorkout = (workout: WorkoutProgram) => {
    setWorkoutDetailVisible(false);
    setActiveSessionVisible(true);
  };

  const handleFinishWorkoutSession = (stats: { durationMin: number; caloriesBurned: number }) => {
    setActiveSessionVisible(false);
    setCompletedSessionStats(stats);
    setCompleteModalVisible(true);
  };

  const handleCompleteClose = () => {
    setCompleteModalVisible(false);
    setCurrentTab('home');
  };

  const handleStartWorkoutDirectly = (workout: WorkoutProgram) => {
    setSelectedWorkout(workout);
    setActiveSessionVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" backgroundColor={COLORS.background} />
      <MobileDeviceFrame>
        <View style={styles.container}>
          {/* Main Tab Screens */}
          {currentTab === 'home' && (
            <HomeScreen
              onOpenStreak={() => setStreakCelebrationVisible(true)}
              onOpenAddEntry={handleOpenAdd}
              onEditEntry={handleEditEntry}
              onOpenWorkouts={() => setCurrentTab('workouts')}
              onOpenProfile={() => setCurrentTab('profile')}
            />
          )}

          {currentTab === 'workouts' && (
            <WorkoutsScreen
              onSelectWorkout={handleSelectWorkout}
              onStartWorkoutDirectly={handleStartWorkoutDirectly}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressScreen onOpenStreak={() => setStreakCelebrationVisible(true)} />
          )}

          {currentTab === 'profile' && <ProfileScreen />}

          {/* 5-Tab Persistent Bottom Navigation Bar */}
          <BottomNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onPressAdd={handleOpenAdd}
          />

          {/* Screen 2: Add / Edit Entry Modal */}
          <AddEditEntryModal
            visible={addEditModalVisible}
            onClose={() => setAddEditModalVisible(false)}
            initialEntry={editingEntry}
          />

          {/* Screen 4: Workout Detail Modal */}
          <WorkoutDetailModal
            visible={workoutDetailVisible}
            workout={selectedWorkout}
            onClose={() => setWorkoutDetailVisible(false)}
            onStartSession={handleStartWorkout}
          />

          {/* Screen 5: Active Workout Session Modal */}
          <ActiveWorkoutModal
            visible={activeSessionVisible}
            workout={selectedWorkout}
            onClose={() => setActiveSessionVisible(false)}
            onFinishSession={handleFinishWorkoutSession}
          />

          {/* Screen 6: Workout Complete Modal */}
          <WorkoutCompleteModal
            visible={completeModalVisible}
            durationMin={completedSessionStats.durationMin}
            caloriesBurned={completedSessionStats.caloriesBurned}
            onClose={handleCompleteClose}
          />

          {/* Screen 8: Streak Celebration Popup Modal */}
          <StreakPopup
            visible={streakCelebrationVisible}
            onClose={() => setStreakCelebrationVisible(false)}
            streakCount={newStreakCount || undefined}
          />

          {/* Screen 10: Biometric Telemetry Calibration Modal (BPM, HRV, Sleep, Strain) */}
          <EditTelemetryModal />
        </View>
      </MobileDeviceFrame>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <FitnessProvider>
      <MainApp />
    </FitnessProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#0d0f0c' : COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    position: 'relative',
    overflow: 'hidden',
  },
});
