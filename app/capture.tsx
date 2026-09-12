import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useFamily } from '@/lib/FamilyContext';
import type { CaptureKind } from '@/lib/types';

const MODES: { kind: CaptureKind; label: string; icon: keyof typeof Ionicons.glyphMap; hint: string }[] = [
  { kind: 'text', label: 'Type', icon: 'create-outline', hint: 'Quick note' },
  { kind: 'paste', label: 'Paste', icon: 'clipboard-outline', hint: 'From messages or email' },
  { kind: 'photo', label: 'Photo', icon: 'image-outline', hint: 'Coming soon' },
  { kind: 'voice', label: 'Voice', icon: 'mic-outline', hint: 'Coming soon' },
];

export default function CaptureModal() {
  const router = useRouter();
  const { addInboxItem } = useFamily();
  const [kind, setKind] = useState<CaptureKind>('text');
  const [text, setText] = useState('');

  const handlePaste = async () => {
    setKind('paste');
    const clip = await Clipboard.getStringAsync();
    if (clip) setText(clip);
  };

  const save = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item = addInboxItem(trimmed, kind === 'paste' ? 'paste' : 'text');
    router.replace(`/inbox/${item.id}`);
  };

  const comingSoon = (label: string) => {
    Alert.alert(
      `${label} is next`,
      'This version prioritizes text and paste. Photo and voice will plug into the same inbox flow.',
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.lead}>
        Capture first. You don’t need to decide if this is a task, event, or reminder yet.
      </Text>

      <View style={styles.modes}>
        {MODES.map((mode) => {
          const disabled = mode.kind === 'photo' || mode.kind === 'voice';
          const active = kind === mode.kind;
          return (
            <Pressable
              key={mode.kind}
              onPress={() => {
                if (mode.kind === 'paste') {
                  handlePaste();
                  return;
                }
                if (disabled) {
                  comingSoon(mode.label);
                  return;
                }
                setKind(mode.kind);
              }}
              style={[styles.mode, active && styles.modeActive, disabled && styles.modeDisabled]}>
              <Ionicons
                name={mode.icon}
                size={22}
                color={active ? colors.accentDeep : colors.textSecondary}
              />
              <Text style={[styles.modeLabel, active && styles.modeLabelActive]}>{mode.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Paste a kindergarten message, email, or type what’s on your mind…"
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        style={styles.input}
        autoFocus
      />

      <View style={styles.footer}>
        <PrimaryButton label="Save to Inbox" onPress={save} disabled={!text.trim()} />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
  },
  lead: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  mode: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  modeActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  modeDisabled: {
    opacity: 0.55,
  },
  modeLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  modeLabelActive: {
    color: colors.accentDeep,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontFamily: typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    minHeight: 180,
  },
  footer: {
    gap: 8,
    marginTop: spacing.md,
  },
});
