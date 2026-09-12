import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, radii, spacing, typography } from '@/constants/theme';

export function CaptureFab() {
  const router = useRouter();

  const open = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    router.push('/capture');
  };

  if (Platform.OS === 'web') {
    return (
      <button type="button" onClick={open} style={webFab} aria-label="Add">
        <span style={{ fontSize: 22, lineHeight: '22px' }}>+</span>
        <span style={{ fontFamily: 'DMSans_700Bold, sans-serif', fontWeight: 700, fontSize: 16 }}>
          Add
        </span>
      </button>
    );
  }

  return (
    <Pressable
      accessibilityLabel="Add"
      onPress={open}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Ionicons name="add" size={28} color="#fff" />
      <Text style={styles.label}>Add</Text>
    </Pressable>
  );
}

const webFab: Record<string, string | number> = {
  position: 'fixed',
  right: 24,
  bottom: 88,
  backgroundColor: colors.accent,
  borderRadius: 28,
  paddingTop: 14,
  paddingBottom: 14,
  paddingLeft: 18,
  paddingRight: 18,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 6px 16px rgba(31, 79, 66, 0.25)',
  zIndex: 50,
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: 88,
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  label: {
    fontFamily: typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
});
