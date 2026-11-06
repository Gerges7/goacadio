/** Shared validation and display types. No AI API calls are made in this module. */
export const DAILY_QUESTIONS = 5;
export const MAX_PROMPT_CHARS = 1200;
export const MAX_NOTES_CHARS = 3000;
export type StudyMode = 'explain' | 'practice' | 'summarize';
export type ChatMessage = {role:'user'|'assistant';content:string};
export function isStudyMode(value:unknown):value is StudyMode {
  return value === 'explain' || value === 'practice' || value === 'summarize';
}
export function cleanHistory(value:unknown):ChatMessage[] {
  if(!Array.isArray(value))return [];
  return value.slice(-4).flatMap((item):ChatMessage[]=>{
    if(!item || typeof item !== 'object')return [];
    const m=item as Record<string,unknown>;
    if((m.role!=='user'&&m.role!=='assistant')||typeof m.content!=='string')return [];
    const content=m.content.trim().slice(0,600);
    return content?[{role:m.role,content}]:[];
  });
}
