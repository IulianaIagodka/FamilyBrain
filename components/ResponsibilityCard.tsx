import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Card } from '@/components/ui';
import { OwnerBadge } from '@/components/OwnerBadge';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDueLine } from '@/lib/dates';
import { useFamily } from '@/lib/FamilyContext';
import type { Responsibility } from '@/lib/types';
import { AREA_LABELS } from '@/lib/types';

export function ResponsibilityCard({
  item,
  emphasizeUnassigned,
}: {
  item: Responsibility;
  emphasizeUnassigned?: boolean;
}) {
  const router = useRouter();
  const { ownerLabel } = useFamily();
  const due = formatDueLine(item.dueDate, item.dueLabel);

  return (
    <Card
      style={[
        styles.card,
        item.owner === 'unassigned' && emphasizeUnassigned !== false && styles.unassignedCard,
      ]}
      onPress={() => router.push(`/responsibility/${item.id}`)}>
      <View style={styles.top}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      {due ? <Text style={styles.due}>{due}</Text> : null}
      <View style={styles.bottom}>
        <OwnerBadge owner={item.owner} label={ownerLabel(item.owner)} />
        <Text style={styles.area}>{AREA_LABELS[item.area]}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    gap: 8,
  },
  unassignedCard: {
    borderColor: colors.warning,
    backgroundColor: '#FFFCF8',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    flex: 1,
  },
  due: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  area: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
