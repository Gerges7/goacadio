/**
 * Client-only, user-initiated export of GoAcadio's user-owned Supabase tables.
 * Never send this archive to GoAcadio or third-party storage: it is assembled
 * and downloaded entirely in the current browser session.
 *
 * This is a convenience export, NOT a full GDPR data subject access response:
 * Supabase Auth metadata, infrastructure logs and browser-local GPA/CV drafts
 * are outside the database collections queried here.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type ExportSection = 'student_profiles'|'student_courses'|'study_items'|'focus_sessions'|
  'quiz_attempts'|'service_requests'|'account_requests'|'ai_daily_usage';

type SectionDefinition = {
  name: ExportSection;
  columns: string;
  orderBy: string;
  uniqueBy?: string;
};

export const EXPORT_SECTIONS: readonly SectionDefinition[] = [
  {name:'student_profiles',columns:'user_id,display_name,country_code,university_id,university_other,faculty_id,faculty_other,program_id,program_other,academic_level,created_at,updated_at',orderBy:'user_id'},
  {name:'student_courses',columns:'id,user_id,name,code,catalog_course_id,created_at',orderBy:'created_at',uniqueBy:'id'},
  {name:'study_items',columns:'id,user_id,course_id,kind,title,notes,due_date,due_time,priority,is_done,created_at,updated_at',orderBy:'created_at',uniqueBy:'id'},
  {name:'focus_sessions',columns:'id,user_id,client_session_id,course_id,minutes,completed_at,created_at',orderBy:'created_at',uniqueBy:'id'},
  {name:'quiz_attempts',columns:'id,user_id,client_attempt_id,course_id,title,question_count,correct_count,quiz_format,source_type,created_at',orderBy:'created_at',uniqueBy:'id'},
  {name:'service_requests',columns:'id,user_id,service_type,subject,description,status,created_at',orderBy:'created_at',uniqueBy:'id'},
  {name:'account_requests',columns:'id,user_id,category,details,status,created_at',orderBy:'created_at',uniqueBy:'id'},
  {name:'ai_daily_usage',columns:'user_id,usage_date,used',orderBy:'usage_date'},
];

const PAGE_SIZE=200;
const MAX_ROWS_PER_SECTION=10000;

export class DataExportError extends Error {
  constructor(public readonly code:'SIGN_IN_REQUIRED'|'READ_FAILED'|'TOO_MANY_ROWS'|'DOWNLOAD_FAILED',public readonly section?:ExportSection){
    super(code);
    this.name='DataExportError';
  }
}

export type AccountExport={
  format:'goacadio-account-export';
  version:1;
  exported_at:string;
  scope:'signed-in-account-snapshot';
  account:{id:string;email:string|null;created_at:string|null};
  collections:Record<ExportSection,Record<string,unknown>[]>;
  limitations:string[];
};

/** Fail closed if ANY collection cannot be read: no misleading partial download. */
export async function prepareAccountExport(
  client:SupabaseClient,
  expectedUserId:string,
  onProgress?:(section:ExportSection,rowsRead:number)=>void,
):Promise<AccountExport>{
  const first=await client.auth.getUser();
  if(first.error||!first.data.user||first.data.user.id!==expectedUserId)throw new DataExportError('SIGN_IN_REQUIRED');
  const user=first.data.user;
  const collections={} as AccountExport['collections'];
  for(const definition of EXPORT_SECTIONS){
    const rows:Record<string,unknown>[]=[];
    let page=0;
    while(true){
      // PostgREST can cap rows per query; always paginate instead of silently truncating.
      const from=page*PAGE_SIZE;
      let query=client.from(definition.name)
        .select(definition.columns)
        .eq('user_id',expectedUserId)
        .order(definition.orderBy,{ascending:true});
      if(definition.uniqueBy)query=query.order(definition.uniqueBy,{ascending:true});
      const {data,error}=await query.range(from,from+PAGE_SIZE-1);
      if(error||!Array.isArray(data))throw new DataExportError('READ_FAILED',definition.name);
      rows.push(...data as Record<string,unknown>[]);
      onProgress?.(definition.name,rows.length);
      if(rows.length>MAX_ROWS_PER_SECTION)throw new DataExportError('TOO_MANY_ROWS',definition.name);
      if(data.length<PAGE_SIZE)break;
      page++;
      // The next page can still contain data even if the last page had exactly 200 rows.
    }
    collections[definition.name]=rows;
  }
  const last=await client.auth.getUser();
  if(last.error||!last.data.user||last.data.user.id!==expectedUserId)throw new DataExportError('SIGN_IN_REQUIRED');
  return {
    format:'goacadio-account-export',version:1,exported_at:new Date().toISOString(),
    scope:'signed-in-account-snapshot',
    account:{id:user.id,email:user.email??null,created_at:user.created_at??null},
    collections,
    limitations:[
      'This export contains selected user-owned GoAcadio database records, not a full legal data access response.',
      'Supabase Auth internal metadata, vendor or server logs and other processor records are not included.',
      'Browser-local GPA, CV drafts and other localStorage data from other devices are not included.',
      'Lecture PDF binaries, complete AI conversations, and quiz questions/answers are not stored in these account tables.',
      'The download is not a database transaction; data changed during export may not be reflected consistently.',
    ],
  };
}

/** Call after a genuine user click, never during SSR. No network upload. */
export function downloadAccountExport(snapshot:AccountExport):void{
  let url:string|undefined;
  let link:HTMLAnchorElement|undefined;
  try {
    const json=JSON.stringify(snapshot,null,2);
    const blob=new Blob([json],{type:'application/json;charset=utf-8'});
    url=URL.createObjectURL(blob);
    link=document.createElement('a');
    link.href=url;
    link.download=`goacadio-account-data-${snapshot.exported_at.slice(0,10)}.json`;
    link.style.display='none';
    document.body.appendChild(link);
    link.click();
  }catch{throw new DataExportError('DOWNLOAD_FAILED');}
  finally {
    link?.remove();
    if(url){const created=url;setTimeout(()=>URL.revokeObjectURL(created),5000);}
  }
}
