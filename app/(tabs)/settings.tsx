import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, SectionLabel, Subtitle, Title } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { state, you, partner, children, setViewingAs, resetAll } = useFamily();

  const confirmReset = () => {
    Alert.alert(
      'Reset FamilyBrain?',
      'This clears household data on this device and returns to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Title>Settings</Title>
          <Subtitle>Household, perspective, and history.</Subtitle>

          <SectionLabel>Household</SectionLabel>
          <Card>
            <Text style={styles.household}>{state.household?.name || 'Your household'}</Text>
            <Text style={styles.meta}>
              {[you?.name, partner?.name, ...children.map((c) => c.name)].filter(Boolean).join(' · ')}
            </Text>
            <Pressable onPress={() => router.push('/family')} style={styles.linkBtn}>
              <Text style={styles.link}>Manage family members</Text>
            </Pressable>
          </Card>

          <SectionLabel>Perspective</SectionLabel>
          <Card>
            <Text style={styles.meta}>
              Switch who you are viewing as. Each adult should see what they own — and what their
              partner owns.
            </Text>
            <View style={styles.row}>
              <Pressable
                style={[styles.chip, state.viewingAs === 'you' && styles.chipOn]}
                onPress={() => setViewingAs('you')}>
                <Text style={styles.chipText}>{you?.name || 'You'}</Text>
              </Pressable>
              <Pressable
                style={[styles.chip, state.viewingAs === 'partner' && styles.chipOn]}
                onPress={() => setViewingAs('partner')}>
                <Text style={styles.chipText}>{partner?.name || 'Partner'}</Text>
              </Pressable>
            </View>
          </Card>

          <SectionLabel>History</SectionLabel>
          <Card onPress={() => router.push('/history')}>
            <Text style={styles.link}>Completed responsibilities</Text>
            <Text style={styles.meta}>Helps answer “who usually handles this?” — without scores.</Text>
          </Card>

          <SectionLabel>About</SectionLabel>
          <Card>
            <Text style={styles.promise}>Stop being the family memory.</Text>
            <Text style={styles.meta}>
              Capture first. Structure second. Ownership third. Reminders go to the owner.
            </Text>
          </Card>

          <Pressable onPress={confirmReset} style={styles.reset}>
            <Text style={styles.resetText}>Reset local data</Text>
          </Pressable>
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
  household: {
    fontFamily: typography.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  meta: {
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    marginTop: 6,
  },
  linkBtn: { marginTop: spacing.md },
  link: {
    fontFamily: typography.bodyBold,
    color: colors.accent,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  chip: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chipOn: { backgroundColor: colors.accentSoft },
  chipText: {
    fontFamily: typography.bodyMedium,
    color: colors.text,
  },
  promise: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.accentDeep,
  },
  reset: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.md,
  },
  resetText: {
    fontFamily: typography.bodyMedium,
    color: colors.danger,
  },
});
