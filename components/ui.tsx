import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';

type BtnProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

/**
 * Web-friendly buttons. RN Web Pressable can miss clicks in some desktop
 * automation / pointer setups, so web uses a real <button>.
 */
export function AppButton({ label, onPress, disabled, variant = 'primary' }: BtnProps) {
  const variantStyle =
    variant === 'primary' ? styles.primaryBtn : variant === 'secondary' ? styles.secondaryBtn : styles.ghostBtn;
  const textStyle =
    variant === 'primary'
      ? styles.primaryBtnText
      : variant === 'secondary'
        ? styles.secondaryBtnText
        : styles.ghostBtnText;

  if (Platform.OS === 'web') {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onPress}
        style={{
          ...webBase,
          ...(variant === 'primary'
            ? webPrimary
            : variant === 'secondary'
              ? webSecondary
              : webGhost),
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}>
        {label}
      </button>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [variantStyle, disabled && styles.disabled, pressed && !disabled && styles.pressed]}>
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton(props: Omit<BtnProps, 'variant'>) {
  return <AppButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<BtnProps, 'variant' | 'disabled'>) {
  return <AppButton {...props} variant="secondary" />;
}

export function GhostButton(props: Omit<BtnProps, 'variant' | 'disabled'>) {
  return <AppButton {...props} variant="ghost" />;
}

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
    if (Platform.OS === 'web') {
      return (
        <div
          role="button"
          tabIndex={0}
          onClick={onPress}
          onKeyDown={(e: { key: string }) => {
            if (e.key === 'Enter' || e.key === ' ') onPress();
          }}
          style={webCard}>
          {children}
        </div>
      );
    }
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

const webBase: Record<string, string | number> = {
  width: '100%',
  border: 'none',
  borderRadius: 16,
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 20,
  paddingRight: 20,
  fontFamily: 'DMSans_700Bold, \"DM Sans\", sans-serif',
  fontSize: 16,
  fontWeight: 700,
};

const webPrimary: Record<string, string | number> = {
  backgroundColor: colors.accent,
  color: '#fff',
};

const webSecondary: Record<string, string | number> = {
  backgroundColor: colors.accentSoft,
  color: colors.accentDeep,
  fontFamily: 'DMSans_500Medium, \"DM Sans\", sans-serif',
  fontWeight: 500,
  fontSize: 15,
  paddingTop: 14,
  paddingBottom: 14,
};

const webGhost: Record<string, string | number> = {
  backgroundColor: 'transparent',
  color: colors.textSecondary,
  fontFamily: 'DMSans_500Medium, \"DM Sans\", sans-serif',
  fontWeight: 500,
  fontSize: 15,
  paddingTop: 12,
  paddingBottom: 12,
};

const webCard: Record<string, string | number> = {
  backgroundColor: colors.surface,
  borderRadius: 22,
  padding: 16,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: colors.borderSoft,
  cursor: 'pointer',
};

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
