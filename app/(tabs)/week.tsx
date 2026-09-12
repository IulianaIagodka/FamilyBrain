import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';

import { CaptureFab } from '@/components/CaptureFab';
import { Card, SectionLabel, Subtitle, Title } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { inCurrentWeek, weekdayHeading } from '@/lib/dates';
import { useFamily } from '@/lib/FamilyContext';

export default function WeekScreen() {
  const { mine, partners, shared, openResponsibilities, you, partner, ownerLabel } = useFamily();

  const upcoming = openResponsibilities
    .filter((r) => r.dueDate && inCurrentWeek(r.dueDate))
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

  const grouped: Record<string, typeof upcoming> = {};
  for (const item of upcoming) {
    const key = item.dueDate ? weekdayHeading(item.dueDate) : 'Soon';
    grouped[key] = grouped[key] || [];
    grouped[key].push(item);
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title>This week</Title>
          <Subtitle>Visibility into who is carrying what — not a score.</Subtitle>

          <View style={styles.stats}>
            <Card style={styles.stat}>
              <Text style={styles.statNum}>{mine.length}</Text>
              <Text style={styles.statLabel}>{you?.name || 'You'}</Text>
            </Card>
            <Card style={styles.stat}>
              <Text style={styles.statNum}>{partners.length}</Text>
              <Text style={styles.statLabel}>{partner?.name || 'Partner'}</Text>
            </Card>
            <Card style={styles.stat}>
              <Text style={styles.statNum}>{shared.length}</Text>
              <Text style={styles.statLabel}>Shared</Text>
            </Card>
          </View>

          <SectionLabel>Upcoming</SectionLabel>
          {upcoming.length === 0 ? (
            <Text style={styles.empty}>No dated responsibilities this week.</Text>
          ) : (
            Object.entries(grouped).map(([day, items]) => (
              <View key={day} style={styles.dayBlock}>
                <Text style={styles.day}>{day}</Text>
                {items.map((item) => (
                  <Card key={item.id} style={styles.row}>
                    <Text style={styles.rowTitle}>{item.title}</Text>
                    <Text style={styles.rowMeta}>
                      Owner {ownerLabel(item.owner)}
                      {item.dueDate ? ` · ${format(parseISO(item.dueDate), 'MMM d')}` : ''}
                    </Text>
                  </Card>
                ))}
              </View>
            ))
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
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statNum: {
    fontFamily: typography.display,
    fontSize: 28,
    color: colors.accentDeep,
  },
  statLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  dayBlock: { marginBottom: spacing.md },
  day: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: { marginBottom: spacing.sm, gap: 4 },
  rowTitle: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  rowMeta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  empty: {
    fontFamily: typography.body,
    color: colors.textMuted,
  },
});
