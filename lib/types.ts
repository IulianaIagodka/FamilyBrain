export type MemberRole = 'you' | 'partner' | 'child' | 'other';

export type Ownership = 'me' | 'partner' | 'shared' | 'unassigned';

export type ResponsibilityStatus = 'open' | 'done' | 'archived';

export type ResponsibilityArea =
  | 'school'
  | 'medical'
  | 'activities'
  | 'home'
  | 'shopping'
  | 'admin'
  | 'birthdays'
  | 'other';

export type InboxStatus = 'new' | 'reviewed' | 'dismissed';

export type CaptureKind = 'text' | 'paste' | 'photo' | 'voice';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  color: string;
}

export interface Household {
  id: string;
  name: string;
  createdAt: string;
}

export interface Responsibility {
  id: string;
  title: string;
  owner: Ownership;
  status: ResponsibilityStatus;
  dueDate?: string | null;
  dueLabel?: string | null;
  area: ResponsibilityArea;
  sourceText?: string | null;
  notes?: string | null;
  forMemberIds: string[];
  inboxItemId?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  completedBy?: Ownership | null;
}

export interface InboxItem {
  id: string;
  rawText: string;
  kind: CaptureKind;
  status: InboxStatus;
  createdAt: string;
  suggestedEventTitle?: string | null;
  suggestedEventDate?: string | null;
  suggestedResponsibilities?: SuggestedResponsibility[];
}

export interface SuggestedResponsibility {
  tempId: string;
  title: string;
  dueDate?: string | null;
  dueLabel?: string | null;
  area: ResponsibilityArea;
  forMemberIds: string[];
  selected: boolean;
}

export interface ExtractionSuggestion {
  eventTitle?: string | null;
  eventDateLabel?: string | null;
  eventDate?: string | null;
  responsibilities: Omit<SuggestedResponsibility, 'selected'>[];
}

export interface AppState {
  onboardingComplete: boolean;
  household: Household | null;
  members: FamilyMember[];
  responsibilities: Responsibility[];
  inbox: InboxItem[];
  viewingAs: 'you' | 'partner';
}

export const AREA_LABELS: Record<ResponsibilityArea, string> = {
  school: 'School & kindergarten',
  medical: 'Medical',
  activities: 'Activities',
  home: 'Home',
  shopping: 'Shopping',
  admin: 'Family admin',
  birthdays: 'Birthdays & gifts',
  other: 'Other',
};

export const OWNERSHIP_LABELS: Record<Ownership, string> = {
  me: 'You',
  partner: 'Partner',
  shared: 'Shared',
  unassigned: 'Nobody owns this yet',
};
