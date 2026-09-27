import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Bookmark, ArrowRight, Check } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

interface FeaturedHeroCardProps {
  onEngageWorkout: () => void;
  onBookmarkToggle?: () => void;
}

export const FeaturedHeroCard: React.FC<FeaturedHeroCardProps> = ({
  onEngageWorkout,
  onBookmarkToggle,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [btnState, setBtnState] = useState<'idle' | 'calibrating' | 'started'>('idle');

  const handleEngagePress = () => {
    if (btnState !== 'idle') return;

    setBtnState('calibrating');
    setTimeout(() => {
      setBtnState('started');
      setTimeout(() => {
        setBtnState('idle');
        onEngageWorkout();
      }, 1000);
    }, 1200);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardInner}>
        {/* Real Photographic Backdrop - Editorial High-Performance Runner */}
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop',
          }}
          style={styles.heroImage}
        />

        {/* Dark Cinematic Vignette Scrim */}
        <View style={styles.gradientScrim} />

        {/* Top Badges Row */}
        <View style={styles.topRow}>
          {/* Floating Solar Badge */}
          <View style={styles.solarBadge}>
            <View style={styles.solarDot} />
            <Text style={styles.solarBadgeText}>PRESCRIBED FOCUS</Text>
          </View>

          {/* Bookmark Button */}
          <TouchableOpacity
            style={styles.bookmarkButton}
            activeOpacity={0.8}
            onPress={() => {
              setIsBookmarked(!isBookmarked);
              onBookmarkToggle?.();
            }}
          >
            <Bookmark
              size={18}
              color={COLORS.text}
              fill={isBookmarked ? COLORS.primaryContainer : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Content Overlay */}
        <View style={styles.bottomContent}>
          <Text style={styles.categorySubhead}>OUTDOOR THRESHOLD</Text>
          <Text style={styles.heroTitle}>5KM TEMPO THRESHOLD RUN</Text>

          {/* Key Metrics Strip */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Pace</Text>
              <Text style={styles.metricValue}>
                4'10" <Text style={styles.metricUnit}>/km</Text>
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Energy</Text>
              <Text style={styles.metricValue}>
                420 <Text style={styles.metricUnit}>kcal</Text>
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Target</Text>
              <Text style={styles.metricValue}>
                22:00 <Text style={styles.metricUnit}>min</Text>
              </Text>
            </View>
          </View>

          {/* Magnetic Tactile Action Button */}
          <TouchableOpacity
            style={[
              styles.engageButton,
              btnState === 'started' && styles.engageButtonStarted,
            ]}
            activeOpacity={0.9}
            onPress={handleEngagePress}
          >
            {btnState === 'calibrating' ? (
              <View style={styles.btnContentRow}>
                <ActivityIndicator size="small" color={COLORS.text} />
                <Text style={styles.engageButtonText}>CALIBRATING GPS...</Text>
              </View>
            ) : btnState === 'started' ? (
              <View style={styles.btnContentRow}>
                <Check size={18} color={COLORS.text} strokeWidth={3} />
                <Text style={styles.engageButtonText}>SESSION STARTED</Text>
              </View>
            ) : (
              <View style={styles.btnContentRow}>
                <Text style={styles.engageButtonText}>ENGAGE WORKOUT</Text>
                <ArrowRight size={18} color={COLORS.text} strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  cardInner: {
    height: 330,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: COLORS.inverseSurface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 28, 24, 0.52)',
  },
  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  solarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  solarDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primaryContainer,
  },
  solarBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1.1,
  },
  bookmarkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 10,
  },
  categorySubhead: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryContainer,
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 32, 28, 0.78)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.outlineVariant,
    marginBottom: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  engageButton: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 4,
  },
  engageButtonStarted: {
    backgroundColor: '#98c21a',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  engageButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.8,
  },
});
