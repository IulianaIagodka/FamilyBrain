import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { colors, radii, spacing, typography } from '@/constants/theme';

export function CaptureFab() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityLabel="Add"
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        router.push('/capture');
      }}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Ionicons name="add" size={28} color="#fff" />
      <Text style={styles.label}>Add</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: radii.xl,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: colors.accentDeep,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
