import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PrimaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';

export default function FamilyScreen() {
  const { state, addMember, removeMember, you, partner, children } = useFamily();
  const [name, setName] = useState('');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        Adults can own responsibilities. Children can be linked to them, but don’t need to be owners.
      </Text>

      <Text style={styles.label}>Adults</Text>
      {[you, partner].filter(Boolean).map((member) => (
        <Card key={member!.id} style={styles.member}>
          <View style={[styles.dot, { backgroundColor: member!.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{member!.name}</Text>
            <Text style={styles.role}>{member!.role === 'you' ? 'You' : 'Partner'}</Text>
          </View>
        </Card>
      ))}

      <Text style={styles.label}>Children & family</Text>
      {children.length === 0 ? (
        <Text style={styles.empty}>No children added yet.</Text>
      ) : (
        children.map((member) => (
          <Card key={member.id} style={styles.member}>
            <View style={[styles.dot, { backgroundColor: member.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.role}>Family member</Text>
            </View>
            <Pressable
              onPress={() =>
                Alert.alert('Remove member?', member.name, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeMember(member.id),
                  },
                ])
              }>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </Card>
        ))
      )}

      <Text style={styles.label}>Add family member</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <PrimaryButton
        label="Add"
        onPress={() => {
          if (!name.trim()) return;
          addMember(name.trim(), 'child');
          setName('');
        }}
      />

      <Text style={styles.household}>Household: {state.household?.name}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  lead: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.md,
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
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  name: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  role: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  remove: {
    fontFamily: typography.bodyMedium,
    color: colors.danger,
    fontSize: 13,
  },
  empty: {
    fontFamily: typography.body,
    color: colors.textMuted,
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
    marginBottom: spacing.sm,
  },
  household: {
    marginTop: spacing.xl,
    fontFamily: typography.body,
    color: colors.textMuted,
    fontSize: 13,
  },
});
