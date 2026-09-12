import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useFamily } from '@/lib/FamilyContext';

export function useOnboardingGate() {
  const { ready, state } = useFamily();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = segments[0] === 'onboarding';

    if (!state.onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (state.onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [ready, state.onboardingComplete, segments, router]);

  return ready;
}
