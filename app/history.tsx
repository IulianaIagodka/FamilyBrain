import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { format, parseISO } from 'date-fns';

import { Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';
import { AREA_LABELS } from '@/lib/types';

export default function HistoryScreen() {
  const { state, ownerLabel } = useFamily();
  const done = state.responsibilities
    .filter((r) => r.status === 'done')
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>
        A quiet history of what got done — helpful for noticing patterns, not keeping score.
      </Text>

      {done.length === 0 ? (
        <Text style={styles.empty}>No completed responsibilities yet.</Text>
      ) : (
        done.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              Owner {ownerLabel(item.owner)} · {AREA_LABELS[item.area]}
            </Text>
            {item.completedAt ? (
              <Text style={styles.meta}>
                Done {format(parseISO(item.completedAt), 'MMM d, yyyy')}
              </Text>
            ) : null}
          </Card>
        ))
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  lead: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  empty: {
    fontFamily: typography.body,
    color: colors.textMuted,
  },
  card: { marginBottom: spacing.sm, gap: 4 },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
