import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CaptureFab } from '@/components/CaptureFab';
import { Card, PrimaryButton, SectionLabel, Subtitle, Title } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';

export default function InboxScreen() {
  const router = useRouter();
  const { state, dismissInboxItem } = useFamily();
  const items = state.inbox.filter((i) => i.status === 'new');
  const reviewed = state.inbox.filter((i) => i.status === 'reviewed').slice(0, 5);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title>Inbox</Title>
          <Subtitle>
            New information lands here first. Capture now — structure and ownership come next.
          </Subtitle>

          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton label="Capture something" onPress={() => router.push('/capture')} />
          </View>

          <SectionLabel>To review</SectionLabel>
          {items.length === 0 ? (
            <Card>
              <Text style={styles.emptyTitle}>Inbox is clear</Text>
              <Text style={styles.emptyBody}>
                Paste a kindergarten message, an email, or a quick note with Add.
              </Text>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} style={styles.item} onPress={() => router.push(`/inbox/${item.id}`)}>
                <Text style={styles.kind}>{item.kind === 'paste' ? 'Pasted' : 'Note'}</Text>
                <Text style={styles.raw} numberOfLines={5}>
                  {item.rawText}
                </Text>
                {item.suggestedResponsibilities?.length ? (
                  <Text style={styles.suggestion}>
                    Suggested: {item.suggestedResponsibilities.length} responsibilit
                    {item.suggestedResponsibilities.length === 1 ? 'y' : 'ies'}
                  </Text>
                ) : null}
                <View style={styles.actions}>
                  <Pressable onPress={() => router.push(`/inbox/${item.id}`)}>
                    <Text style={styles.actionPrimary}>Review</Text>
                  </Pressable>
                  <Pressable onPress={() => dismissInboxItem(item.id)}>
                    <Text style={styles.actionGhost}>Dismiss</Text>
                  </Pressable>
                </View>
              </Card>
            ))
          )}

          {reviewed.length > 0 && (
            <>
              <SectionLabel>Recently reviewed</SectionLabel>
              {reviewed.map((item) => (
                <Card key={item.id} style={styles.reviewed}>
                  <Text style={styles.raw} numberOfLines={2}>
                    {item.rawText}
                  </Text>
                </Card>
              ))}
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
      <CaptureFab />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  item: { marginBottom: spacing.sm, gap: 8 },
  kind: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  raw: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  suggestion: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  actionPrimary: {
    fontFamily: typography.bodyBold,
    color: colors.accent,
    fontSize: 15,
  },
  actionGhost: {
    fontFamily: typography.bodyMedium,
    color: colors.textMuted,
    fontSize: 15,
  },
  emptyTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  reviewed: {
    marginBottom: spacing.sm,
    opacity: 0.75,
    borderRadius: radii.lg,
  },
});
