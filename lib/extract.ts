import { createId } from '@/lib/id';
import { resolveRelativeDate } from '@/lib/dates';
import type { ExtractionSuggestion, ResponsibilityArea, SuggestedResponsibility } from '@/lib/types';

function detectArea(text: string): ResponsibilityArea {
  const t = text.toLowerCase();
  if (/dentist|doctor|medical|hospital|vaccine|appointment|clinic/.test(t)) return 'medical';
  if (/kindergarten|school|class|teacher|homework|forest trip|performance/.test(t)) return 'school';
  if (/swim|ballet|soccer|football|lesson|practice|club|activity/.test(t)) return 'activities';
  if (/birthday|gift|present/.test(t)) return 'birthdays';
  if (/buy|shop|grocer|tights|shoes|backpack|water|swimsuit|goggles|t-shirt|tshirt/.test(t)) return 'shopping';
  if (/bill|form|pay|confirm|book|register|admin/.test(t)) return 'admin';
  if (/home|clean|laundry|repair|household/.test(t)) return 'home';
  return 'other';
}

function cleanSentence(s: string): string {
  return s.replace(/\s+/g, ' ').trim().replace(/^[-•*]\s*/, '');
}

function titleCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function pushSuggestion(
  list: Omit<SuggestedResponsibility, 'selected'>[],
  title: string,
  source: string,
  dueHint?: string,
) {
  const due = resolveRelativeDate(dueHint || source);
  list.push({
    tempId: createId('sug'),
    title: titleCase(cleanSentence(title)),
    dueDate: due.date || null,
    dueLabel: due.label || null,
    area: detectArea(`${title} ${source}`),
    forMemberIds: [],
  });
}

/**
 * Lightweight heuristic extractor.
 * Suggestions only — never auto-creates responsibilities without confirmation.
 */
export function extractFromText(rawText: string): ExtractionSuggestion {
  const text = rawText.trim();
  const lower = text.toLowerCase();
  const responsibilities: Omit<SuggestedResponsibility, 'selected'>[] = [];

  let eventTitle: string | null = null;
  let eventDateLabel: string | null = null;
  let eventDate: string | null = null;

  // Event detection heuristics
  if (/kindergarten performance|performance/.test(lower)) {
    eventTitle = 'Kindergarten performance';
  } else if (/forest trip|going to the forest/.test(lower)) {
    eventTitle = 'Forest trip';
  } else if (/swimming lesson|swim lesson/.test(lower)) {
    eventTitle = 'Swimming lesson';
  } else if (/dentist/.test(lower)) {
    eventTitle = 'Dentist appointment';
  } else if (/birthday/.test(lower)) {
    eventTitle = 'Birthday';
  }

  const eventDue = resolveRelativeDate(text);
  if (eventDue.date) {
    eventDate = eventDue.date;
    eventDateLabel = eventDue.label || null;
  }

  // Time for events
  const timeMatch = text.match(/\b(\d{1,2}[:.]\d{2})\b/);
  if (timeMatch && eventDateLabel) {
    eventDateLabel = `${eventDateLabel}, ${timeMatch[1].replace('.', ':')}`;
  } else if (timeMatch && eventTitle) {
    eventDateLabel = timeMatch[1].replace('.', ':');
  }

  // Bring / need / prepare patterns
  const bringMatch = text.match(
    /(?:bring|need|needs|needed|prepare|pack|children need|should bring)\s+([^.]+)/i,
  );
  if (bringMatch) {
    const items = bringMatch[1]
      .split(/,| and | & /i)
      .map((part) => cleanSentence(part))
      .filter((part) => part.length > 2 && part.length < 60);

    for (const item of items) {
      const verb = /pack|water|backpack/i.test(item)
        ? 'Pack'
        : /shoe|swimsuit|goggle|t-shirt|tshirt|tight|clothes/i.test(item)
          ? 'Prepare'
          : 'Bring';
      const cleanItem = item
        .replace(/^(waterproof\s+)?/i, (m) => m)
        .replace(/\s+for\s+.*/i, '')
        .replace(/\s+before\s+.*/i, '')
        .replace(/\./g, '');
      pushSuggestion(responsibilities, `${verb} ${cleanItem}`, text, text);
    }
  }

  // Confirm attendance
  if (/confirm attendance|confirm participation|rsvp/i.test(text)) {
    const due = text.match(/by\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|[A-Za-z]+\s+\d{1,2})/i);
    pushSuggestion(
      responsibilities,
      'Confirm attendance',
      text,
      due ? due[0] : text,
    );
  }

  // Pay patterns
  const payMatch = text.match(/pay\s+([\d\s.,]+(?:\s*(?:zł|pln|eur|usd|\$))?)\s*(?:before|by)?\s*([^.]*)/i);
  if (payMatch || /\bpay\b/i.test(text)) {
    const amount = payMatch?.[1]?.trim();
    const dueBit = payMatch?.[2] || text;
    pushSuggestion(
      responsibilities,
      amount ? `Pay ${amount}` : 'Make payment',
      text,
      dueBit,
    );
  }

  // Book patterns
  if (/\bbook\b/i.test(text)) {
    const bookMatch = text.match(/book\s+([^.!?]+)/i);
    pushSuggestion(responsibilities, bookMatch ? `Book ${cleanSentence(bookMatch[1])}` : 'Book appointment', text, text);
  }

  // Buy patterns (standalone)
  if (/\bbuy\b/i.test(text) && responsibilities.length === 0) {
    const buyMatch = text.match(/buy\s+([^.!?]+)/i);
    pushSuggestion(responsibilities, buyMatch ? `Buy ${cleanSentence(buyMatch[1])}` : 'Buy item', text, text);
  }

  // Fallback: if nothing extracted, suggest a single responsibility from first sentence
  if (responsibilities.length === 0 && text.length > 0) {
    const first = cleanSentence(text.split(/[.!\n]/)[0] || text).slice(0, 80);
    pushSuggestion(responsibilities, first, text, text);
    if (!eventTitle) {
      eventTitle = first.length > 40 ? `${first.slice(0, 37)}…` : first;
    }
  }

  // Deduplicate similar titles
  const seen = new Set<string>();
  const unique = responsibilities.filter((r) => {
    const key = r.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    eventTitle,
    eventDateLabel,
    eventDate,
    responsibilities: unique,
  };
}

export function suggestionsFromExtraction(
  extraction: ExtractionSuggestion,
): SuggestedResponsibility[] {
  return extraction.responsibilities.map((r) => ({ ...r, selected: true }));
}
