import { addDays, startOfDay } from 'date-fns';

import { createId } from '@/lib/id';
import type { AppState, FamilyMember, Responsibility } from '@/lib/types';

export function buildDemoState(youName = 'You', partnerName = 'Alex'): AppState {
  const you: FamilyMember = {
    id: 'member_you',
    name: youName,
    role: 'you',
    color: '#2F6F5E',
  };
  const partner: FamilyMember = {
    id: 'member_partner',
    name: partnerName,
    role: 'partner',
    color: '#7A5C8A',
  };
  const aurora: FamilyMember = {
    id: 'member_aurora',
    name: 'Aurora',
    role: 'child',
    color: '#3D6B8A',
  };
  const ursula: FamilyMember = {
    id: 'member_ursula',
    name: 'Ursula',
    role: 'child',
    color: '#C47B4A',
  };

  const now = new Date();
  const iso = (d: Date) => startOfDay(d).toISOString();

  const responsibilities: Responsibility[] = [
    {
      id: createId('resp'),
      title: 'Confirm kindergarten attendance',
      owner: 'partner',
      status: 'open',
      dueDate: iso(addDays(now, 1)),
      dueLabel: 'Tomorrow',
      area: 'school',
      sourceText:
        'Next Friday children should bring white T-shirts for the kindergarten performance. Parents need to confirm attendance by Wednesday.',
      notes: null,
      forMemberIds: [aurora.id, ursula.id],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: createId('resp'),
      title: 'Book dentist for Ursula',
      owner: 'me',
      status: 'open',
      dueDate: iso(addDays(now, 13)),
      dueLabel: null,
      area: 'medical',
      sourceText: 'Ursula is due for a checkup.',
      notes: 'Prefer afternoon slots',
      forMemberIds: [ursula.id],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: createId('resp'),
      title: 'Buy ballet tights',
      owner: 'partner',
      status: 'open',
      dueDate: iso(addDays(now, 30)),
      dueLabel: 'Before Oct 12',
      area: 'activities',
      sourceText: 'Ballet recital coming up — need new tights.',
      notes: null,
      forMemberIds: [aurora.id],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: createId('resp'),
      title: 'Bring white T-shirts',
      owner: 'shared',
      status: 'open',
      dueDate: iso(addDays(now, 5)),
      dueLabel: 'Friday',
      area: 'school',
      sourceText:
        'Next Friday children should bring white T-shirts for the kindergarten performance.',
      notes: null,
      forMemberIds: [aurora.id, ursula.id],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: createId('resp'),
      title: 'Pay swimming lesson fee 180 zł',
      owner: 'unassigned',
      status: 'open',
      dueDate: iso(addDays(now, 2)),
      dueLabel: 'Monday',
      area: 'activities',
      sourceText:
        'Reminder: swimming lesson is Tuesday at 17:30. Children need swimsuits and goggles. Please pay 180 zł before Monday.',
      notes: null,
      forMemberIds: [aurora.id, ursula.id],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: createId('resp'),
      title: 'Prepare swimsuits and goggles',
      owner: 'me',
      status: 'open',
      dueDate: iso(addDays(now, 3)),
      dueLabel: 'Tuesday',
      area: 'activities',
      sourceText: 'Swimming lesson Tuesday 17:30',
      notes: null,
      forMemberIds: [aurora.id, ursula.id],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: createId('resp'),
      title: 'Order birthday gift for grandparents',
      owner: 'shared',
      status: 'done',
      dueDate: iso(addDays(now, -4)),
      area: 'birthdays',
      sourceText: null,
      notes: null,
      forMemberIds: [],
      createdAt: addDays(now, -10).toISOString(),
      updatedAt: addDays(now, -3).toISOString(),
      completedAt: addDays(now, -3).toISOString(),
      completedBy: 'shared',
    },
  ];

  return {
    onboardingComplete: true,
    household: {
      id: 'household_demo',
      name: `${youName} & ${partnerName}`,
      createdAt: now.toISOString(),
    },
    members: [you, partner, aurora, ursula],
    responsibilities,
    inbox: [
      {
        id: createId('inbox'),
        rawText:
          'Parents: on September 18 we are going to the forest. Children need waterproof shoes, a backpack and water.',
        kind: 'paste',
        status: 'new',
        createdAt: now.toISOString(),
      },
    ],
    viewingAs: 'you',
  };
}
