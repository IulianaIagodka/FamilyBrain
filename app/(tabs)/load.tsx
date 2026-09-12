import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SectionLabel, Subtitle, Title } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';
import { summarizeMentalLoad } from '@/lib/mentalLoad';

const BALANCE_COLORS = {
  mostly_you: { bg: colors.meSoft, fg: colors.me },
  mostly_partner: { bg: colors.partnerSoft, fg: colors.partner },
  shared: { bg: colors.sharedSoft, fg: colors.shared },
  unassigned: { bg: colors.unassignedSoft, fg: colors.unassigned },
  none: { bg: colors.surfaceMuted, fg: colors.textMuted },
};

export default function MentalLoadScreen() {
  const { openResponsibilities, you, partner } = useFamily();
  const summaries = summarizeMentalLoad(
    openResponsibilities,
    you?.name || 'You',
    partner?.name || 'Partner',
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title>Mental load</Title>
          <Subtitle>
            A calm view of who currently carries each area. This is visibility — not a competition.
          </Subtitle>

          <SectionLabel>Areas of responsibility</SectionLabel>
          {summaries.map((area) => {
            const tone = BALANCE_COLORS[area.balance];
            return (
              <Card key={area.area} style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.area}>{area.label}</Text>
                    <Text style={styles.count}>
                      {area.total === 0
                        ? 'No open responsibilities'
                        : `${area.total} open`}
                    </Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.pillText, { color: tone.fg }]}>{area.balanceLabel}</Text>
                  </View>
                </View>
              </Card>
            );
          })}

          <Text style={styles.footnote}>
            No scores. No leaderboards. Just enough clarity to share the load.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  area: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  count: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  pill: {
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  footnote: {
    marginTop: spacing.lg,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
  },
});
