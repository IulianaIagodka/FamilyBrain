import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { OwnerChip } from '@/components/OwnerBadge';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';
import {
  AREA_LABELS,
  type Ownership,
  type ResponsibilityArea,
} from '@/lib/types';

export default function EditResponsibilityScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { state, addResponsibility, updateResponsibility, you, partner, children } = useFamily();
  const existing = id ? state.responsibilities.find((r) => r.id === id) : undefined;

  const [title, setTitle] = useState(existing?.title || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [owner, setOwner] = useState<Ownership>(existing?.owner || 'unassigned');
  const [area, setArea] = useState<ResponsibilityArea>(existing?.area || 'other');
  const [forMemberIds, setForMemberIds] = useState<string[]>(existing?.forMemberIds || []);
  const [dueLabel, setDueLabel] = useState(existing?.dueLabel || '');

  const save = () => {
    if (!title.trim()) return;
    if (existing) {
      updateResponsibility(existing.id, {
        title: title.trim(),
        notes: notes.trim() || null,
        owner,
        area,
        forMemberIds,
        dueLabel: dueLabel.trim() || null,
      });
      router.back();
      return;
    }
    const created = addResponsibility({
      title: title.trim(),
      notes: notes.trim() || null,
      owner,
      area,
      forMemberIds,
      dueLabel: dueLabel.trim() || null,
    });
    router.replace(`/responsibility/${created.id}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to happen?"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Owner</Text>
        <View style={styles.row}>
          {(
            [
              ['me', you?.name || 'You'],
              ['partner', partner?.name || 'Partner'],
              ['shared', 'Shared'],
              ['unassigned', 'Unassigned'],
            ] as const
          ).map(([o, label]) => (
            <OwnerChip
              key={o}
              owner={o}
              label={label}
              selected={owner === o}
              onPress={() => setOwner(o)}
            />
          ))}
        </View>

        <Text style={styles.label}>Due</Text>
        <TextInput
          value={dueLabel}
          onChangeText={setDueLabel}
          placeholder="e.g. Tomorrow, Friday, Before Oct 12"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Area</Text>
        <View style={styles.row}>
          {(Object.keys(AREA_LABELS) as ResponsibilityArea[]).map((key) => (
            <Pressable
              key={key}
              onPress={() => setArea(key)}
              style={[styles.areaChip, area === key && styles.areaChipOn]}>
              <Text style={[styles.areaText, area === key && styles.areaTextOn]}>
                {AREA_LABELS[key]}
              </Text>
            </Pressable>
          ))}
        </View>

        {children.length > 0 && (
          <>
            <Text style={styles.label}>For</Text>
            <View style={styles.row}>
              {children.map((child) => {
                const selected = forMemberIds.includes(child.id);
                return (
                  <Pressable
                    key={child.id}
                    onPress={() =>
                      setForMemberIds((prev) =>
                        selected ? prev.filter((x) => x !== child.id) : [...prev, child.id],
                      )
                    }
                    style={[styles.areaChip, selected && styles.areaChipOn]}>
                    <Text style={[styles.areaText, selected && styles.areaTextOn]}>{child.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.label}>Notes</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.notes]}
          multiline
        />

        <PrimaryButton label="Save" onPress={save} disabled={!title.trim()} />
        <View style={{ height: 8 }} />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
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
  notes: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  areaChip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  areaChipOn: { backgroundColor: colors.accentSoft },
  areaText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  areaTextOn: { color: colors.accentDeep },
});
