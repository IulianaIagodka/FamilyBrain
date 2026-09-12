import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppState } from '@/lib/types';

const STORAGE_KEY = 'familybrain.state.v1';

export const emptyState = (): AppState => ({
  onboardingComplete: false,
  household: null,
  members: [],
  responsibilities: [],
  inbox: [],
  viewingAs: 'you',
});

export async function loadState(): Promise<AppState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
