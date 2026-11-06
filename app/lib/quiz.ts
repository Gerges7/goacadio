/** Quiz payload types, size limits, and defensive validation of AI-generated output. */
import { extractAiAnswer } from './ai-study';

export const MAX_QUIZ_SOURCE_CHARS = 12000;
export const MIN_QUIZ_SOURCE_CHARS = 200;
export const MAX_PDF_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_PAGES = 25;
export const QUIZ_SIZES = [4, 6, 8] as const;
export type QuizSize = (typeof QUIZ_SIZES)[number];
export type QuizKind = 'mcq' | 'tf';
export type QuizFormat = 'mixed' | 'mcq' | 'tf';
export type QuizLanguage = 'auto' | 'ar' | 'en';
export type QuizQuestion = {
  kind: QuizKind;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};
export type QuizData = { title: string; questions: QuizQuestion[] };

export function isQuizSize(value: unknown): value is QuizSize {
  return QUIZ_SIZES.includes(value as QuizSize);
}
export function isQuizFormat(value: unknown): value is QuizFormat {
  return value === 'mixed' || value === 'mcq' || value === 'tf';
}
export function isQuizLanguage(value: unknown): value is QuizLanguage {
  return value === 'auto' || value === 'ar' || value === 'en';
}

function recordOf(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function readString(value: unknown, limit: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > limit) return null;
  return cleaned;
}
function unwrapResponse(output: unknown): unknown {
  const outer = recordOf(output);
  // Models using response_format may return an object directly under response.
  if (outer && recordOf(outer.response)) return outer.response;
  if (outer && Array.isArray(outer.questions)) return outer;
  const text = extractAiAnswer(output);
  if (!text) return null;
  let value = text.trim();
  if (value.startsWith('```')) value = value.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(value) as unknown; } catch { /* Some models surround JSON with a short explanation. */ }
  const first = value.indexOf('{');
  const last = value.lastIndexOf('}');
  if (first < 0 || last <= first) return null;
  try { return JSON.parse(value.slice(first, last + 1)) as unknown; } catch { return null; }
}
/** Validate every question rather than trusting AI output or rendering it as HTML. */
export function parseQuizOutput(output: unknown, requested: QuizSize, format: QuizFormat): QuizData | null {
  const payload = recordOf(unwrapResponse(output));
  if (!payload || !Array.isArray(payload.questions)) return null;
  const title = readString(payload.title, 140) ?? 'Practice Quiz';
  const questions: QuizQuestion[] = [];
  for (const raw of payload.questions.slice(0, requested + 3)) {
    const q = recordOf(raw);
    if (!q) continue;
    const kind: QuizKind | null = q.kind === 'mcq' || q.kind === 'tf' ? q.kind : null;
    const question = readString(q.question, 450);
    const explanation = readString(q.explanation, 750);
    const options = q.options;
    const answerIndex = q.answerIndex;
    if (!kind || !question || !explanation || !Array.isArray(options) || !Number.isInteger(answerIndex)) continue;
    if (format !== 'mixed' && kind !== format) continue;
    if (options.length !== (kind === 'mcq' ? 4 : 2)) continue;
    const safe = options.map(x => readString(x, 180));
    if (safe.some(x => !x) || new Set(safe.map(x => x?.toLocaleLowerCase())).size !== safe.length) continue;
    if ((answerIndex as number) < 0 || (answerIndex as number) >= options.length) continue;
    if (questions.some(existing => existing.question.toLocaleLowerCase() === question.toLocaleLowerCase())) continue;
    questions.push({kind, question, options: safe as string[], answerIndex: answerIndex as number, explanation});
    if (questions.length === requested) break;
  }
  // Do not show an almost empty or nonsensical quiz. Under-generation is reported in the UI.
  if (questions.length < Math.max(3, requested - 2)) return null;
  if (format === 'mixed' && (!questions.some(x => x.kind === 'mcq') || !questions.some(x => x.kind === 'tf'))) return null;
  return {title, questions};
}

export function gradeQuiz(questions: QuizQuestion[], selections: Record<number, number>): {correct:number;answered:number;total:number} {
  let correct=0, answered=0;
  questions.forEach((q,i)=>{
    if (!Object.prototype.hasOwnProperty.call(selections,i)) return;
    answered++;
    if (selections[i]===q.answerIndex) correct++;
  });
  return {correct,answered,total:questions.length};
}
