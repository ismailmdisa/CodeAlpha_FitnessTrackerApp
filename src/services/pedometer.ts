import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

export interface PedometerStatus {
  isAvailable: boolean;
  currentStepCount: number;
}

class StepTrackingService {
  private subscription: any = null;
  private isAvailable: boolean = false;
  private listeners: ((steps: number) => void)[] = [];
  private sessionSteps: number = 0;

  async checkAvailability(): Promise<boolean> {
    if (Platform.OS === 'web') {
      this.isAvailable = false;
      return false;
    }
    try {
      this.isAvailable = await Pedometer.isAvailableAsync();
      return this.isAvailable;
    } catch (e) {
      this.isAvailable = false;
      return false;
    }
  }

  async startTracking(callback: (steps: number) => void) {
    this.listeners.push(callback);
    const available = await this.checkAvailability();

    if (!available) {
      console.log('Hardware pedometer sensor is not available on this platform/environment.');
      return;
    }

    if (!this.subscription) {
      try {
        this.subscription = Pedometer.watchStepCount((result) => {
          this.sessionSteps = result.steps;
          this.listeners.forEach((listener) => listener(this.sessionSteps));
        });
      } catch (err) {
        console.warn('Could not watch step count:', err);
      }
    }
  }

  stopTracking() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.listeners = [];
  }

  async getTodaySteps(): Promise<number> {
    if (!this.isAvailable) return 0;
    try {
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      return result ? result.steps : 0;
    } catch (err) {
      console.warn('Failed to fetch pedometer step count:', err);
      return 0;
    }
  }
}

export const pedometerService = new StepTrackingService();
