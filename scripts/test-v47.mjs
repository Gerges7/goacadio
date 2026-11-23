/** V4.7: offline flashcard scheduling, safe imports and route coverage. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const source = read('app/lib/flashcards.ts');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const {
  createFlashcard, sanitizeFlashcards, dueFlashcards, scheduleFlashcard,
  MAX_FLASHCARDS, MAX_FRONT_LENGTH,
} = mod;
const DAY = 86_400_000;
const now = Date.parse('2026-11-23T12:00:00.000Z');

const card = createFlashcard('test-card', '  What is DNA?  ', '  Genetic material  ', 'Biology', now);
assert.ok(card);
assert.equal(card.front, 'What is DNA?');
assert.equal(card.back, 'Genetic material');
assert.equal(dueFlashcards([card], now).length, 1);
assert.equal(dueFlashcards([card], now - 1).length, 0);
assert.equal(dueFlashcards([card], now, 'Mathematics').length, 0);
assert.equal(createFlashcard('too-long', 'x'.repeat(MAX_FRONT_LENGTH + 1), 'Answer', 'General', now), null);

const again = scheduleFlashcard(card, 'again', now);
assert.equal(Date.parse(again.dueAt) - now, 600_000);
assert.equal(again.lapses, 1);
assert.equal(again.repetitions, 0);
assert.equal(dueFlashcards([again], now).length, 0);
assert.equal(dueFlashcards([again], now + 600_000).length, 1);

const good1 = scheduleFlashcard(card, 'good', now);
assert.equal(good1.intervalDays, 1);
assert.equal(Date.parse(good1.dueAt), now + DAY);
const good2 = scheduleFlashcard(good1, 'good', now + DAY);
assert.equal(good2.intervalDays, 3);
const good3 = scheduleFlashcard(good2, 'good', now + 4 * DAY);
assert.ok(good3.intervalDays >= 7);
const hard = scheduleFlashcard(card, 'hard', now);
assert.equal(hard.intervalDays, 1);
assert.ok(hard.ease < card.ease);
const easy = scheduleFlashcard(card, 'easy', now);
assert.equal(easy.intervalDays, 3);
assert.ok(easy.ease > card.ease);

const valid = JSON.parse(JSON.stringify(card));
const restored = sanitizeFlashcards([
  valid,
  { ...valid, front: 'duplicate ignored' },
  { ...valid, id: 'invalid', front: 'x'.repeat(MAX_FRONT_LENGTH + 1) },
  { ...valid, id: 'safe', dueAt: 'bad-date', ease: 500, repetitions: -100 },
  null,
]);
assert.equal(restored.length, 2);
assert.equal(restored[1].ease, 3);
assert.equal(restored[1].repetitions, 0);
assert.ok(Number.isFinite(Date.parse(restored[1].dueAt)));
assert.deepEqual(sanitizeFlashcards({ cards: [valid] }), []);
assert.ok(sanitizeFlashcards(Array.from({length: MAX_FLASHCARDS + 10}, (_, i) => ({...valid, id: 'c'+i}))).length <= MAX_FLASHCARDS);

assert.match(read('app/lib/storage.ts'), /flashcards: 'goacadio:v1:flashcards'/);
assert.match(read('app/routes.ts'), /route\('tools\/flashcards', '\.\/routes\/flashcards\.tsx'\)/);
assert.match(read('app/routes/tools.tsx'), /Flashcards & Spaced Review/);
assert.match(read('app/routes/home.tsx'), /\/tools\/flashcards/);
const view = read('app/routes/flashcards.tsx');
assert.match(view, /sanitizeFlashcards\(loadLocal/);
assert.match(view, /saveLocal\(storageKeys\.flashcards/);
assert.match(view, /publicSeoMeta/);
assert.match(view, /createFlashcard/);
assert.match(view, /scheduleFlashcard/);
assert.match(view, /type="file"/);
console.log('V4.7 flashcard scheduling, import validation and route coverage passed.');
