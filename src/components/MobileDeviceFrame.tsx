import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Wifi, BatteryMedium, SignalHigh } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const formattedMins = minutes < 10 ? `0${minutes}` : `${minutes}`;
      // 12-hour format without am/pm for status bar
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${formattedMins}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // If running natively on Android or iOS, or on mobile screen (< 480px), render full screen without chassis
  if (Platform.OS !== 'web' || windowWidth < 480) {
    return <View style={styles.nativeContainer}>{children}</View>;
  }

  return (
    <View style={styles.desktopStage}>
      {/* Subtle Studio Ambient Backdrop Glow */}
      <View style={styles.ambientGlow} />

      {/* Smartphone Chassis (Flagship Titanium Body) */}
      <View style={styles.phoneChassis}>
        {/* Outer Titanium Rim Accent */}
        <View style={styles.phoneOuterRim}>
          {/* Inner Display Screen */}
          <View style={styles.phoneScreen}>
            {/* Top Smartphone Status Bar */}
            <View style={styles.statusBar}>
              {/* Left: Clock */}
              <View style={styles.statusTimeCol}>
                <Text style={styles.statusTimeText}>{currentTime}</Text>
              </View>

              {/* Center: Dynamic Island with Camera & Sensor */}
              <View style={styles.dynamicIsland}>
                <View style={styles.cameraLens}>
                  <View style={styles.lensReflection} />
                </View>
                <View style={styles.sensorDot} />
              </View>

              {/* Right: Signal, WiFi, Battery */}
              <View style={styles.statusIconsRow}>
                <SignalHigh size={13} color="#1a1c18" strokeWidth={2.4} />
                <Wifi size={13} color="#1a1c18" strokeWidth={2.4} />
                <View style={styles.batteryContainer}>
                  <View style={styles.batteryLevel} />
                  <View style={styles.batteryCap} />
                </View>
              </View>
            </View>

            {/* Application Viewport */}
            <View style={styles.appViewport}>{children}</View>

            {/* Bottom iOS Home Indicator Pill */}
            <View style={styles.homeIndicatorRow}>
              <View style={styles.homeIndicator} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
  },
  desktopStage: {
    flex: 1,
    width: '100%',
    minHeight: '100vh' as any,
    backgroundColor: '#0d0f0c', // Studio obsidian backdrop
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '20%',
    width: 650,
    height: 650,
    borderRadius: 325,
    backgroundColor: 'rgba(200, 224, 30, 0.035)', // subtle chartreuse halo
  },
  phoneChassis: {
    width: 445,
    height: 900,
    maxHeight: '96vh' as any,
    borderRadius: 52,
    backgroundColor: '#1c1e19', // Titanium frame
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 28 },
    shadowOpacity: 0.65,
    shadowRadius: 50,
    elevation: 20,
  },
  phoneOuterRim: {
    flex: 1,
    borderRadius: 49,
    backgroundColor: '#0a0b08', // Black bezel
    padding: 7,
    borderWidth: 1,
    borderColor: 'rgba(26, 28, 24, 0.8)',
  },
  phoneScreen: {
    flex: 1,
    borderRadius: 42,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
    position: 'relative',
  },
  statusBar: {
    height: 42,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    zIndex: 999,
  },
  statusTimeCol: {
    width: 50,
  },
  statusTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1c18',
    letterSpacing: -0.2,
  },
  dynamicIsland: {
    width: 96,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  cameraLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  lensReflection: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.7)',
  },
  sensorDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: '#1e293b',
    marginRight: 4,
  },
  statusIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 50,
    justifyContent: 'flex-end',
  },
  batteryContainer: {
    width: 20,
    height: 10,
    borderRadius: 3,
    borderWidth: 1.2,
    borderColor: '#1a1c18',
    padding: 1,
    position: 'relative',
  },
  batteryLevel: {
    width: '85%',
    height: '100%',
    backgroundColor: '#1a1c18',
    borderRadius: 1.5,
  },
  batteryCap: {
    position: 'absolute',
    right: -3,
    top: 2,
    width: 1.5,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#1a1c18',
  },
  appViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  homeIndicatorRow: {
    height: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeIndicator: {
    width: 125,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1a1c18',
    opacity: 0.85,
  },
});
