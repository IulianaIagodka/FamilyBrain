import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { OwnerChip } from '@/components/OwnerBadge';
import { PrimaryButton, SecondaryButton, Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { formatDueLine } from '@/lib/dates';
import { useFamily } from '@/lib/FamilyContext';
import type { Ownership, SuggestedResponsibility } from '@/lib/types';

export default function InboxReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    state,
    prepareInboxSuggestions,
    confirmInboxSuggestions,
    dismissInboxItem,
    children,
    you,
    partner,
  } = useFamily();

  const item = state.inbox.find((i) => i.id === id);
  const initial = useMemo(
    () => (item ? prepareInboxSuggestions(item) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item?.id],
  );

  const [suggestions, setSuggestions] = useState<SuggestedResponsibility[]>(initial);
  const [eventTitle, setEventTitle] = useState(item?.suggestedEventTitle || '');
  const [owners, setOwners] = useState<Record<string, Ownership>>({});

  useEffect(() => {
    setSuggestions(initial);
    setEventTitle(item?.suggestedEventTitle || '');
    const defaults: Record<string, Ownership> = {};
    initial.forEach((s) => {
      defaults[s.tempId] = 'unassigned';
    });
    setOwners(defaults);
  }, [initial, item?.suggestedEventTitle]);

  if (!item) {
    return (
      <View style={styles.root}>
        <Text style={styles.missing}>This capture is no longer available.</Text>
        <SecondaryButton label="Back to Inbox" onPress={() => router.replace('/(tabs)/inbox')} />
      </View>
    );
  }

  const toggle = (tempId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.tempId === tempId ? { ...s, selected: !s.selected } : s)),
    );
  };

  const updateTitle = (tempId: string, title: string) => {
    setSuggestions((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, title } : s)));
  };

  const toggleMember = (tempId: string, memberId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.tempId !== tempId) return s;
        const has = s.forMemberIds.includes(memberId);
        return {
          ...s,
          forMemberIds: has
            ? s.forMemberIds.filter((mid) => mid !== memberId)
            : [...s.forMemberIds, memberId],
        };
      }),
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Original</Text>
      <Card style={styles.source}>
        <Text style={styles.sourceText}>{item.rawText}</Text>
      </Card>

      <Text style={styles.eyebrow}>Suggested event</Text>
      <TextInput
        value={eventTitle}
        onChangeText={setEventTitle}
        placeholder="Optional event title"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      {item.suggestedEventDate ? (
        <Text style={styles.dateHint}>
          Suggested date: {formatDueLine(item.suggestedEventDate) || item.suggestedEventDate}
        </Text>
      ) : null}

      <Text style={styles.eyebrow}>Suggested responsibilities</Text>
      <Text style={styles.help}>
        Confirm or edit before saving. Nothing important is created silently.
      </Text>

      {suggestions.map((s) => (
        <Card key={s.tempId} style={[styles.suggestion, !s.selected && styles.deselected]}>
          <Pressable onPress={() => toggle(s.tempId)} style={styles.checkRow}>
            <View style={[styles.check, s.selected && styles.checkOn]}>
              {s.selected ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <TextInput
              value={s.title}
              onChangeText={(t) => updateTitle(s.tempId, t)}
              style={styles.suggestionTitle}
            />
          </Pressable>
          {(s.dueDate || s.dueLabel) && (
            <Text style={styles.due}>{formatDueLine(s.dueDate, s.dueLabel)}</Text>
          )}

          <Text style={styles.ownerLabel}>Owner</Text>
          <View style={styles.ownerRow}>
            {(
              [
                ['me', you?.name || 'You'],
                ['partner', partner?.name || 'Partner'],
                ['shared', 'Shared'],
                ['unassigned', 'Unassigned'],
              ] as const
            ).map(([owner, label]) => (
              <OwnerChip
                key={owner}
                owner={owner}
                label={label}
                selected={(owners[s.tempId] || 'unassigned') === owner}
                onPress={() => setOwners((prev) => ({ ...prev, [s.tempId]: owner }))}
              />
            ))}
          </View>

          {children.length > 0 && (
            <>
              <Text style={styles.ownerLabel}>For</Text>
              <View style={styles.ownerRow}>
                {children.map((child) => {
                  const selected = s.forMemberIds.includes(child.id);
                  return (
                    <Pressable
                      key={child.id}
                      onPress={() => toggleMember(s.tempId, child.id)}
                      style={[styles.memberChip, selected && styles.memberChipOn]}>
                      <Text style={[styles.memberText, selected && styles.memberTextOn]}>
                        {child.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </Card>
      ))}

      <PrimaryButton
        label="Confirm & save"
        onPress={() => {
          confirmInboxSuggestions(item, suggestions, eventTitle.trim() || null, owners);
          router.replace('/(tabs)');
        }}
      />
      <View style={{ height: 8 }} />
      <SecondaryButton
        label="Dismiss without saving"
        onPress={() => {
          dismissInboxItem(item.id);
          router.back();
        }}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
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
  eyebrow: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  source: { marginBottom: spacing.sm },
  sourceText: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
  },
  dateHint: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
  },
  help: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  suggestion: { marginBottom: spacing.sm, gap: 8 },
  deselected: { opacity: 0.55 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  checkOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  suggestionTitle: {
    flex: 1,
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 4,
  },
  due: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 34,
  },
  ownerLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  ownerRow: { flexDirection: 'row', flexWrap: 'wrap' },
  memberChip: {
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.surfaceMuted,
    marginRight: 8,
    marginBottom: 8,
  },
  memberChipOn: { backgroundColor: colors.sharedSoft },
  memberText: { fontFamily: typography.bodyMedium, color: colors.textSecondary },
  memberTextOn: { color: colors.shared },
});
