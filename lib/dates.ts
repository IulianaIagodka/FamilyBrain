import {
  addDays,
  format,
  isBefore,
  isSameDay,
  isThisWeek,
  isToday,
  isTomorrow,
  nextDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';

const WEEKDAY_MAP: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function formatDueLabel(dueDate?: string | null, fallback?: string | null): string {
  if (!dueDate) return fallback || '';
  try {
    const date = parseISO(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  } catch {
    return fallback || '';
  }
}

export function formatDueLine(dueDate?: string | null, fallback?: string | null): string {
  const label = formatDueLabel(dueDate, fallback);
  if (!label) return '';
  if (label === 'Today' || label === 'Tomorrow') return `Due ${label.toLowerCase()}`;
  if (fallback && !dueDate) return fallback.startsWith('Before') || fallback.startsWith('Due') ? fallback : `Due ${fallback}`;
  return `Due ${label}`;
}

export function resolveRelativeDate(text: string, from = new Date()): { date?: string; label?: string } {
  const lower = text.toLowerCase();

  if (/\btoday\b/.test(lower)) {
    return { date: startOfDay(from).toISOString(), label: 'Today' };
  }
  if (/\btomorrow\b/.test(lower)) {
    return { date: startOfDay(addDays(from, 1)).toISOString(), label: 'Tomorrow' };
  }

  const nextWeekday = lower.match(/\b(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (nextWeekday) {
    const day = WEEKDAY_MAP[nextWeekday[1]];
    let date = nextDay(from, day as 0 | 1 | 2 | 3 | 4 | 5 | 6);
    if (/\bnext\b/.test(nextWeekday[0]) && isSameDay(date, addDays(startOfWeek(from), day))) {
      date = addDays(date, 7);
    }
    // If "Friday" and today is before Friday this week, nextDay works.
    // If the match includes "next", prefer next occurrence after this week when needed.
    if (/\bnext\b/.test(nextWeekday[0])) {
      const thisWeekSame = nextDay(addDays(from, -1), day as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      if (isSameDay(date, thisWeekSame) || date <= from) {
        date = addDays(date, 7);
      }
    }
    return { date: startOfDay(date).toISOString(), label: format(date, 'EEEE, MMM d') };
  }

  const monthDay = lower.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})\b/,
  );
  if (monthDay) {
    const months: Record<string, number> = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };
    const month = months[monthDay[1]];
    const dayNum = Number(monthDay[2]);
    let date = new Date(from.getFullYear(), month, dayNum);
    if (isBefore(date, startOfDay(from))) {
      date = new Date(from.getFullYear() + 1, month, dayNum);
    }
    return { date: startOfDay(date).toISOString(), label: format(date, 'MMM d') };
  }

  const shortMonth = lower.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+(\d{1,2})\b/,
  );
  if (shortMonth) {
    const months: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      sept: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = months[shortMonth[1]];
    const dayNum = Number(shortMonth[2]);
    let date = new Date(from.getFullYear(), month, dayNum);
    if (isBefore(date, startOfDay(from))) {
      date = new Date(from.getFullYear() + 1, month, dayNum);
    }
    return { date: startOfDay(date).toISOString(), label: format(date, 'MMM d') };
  }

  return {};
}

export function isDueSoon(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  try {
    const date = parseISO(dueDate);
    const limit = addDays(startOfDay(new Date()), 7);
    return date <= limit;
  } catch {
    return false;
  }
}

export function isOverdue(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  try {
    const date = parseISO(dueDate);
    return isBefore(date, startOfDay(new Date()));
  } catch {
    return false;
  }
}

export function inCurrentWeek(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  try {
    return isThisWeek(parseISO(dueDate), { weekStartsOn: 1 });
  } catch {
    return false;
  }
}

export function weekdayHeading(dueDate: string): string {
  try {
    const date = parseISO(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE');
  } catch {
    return 'Upcoming';
  }
}
