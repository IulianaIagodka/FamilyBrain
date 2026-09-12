import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createId } from '@/lib/id';
import { extractFromText, suggestionsFromExtraction } from '@/lib/extract';
import { buildDemoState } from '@/lib/sample';
import { clearState, emptyState, loadState, saveState } from '@/lib/storage';
import { MEMBER_COLORS } from '@/constants/theme';
import type {
  AppState,
  CaptureKind,
  FamilyMember,
  InboxItem,
  Ownership,
  Responsibility,
  ResponsibilityArea,
  ResponsibilityStatus,
  SuggestedResponsibility,
} from '@/lib/types';

interface CreateHouseholdInput {
  yourName: string;
  partnerName: string;
  childrenNames?: string[];
}

interface CreateResponsibilityInput {
  title: string;
  owner?: Ownership;
  dueDate?: string | null;
  dueLabel?: string | null;
  area?: ResponsibilityArea;
  sourceText?: string | null;
  notes?: string | null;
  forMemberIds?: string[];
  inboxItemId?: string | null;
}

interface FamilyContextValue {
  ready: boolean;
  state: AppState;
  you: FamilyMember | undefined;
  partner: FamilyMember | undefined;
  adults: FamilyMember[];
  children: FamilyMember[];
  openResponsibilities: Responsibility[];
  needsAttention: Responsibility[];
  mine: Responsibility[];
  partners: Responsibility[];
  shared: Responsibility[];
  unassigned: Responsibility[];
  ownerLabel: (owner: Ownership) => string;
  completeOnboarding: (input: CreateHouseholdInput) => void;
  skipWithDemo: () => void;
  setViewingAs: (who: 'you' | 'partner') => void;
  addInboxItem: (rawText: string, kind?: CaptureKind) => InboxItem;
  updateInboxItem: (id: string, patch: Partial<InboxItem>) => void;
  dismissInboxItem: (id: string) => void;
  prepareInboxSuggestions: (item: InboxItem) => SuggestedResponsibility[];
  confirmInboxSuggestions: (
    item: InboxItem,
    suggestions: SuggestedResponsibility[],
    eventTitle?: string | null,
    owners?: Record<string, Ownership>,
  ) => void;
  addResponsibility: (input: CreateResponsibilityInput) => Responsibility;
  updateResponsibility: (id: string, patch: Partial<Responsibility>) => void;
  setOwnership: (id: string, owner: Ownership) => void;
  setStatus: (id: string, status: ResponsibilityStatus) => void;
  deleteResponsibility: (id: string) => void;
  addMember: (name: string, role: FamilyMember['role']) => void;
  updateMember: (id: string, patch: Partial<FamilyMember>) => void;
  removeMember: (id: string) => void;
  resetAll: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

function sortByDue(a: Responsibility, b: Responsibility): number {
  if (a.owner === 'unassigned' && b.owner !== 'unassigned') return -1;
  if (b.owner === 'unassigned' && a.owner !== 'unassigned') return 1;
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return a.title.localeCompare(b.title);
}

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(emptyState());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadState();
      if (mounted) {
        if (loaded) setState(loaded);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState(state).catch(() => undefined);
  }, [state, ready]);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => updater(prev));
  }, []);

  const you = state.members.find((m) => m.role === 'you');
  const partner = state.members.find((m) => m.role === 'partner');
  const adults = state.members.filter((m) => m.role === 'you' || m.role === 'partner');
  const childMembers = state.members.filter((m) => m.role === 'child' || m.role === 'other');

  const openResponsibilities = useMemo(
    () => state.responsibilities.filter((r) => r.status === 'open').sort(sortByDue),
    [state.responsibilities],
  );

  const perspectiveOwner = state.viewingAs === 'you' ? 'me' : 'partner';
  const otherOwner = state.viewingAs === 'you' ? 'partner' : 'me';

  const needsAttention = useMemo(() => {
    return openResponsibilities
      .filter((r) => {
        if (r.owner === 'unassigned') return true;
        if (!r.dueDate) return false;
        const due = new Date(r.dueDate).getTime();
        const week = Date.now() + 7 * 24 * 60 * 60 * 1000;
        return due <= week;
      })
      .slice(0, 8);
  }, [openResponsibilities]);

  const mine = openResponsibilities.filter((r) => r.owner === perspectiveOwner);
  const partners = openResponsibilities.filter((r) => r.owner === otherOwner);
  const shared = openResponsibilities.filter((r) => r.owner === 'shared');
  const unassigned = openResponsibilities.filter((r) => r.owner === 'unassigned');

  const ownerLabel = useCallback(
    (owner: Ownership) => {
      if (owner === 'me') return you?.name || 'You';
      if (owner === 'partner') return partner?.name || 'Partner';
      if (owner === 'shared') return 'Shared';
      return 'Nobody owns this yet';
    },
    [you, partner],
  );

  const completeOnboarding = useCallback(
    (input: CreateHouseholdInput) => {
      const members: FamilyMember[] = [
        { id: 'member_you', name: input.yourName.trim() || 'You', role: 'you', color: MEMBER_COLORS[0] },
        {
          id: 'member_partner',
          name: input.partnerName.trim() || 'Partner',
          role: 'partner',
          color: MEMBER_COLORS[1],
        },
        ...(input.childrenNames || [])
          .map((n) => n.trim())
          .filter(Boolean)
          .map((name, index) => ({
            id: createId('member'),
            name,
            role: 'child' as const,
            color: MEMBER_COLORS[(index + 2) % MEMBER_COLORS.length],
          })),
      ];

      setState({
        onboardingComplete: true,
        household: {
          id: createId('household'),
          name: `${members[0].name} & ${members[1].name}`,
          createdAt: new Date().toISOString(),
        },
        members,
        responsibilities: [],
        inbox: [],
        viewingAs: 'you',
      });
    },
    [],
  );

  const skipWithDemo = useCallback(() => {
    setState(buildDemoState('You', 'Alex'));
  }, []);

  const setViewingAs = useCallback((who: 'you' | 'partner') => {
    update((prev) => ({ ...prev, viewingAs: who }));
  }, [update]);

  const addInboxItem = useCallback(
    (rawText: string, kind: CaptureKind = 'text') => {
      const item: InboxItem = {
        id: createId('inbox'),
        rawText: rawText.trim(),
        kind,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      const extraction = extractFromText(item.rawText);
      item.suggestedEventTitle = extraction.eventTitle;
      item.suggestedEventDate = extraction.eventDate;
      item.suggestedResponsibilities = suggestionsFromExtraction(extraction);

      update((prev) => ({ ...prev, inbox: [item, ...prev.inbox] }));
      return item;
    },
    [update],
  );

  const updateInboxItem = useCallback(
    (id: string, patch: Partial<InboxItem>) => {
      update((prev) => ({
        ...prev,
        inbox: prev.inbox.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }));
    },
    [update],
  );

  const dismissInboxItem = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        inbox: prev.inbox.map((i) => (i.id === id ? { ...i, status: 'dismissed' as const } : i)),
      }));
    },
    [update],
  );

  const prepareInboxSuggestions = useCallback((item: InboxItem) => {
    if (item.suggestedResponsibilities?.length) return item.suggestedResponsibilities;
    const extraction = extractFromText(item.rawText);
    return suggestionsFromExtraction(extraction);
  }, []);

  const confirmInboxSuggestions = useCallback(
    (
      item: InboxItem,
      suggestions: SuggestedResponsibility[],
      eventTitle?: string | null,
      owners?: Record<string, Ownership>,
    ) => {
      const now = new Date().toISOString();
      const selected = suggestions.filter((s) => s.selected);
      const created: Responsibility[] = selected.map((s) => ({
        id: createId('resp'),
        title: s.title.trim(),
        owner: owners?.[s.tempId] || 'unassigned',
        status: 'open',
        dueDate: s.dueDate || null,
        dueLabel: s.dueLabel || null,
        area: s.area,
        sourceText: item.rawText,
        notes: eventTitle ? `Related: ${eventTitle}` : null,
        forMemberIds: s.forMemberIds,
        inboxItemId: item.id,
        createdAt: now,
        updatedAt: now,
      }));

      update((prev) => ({
        ...prev,
        responsibilities: [...created, ...prev.responsibilities],
        inbox: prev.inbox.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'reviewed' as const,
                suggestedResponsibilities: suggestions,
                suggestedEventTitle: eventTitle ?? i.suggestedEventTitle,
              }
            : i,
        ),
      }));
    },
    [update],
  );

  const addResponsibility = useCallback(
    (input: CreateResponsibilityInput) => {
      const now = new Date().toISOString();
      const responsibility: Responsibility = {
        id: createId('resp'),
        title: input.title.trim(),
        owner: input.owner || 'unassigned',
        status: 'open',
        dueDate: input.dueDate || null,
        dueLabel: input.dueLabel || null,
        area: input.area || 'other',
        sourceText: input.sourceText || null,
        notes: input.notes || null,
        forMemberIds: input.forMemberIds || [],
        inboxItemId: input.inboxItemId || null,
        createdAt: now,
        updatedAt: now,
      };
      update((prev) => ({
        ...prev,
        responsibilities: [responsibility, ...prev.responsibilities],
      }));
      return responsibility;
    },
    [update],
  );

  const updateResponsibility = useCallback(
    (id: string, patch: Partial<Responsibility>) => {
      update((prev) => ({
        ...prev,
        responsibilities: prev.responsibilities.map((r) =>
          r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
        ),
      }));
    },
    [update],
  );

  const setOwnership = useCallback(
    (id: string, owner: Ownership) => {
      updateResponsibility(id, { owner });
    },
    [updateResponsibility],
  );

  const setStatus = useCallback(
    (id: string, status: ResponsibilityStatus) => {
      update((prev) => ({
        ...prev,
        responsibilities: prev.responsibilities.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            status,
            updatedAt: new Date().toISOString(),
            completedAt: status === 'done' ? new Date().toISOString() : null,
            completedBy: status === 'done' ? r.owner : null,
          };
        }),
      }));
    },
    [update],
  );

  const deleteResponsibility = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        responsibilities: prev.responsibilities.filter((r) => r.id !== id),
      }));
    },
    [update],
  );

  const addMember = useCallback(
    (name: string, role: FamilyMember['role']) => {
      update((prev) => ({
        ...prev,
        members: [
          ...prev.members,
          {
            id: createId('member'),
            name: name.trim(),
            role,
            color: MEMBER_COLORS[prev.members.length % MEMBER_COLORS.length],
          },
        ],
      }));
    },
    [update],
  );

  const updateMember = useCallback(
    (id: string, patch: Partial<FamilyMember>) => {
      update((prev) => ({
        ...prev,
        members: prev.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      }));
    },
    [update],
  );

  const removeMember = useCallback(
    (id: string) => {
      update((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== id),
        responsibilities: prev.responsibilities.map((r) => ({
          ...r,
          forMemberIds: r.forMemberIds.filter((mid) => mid !== id),
        })),
      }));
    },
    [update],
  );

  const resetAll = useCallback(async () => {
    await clearState();
    setState(emptyState());
  }, []);

  const value: FamilyContextValue = {
    ready,
    state,
    you,
    partner,
    adults,
    children: childMembers,
    openResponsibilities,
    needsAttention,
    mine,
    partners,
    shared,
    unassigned,
    ownerLabel,
    completeOnboarding,
    skipWithDemo,
    setViewingAs,
    addInboxItem,
    updateInboxItem,
    dismissInboxItem,
    prepareInboxSuggestions,
    confirmInboxSuggestions,
    addResponsibility,
    updateResponsibility,
    setOwnership,
    setStatus,
    deleteResponsibility,
    addMember,
    updateMember,
    removeMember,
    resetAll,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
