import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}>
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sectionLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  muted: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: typography.bodyBold,
    color: '#fff',
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.accentDeep,
    fontSize: 15,
  },
  ghostBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontFamily: typography.bodyMedium,
    color: colors.textSecondary,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.45,
  },
});
