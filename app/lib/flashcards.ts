/** Free browser-local flashcard scheduling. No AI calls or student data uploads. */
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  deck: string;
  createdAt: string;
  dueAt: string;
  repetitions: number;
  intervalDays: number;
  ease: number;
  lapses: number;
};

export const MAX_FLASHCARDS = 300;
export const MAX_FRONT_LENGTH = 280;
export const MAX_BACK_LENGTH = 1400;
export const MAX_DECK_LENGTH = 70;
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const DAY_MS = 24 * 60 * 60 * 1000;
const AGAIN_MS = 10 * 60 * 1000;

function boundedInt(value: unknown, fallback: number, max: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max
    ? value : fallback;
}

function validIso(value: unknown, fallback: string): string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString() : fallback;
}

export function createFlashcard(
  id: string, front: string, back: string, deck = 'General', now = Date.now(),
): Flashcard | null {
  const question = front.trim();
  const answer = back.trim();
  const group = deck.trim() || 'General';
  if (!id || id.length > 100 || !Number.isFinite(now) ||
      !question || question.length > MAX_FRONT_LENGTH ||
      !answer || answer.length > MAX_BACK_LENGTH || group.length > MAX_DECK_LENGTH) return null;
  const timestamp = new Date(now).toISOString();
  return {
    id, front: question, back: answer, deck: group,
    createdAt: timestamp, dueAt: timestamp,
    repetitions: 0, intervalDays: 0, ease: 2.5, lapses: 0,
  };
}

/** Validate locally stored and imported JSON before rendering it. */
export function sanitizeFlashcards(value: unknown): Flashcard[] {
  if (!Array.isArray(value)) return [];
  const cards: Flashcard[] = [];
  const ids = new Set<string>();
  const fallback = new Date().toISOString();

  for (const entry of value.slice(0, MAX_FLASHCARDS)) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const item = entry as Record<string, unknown>;
    if (typeof item.id !== 'string' || typeof item.front !== 'string' ||
        typeof item.back !== 'string' || typeof item.deck !== 'string') continue;
    const id = item.id.trim().slice(0, 100);
    const front = item.front.trim();
    const back = item.back.trim();
    const deck = item.deck.trim() || 'General';
    if (!id || ids.has(id) || !front || front.length > MAX_FRONT_LENGTH ||
        !back || back.length > MAX_BACK_LENGTH || deck.length > MAX_DECK_LENGTH) continue;
    ids.add(id);
    cards.push({
      id, front, back, deck,
      createdAt: validIso(item.createdAt, fallback),
      dueAt: validIso(item.dueAt, fallback),
      repetitions: boundedInt(item.repetitions, 0, 10000),
      intervalDays: boundedInt(item.intervalDays, 0, 3650),
      ease: typeof item.ease === 'number' && Number.isFinite(item.ease)
        ? Math.min(MAX_EASE, Math.max(MIN_EASE, item.ease)) : 2.5,
      lapses: boundedInt(item.lapses, 0, 10000),
    });
  }
  return cards;
}

/** Cards are due as soon as their dueAt timestamp is at or before now. */
export function dueFlashcards(
  cards: readonly Flashcard[], now = Date.now(), deck = 'all',
): Flashcard[] {
  return cards
    .filter(card => (deck === 'all' || card.deck === deck) && Date.parse(card.dueAt) <= now)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt) || a.id.localeCompare(b.id));
}

/**
 * Small, transparent spaced review model: Again in 10 min; Hard in >=1 day;
 * Good 1/3 days then ease-scaled; Easy 3/6 days then accelerated.
 * This is a simple heuristic, not FSRS or a prediction of memory retention.
 */
export function scheduleFlashcard(
  card: Flashcard, rating: ReviewRating, now = Date.now(),
): Flashcard {
  let repetitions = card.repetitions + 1;
  let lapses = card.lapses;
  let intervalDays: number;
  let ease = card.ease;
  if (rating === 'again') {
    repetitions = 0;
    lapses += 1;
    intervalDays = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
  } else if (rating === 'hard') {
    intervalDays = Math.max(1, Math.round(Math.max(1, card.intervalDays) * 1.2));
    ease = Math.max(MIN_EASE, ease - 0.15);
  } else if (rating === 'easy') {
    intervalDays = card.repetitions === 0 ? 3 : card.repetitions === 1 ? 6 :
      Math.max(3, Math.round(card.intervalDays * ease * 1.3));
    ease = Math.min(MAX_EASE, ease + 0.15);
  } else {
    intervalDays = card.repetitions === 0 ? 1 : card.repetitions === 1 ? 3 :
      Math.max(1, Math.round(card.intervalDays * ease));
  }
  intervalDays = Math.min(3650, intervalDays);
  const next = new Date(now + (rating === 'again' ? AGAIN_MS : intervalDays * DAY_MS)).toISOString();
  return { ...card, repetitions, intervalDays, ease, lapses, dueAt: next };
}
