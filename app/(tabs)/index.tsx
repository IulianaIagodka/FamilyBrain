import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { CaptureFab } from '@/components/CaptureFab';
import { ResponsibilityCard } from '@/components/ResponsibilityCard';
import { SectionLabel, Subtitle, Title } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';

export default function HomeScreen() {
  const {
    you,
    partner,
    needsAttention,
    mine,
    partners,
    shared,
    unassigned,
    state,
    setViewingAs,
  } = useFamily();

  const viewingLabel = state.viewingAs === 'you' ? you?.name || 'You' : partner?.name || 'Partner';
  const partnerSectionLabel =
    state.viewingAs === 'you' ? partner?.name || 'Partner' : you?.name || 'You';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#E8F1ED', colors.bg]} style={styles.heroWash} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.brand}>FamilyBrain</Text>
          <Title>What needs attention</Title>
          <Subtitle>Responsibilities with clear owners — not another task dump.</Subtitle>

          <View style={styles.viewer}>
            <Text style={styles.viewerLabel}>Viewing as</Text>
            <View style={styles.viewerRow}>
              <Pressable
                onPress={() => setViewingAs('you')}
                style={[styles.viewerChip, state.viewingAs === 'you' && styles.viewerChipActive]}>
                <Text
                  style={[
                    styles.viewerChipText,
                    state.viewingAs === 'you' && styles.viewerChipTextActive,
                  ]}>
                  {you?.name || 'You'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setViewingAs('partner')}
                style={[
                  styles.viewerChip,
                  state.viewingAs === 'partner' && styles.viewerChipActive,
                ]}>
                <Text
                  style={[
                    styles.viewerChipText,
                    state.viewingAs === 'partner' && styles.viewerChipTextActive,
                  ]}>
                  {partner?.name || 'Partner'}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.viewerHint}>Showing {viewingLabel}’s perspective</Text>
          </View>

          <SectionLabel>Needs attention</SectionLabel>
          {needsAttention.length === 0 ? (
            <Text style={styles.empty}>Nothing urgent right now.</Text>
          ) : (
            needsAttention.map((item) => <ResponsibilityCard key={item.id} item={item} />)
          )}

          {unassigned.length > 0 && (
            <>
              <SectionLabel>Nobody owns these yet</SectionLabel>
              {unassigned.map((item) => (
                <ResponsibilityCard key={`u-${item.id}`} item={item} />
              ))}
            </>
          )}

          <SectionLabel>Mine</SectionLabel>
          {mine.length === 0 ? (
            <Text style={styles.empty}>No open responsibilities for you.</Text>
          ) : (
            mine.map((item) => <ResponsibilityCard key={`m-${item.id}`} item={item} />)
          )}

          <SectionLabel>{partnerSectionLabel}</SectionLabel>
          {partners.length === 0 ? (
            <Text style={styles.empty}>Nothing assigned here.</Text>
          ) : (
            partners.map((item) => <ResponsibilityCard key={`p-${item.id}`} item={item} />)
          )}

          <SectionLabel>Shared</SectionLabel>
          {shared.length === 0 ? (
            <Text style={styles.empty}>No shared responsibilities.</Text>
          ) : (
            shared.map((item) => <ResponsibilityCard key={`s-${item.id}`} item={item} />)
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
  heroWash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  brand: {
    fontFamily: typography.display,
    fontSize: 20,
    color: colors.accentDeep,
    marginBottom: spacing.sm,
  },
  viewer: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  viewerLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  viewerRow: { flexDirection: 'row', gap: 8 },
  viewerChip: {
    flex: 1,
    borderRadius: radii.sm,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  viewerChipActive: {
    backgroundColor: colors.accentSoft,
  },
  viewerChipText: {
    fontFamily: typography.bodyMedium,
    color: colors.textSecondary,
  },
  viewerChipTextActive: {
    color: colors.accentDeep,
    fontFamily: typography.bodyBold,
  },
  viewerHint: {
    marginTop: spacing.sm,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  empty: {
    fontFamily: typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
