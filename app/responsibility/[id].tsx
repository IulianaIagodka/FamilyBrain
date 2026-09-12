import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { OwnerBadge, OwnerChip } from '@/components/OwnerBadge';
import { Card, PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDueLine } from '@/lib/dates';
import { useFamily } from '@/lib/FamilyContext';
import { AREA_LABELS, type Ownership } from '@/lib/types';

export default function ResponsibilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    state,
    ownerLabel,
    setOwnership,
    setStatus,
    deleteResponsibility,
    you,
    partner,
  } = useFamily();

  const item = state.responsibilities.find((r) => r.id === id);

  if (!item) {
    return (
      <View style={styles.root}>
        <Text style={styles.missing}>This responsibility was removed.</Text>
      </View>
    );
  }

  const forNames = item.forMemberIds
    .map((mid) => state.members.find((m) => m.id === mid)?.name)
    .filter(Boolean)
    .join(' & ');

  const owners: { owner: Ownership; label: string }[] = [
    { owner: 'me', label: you?.name || 'You' },
    { owner: 'partner', label: partner?.name || 'Partner' },
    { owner: 'shared', label: 'Shared' },
    { owner: 'unassigned', label: 'Unassigned' },
  ];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{item.title}</Text>
      {formatDueLine(item.dueDate, item.dueLabel) ? (
        <Text style={styles.due}>{formatDueLine(item.dueDate, item.dueLabel)}</Text>
      ) : null}

      <View style={styles.ownerBlock}>
        <OwnerBadge owner={item.owner} label={ownerLabel(item.owner)} large />
        {item.owner === 'unassigned' ? (
          <Text style={styles.uncomfortable}>Nobody owns this yet</Text>
        ) : null}
      </View>

      <Text style={styles.label}>Quick reassign</Text>
      <View style={styles.chips}>
        {owners.map((o) => (
          <OwnerChip
            key={o.owner}
            owner={o.owner}
            label={o.label}
            selected={item.owner === o.owner}
            onPress={() => setOwnership(item.id, o.owner)}
          />
        ))}
      </View>

      <Card style={styles.metaCard}>
        <MetaRow label="Area" value={AREA_LABELS[item.area]} />
        {forNames ? <MetaRow label="For" value={forNames} /> : null}
        <MetaRow label="Status" value={item.status === 'open' ? 'Open' : 'Done'} />
      </Card>

      {item.sourceText ? (
        <>
          <Text style={styles.label}>Source</Text>
          <Card>
            <Text style={styles.source}>{item.sourceText}</Text>
          </Card>
        </>
      ) : null}

      {item.notes ? (
        <>
          <Text style={styles.label}>Notes</Text>
          <Card>
            <Text style={styles.source}>{item.notes}</Text>
          </Card>
        </>
      ) : null}

      <View style={styles.actions}>
        {item.status === 'open' ? (
          <PrimaryButton label="Mark as done" onPress={() => setStatus(item.id, 'done')} />
        ) : (
          <PrimaryButton label="Reopen" onPress={() => setStatus(item.id, 'open')} />
        )}
        <SecondaryButton
          label="Edit details"
          onPress={() => router.push({ pathname: '/responsibility/edit', params: { id: item.id } })}
        />
        <Pressable
          onPress={() =>
            Alert.alert('Remove responsibility?', 'This cannot be undone.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                  deleteResponsibility(item.id);
                  router.back();
                },
              },
            ])
          }
          style={styles.remove}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  missing: {
    fontFamily: typography.body,
    color: colors.textSecondary,
    margin: spacing.lg,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 30,
    lineHeight: 36,
    color: colors.text,
  },
  due: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  ownerBlock: {
    marginTop: spacing.lg,
    gap: 8,
  },
  uncomfortable: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: colors.warning,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  metaCard: { gap: 10 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaLabel: {
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 14,
  },
  metaValue: {
    fontFamily: typography.bodyMedium,
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  source: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  actions: { marginTop: spacing.xl, gap: 8 },
  remove: { alignItems: 'center', paddingVertical: 12 },
  removeText: {
    fontFamily: typography.bodyMedium,
    color: colors.danger,
  },
});
