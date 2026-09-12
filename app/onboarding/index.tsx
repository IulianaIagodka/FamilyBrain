import { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SecondaryButton, GhostButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';

const SLIDES = [
  {
    title: 'Your family shouldn’t live in one person’s head.',
    body: 'Stop being the family memory. Share the mental load — not just the calendar.',
  },
  {
    title: 'Capture what needs to happen.',
    body: 'Paste a message, type a note, or drop something in quickly. Organize it later.',
  },
  {
    title: 'Decide who owns it.',
    body: 'Every responsibility needs an owner. Mine, partner, or shared — clearly visible.',
  },
  {
    title: 'Everyone knows what they’re responsible for.',
    body: 'Less reminding. Less invisible planning. More clarity for both of you.',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding, skipWithDemo } = useFamily();
  const [step, setStep] = useState(0);
  const [yourName, setYourName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [childInput, setChildInput] = useState('');
  const [children, setChildren] = useState<string[]>([]);
  const fade = useRef(new Animated.Value(1)).current;

  const go = (next: number) => {
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
    setStep(next);
  };

  const addChild = () => {
    const name = childInput.trim();
    if (!name) return;
    setChildren((prev) => [...prev, name]);
    setChildInput('');
  };

  const finish = () => {
    completeOnboarding({
      yourName: yourName || 'You',
      partnerName: partnerName || 'Partner',
      childrenNames: children,
    });
  };

  const isHousehold = step >= SLIDES.length;

  return (
    <LinearGradient colors={['#E7F0EC', '#F3F6F5', '#F7F5F1']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.brand}>FamilyBrain</Text>

            <Animated.View style={{ opacity: fade }}>
              {!isHousehold ? (
                <View style={styles.slide}>
                  <Text style={styles.title}>{SLIDES[step].title}</Text>
                  <Text style={styles.body}>{SLIDES[step].body}</Text>
                </View>
              ) : (
                <View style={styles.slide}>
                  <Text style={styles.title}>Create your household</Text>
                  <Text style={styles.body}>Add the adults first. Children are optional.</Text>

                  <Text style={styles.label}>Your name</Text>
                  <TextInput
                    value={yourName}
                    onChangeText={setYourName}
                    placeholder="e.g. Sam"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />

                  <Text style={styles.label}>Partner’s name</Text>
                  <TextInput
                    value={partnerName}
                    onChangeText={setPartnerName}
                    placeholder="e.g. Alex"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />

                  <Text style={styles.label}>Children / family members</Text>
                  <View style={styles.row}>
                    <TextInput
                      value={childInput}
                      onChangeText={setChildInput}
                      placeholder="Optional"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { flex: 1, marginBottom: 0 }]}
                      onSubmitEditing={addChild}
                    />
                    <Pressable onPress={addChild} style={styles.addChild}>
                      <Text style={styles.addChildText}>Add</Text>
                    </Pressable>
                  </View>
                  <View style={styles.chips}>
                    {children.map((c) => (
                      <View key={c} style={styles.chip}>
                        <Text style={styles.chipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </Animated.View>

            <View style={styles.dots}>
              {[...SLIDES, null].map((_, i) => (
                <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {!isHousehold ? (
              <>
                <PrimaryButton label="Continue" onPress={() => go(step + 1)} />
                {step === 0 ? (
                  <GhostButton label="Preview with sample family" onPress={skipWithDemo} />
                ) : (
                  <GhostButton label="Back" onPress={() => go(step - 1)} />
                )}
              </>
            ) : (
              <>
                <PrimaryButton label="Start" onPress={finish} />
                <SecondaryButton label="Back" onPress={() => go(SLIDES.length - 1)} />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  brand: {
    fontFamily: typography.display,
    fontSize: 22,
    color: colors.accentDeep,
    marginBottom: spacing.xl,
  },
  slide: { minHeight: 320 },
  title: {
    fontFamily: typography.display,
    fontSize: 34,
    lineHeight: 42,
    color: colors.text,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: typography.body,
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addChild: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  addChildText: {
    fontFamily: typography.bodyBold,
    color: colors.accentDeep,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  chipText: { fontFamily: typography.bodyMedium, color: colors.text },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
  footer: {
    padding: spacing.lg,
    gap: 8,
  },
});
