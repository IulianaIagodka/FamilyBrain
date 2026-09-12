import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FamilyProvider } from '@/lib/FamilyContext';
import { useOnboardingGate } from '@/lib/useOnboardingGate';
import { colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const ready = useOnboardingGate();

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.accentDeep,
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { fontFamily: 'DMSans_700Bold', fontSize: 17, color: colors.text },
          contentStyle: { backgroundColor: colors.bg },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
        <Stack.Screen name="capture" options={{ presentation: 'modal', title: 'Capture' }} />
        <Stack.Screen name="inbox/[id]" options={{ title: 'Review capture' }} />
        <Stack.Screen name="responsibility/[id]" options={{ title: 'Responsibility' }} />
        <Stack.Screen name="responsibility/edit" options={{ presentation: 'modal', title: 'Edit' }} />
        <Stack.Screen name="family" options={{ title: 'Family' }} />
        <Stack.Screen name="history" options={{ title: 'History' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <FamilyProvider>
      <RootNavigator />
    </FamilyProvider>
  );
}
