import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/theme';
import type { Ownership } from '@/lib/types';

const OWNER_STYLES: Record<
  Ownership,
  { bg: string; fg: string; label: string }
> = {
  me: { bg: colors.meSoft, fg: colors.me, label: 'You' },
  partner: { bg: colors.partnerSoft, fg: colors.partner, label: 'Partner' },
  shared: { bg: colors.sharedSoft, fg: colors.shared, label: 'Shared' },
  unassigned: { bg: colors.unassignedSoft, fg: colors.unassigned, label: 'Nobody owns this yet' },
};

export function OwnerBadge({
  owner,
  label,
  large,
}: {
  owner: Ownership;
  label?: string;
  large?: boolean;
}) {
  const style = OWNER_STYLES[owner];
  const text = label || style.label;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: style.bg },
        owner === 'unassigned' && styles.unassigned,
        large && styles.large,
      ]}>
      <Text style={[styles.ownerWord, { color: style.fg }, large && styles.largeWord]}>Owner</Text>
      <Text style={[styles.name, { color: style.fg }, large && styles.largeName]}>{text}</Text>
    </View>
  );
}

export function OwnerChip({
  owner,
  label,
  selected,
  onPress,
}: {
  owner: Ownership;
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  const style = OWNER_STYLES[owner];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? style.bg : colors.surfaceMuted,
          borderColor: selected ? style.fg : 'transparent',
        },
      ]}>
      <Text style={[styles.chipText, { color: selected ? style.fg : colors.textSecondary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 1,
  },
  unassigned: {
    borderWidth: 1,
    borderColor: colors.warning,
  },
  large: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownerWord: {
    fontFamily: typography.body,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  largeWord: {
    fontSize: 12,
  },
  name: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
  },
  largeName: {
    fontSize: 18,
  },
  chip: {
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
});
