import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops' }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen doesn’t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  title: {
    fontFamily: typography.display,
    fontSize: 24,
    color: colors.text,
  },
  link: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkText: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.accent,
  },
});
