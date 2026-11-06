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

/**
 * Gemma 4 and other chat-completion models return `choices[0].message.content`.
 * Older Workers AI text models may instead return a top-level `response`.
 * Keep this tolerant to both response contracts without exposing provider details.
 */
function aiText(value:unknown):string {
  if(typeof value==='string')return value.trim();
  if(!Array.isArray(value))return '';
  return value.map(item=>{
    if(typeof item==='string')return item;
    if(item && typeof item==='object'){
      const record=item as Record<string,unknown>;
      if(record.type==='text' && typeof record.text==='string')return record.text;
    }
    return '';
  }).filter(Boolean).join('\n').trim();
}
export function extractAiAnswer(output:unknown):string {
  if(typeof output==='string')return output.trim();
  if(!output || typeof output!=='object')return '';
  const record=output as Record<string,unknown>;
  if(Array.isArray(record.choices)){
    for(const choice of record.choices){
      if(!choice||typeof choice!=='object')continue;
      const message=(choice as Record<string,unknown>).message;
      if(!message||typeof message!=='object')continue;
      const text=aiText((message as Record<string,unknown>).content);
      if(text)return text;
    }
  }
  return aiText(record.response) || aiText(record.content);
}
