/** Display-only date helpers. Dates are local YYYY-MM-DD strings, not UTC timestamps. */
export function localToday(now:Date = new Date()):string {
  const year = now.getFullYear();
  const month = String(now.getMonth()+1).padStart(2,'0');
  const day = String(now.getDate()).padStart(2,'0');
  return `${year}-${month}-${day}`;
}
export function dayDiff(date:string, today:string):number {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{4}-\d{2}-\d{2}$/.test(today))return 0;
  const [y,m,d]=date.split('-').map(Number);
  const [ty,tm,td]=today.split('-').map(Number);
  return Math.round((Date.UTC(y,m-1,d)-Date.UTC(ty,tm-1,td))/86400000);
}
export type StudyItem = {
  id:string;
  user_id:string;
  course_id:string|null;
  kind:'task'|'exam';
  title:string;
  notes:string|null;
  due_date:string|null;
  due_time:string|null;
  priority:'low'|'normal'|'high';
  is_done:boolean;
  created_at:string;
};
export function plannerStats(items:StudyItem[],today:string) {
  return {
    totalOpen:items.filter(x=>!x.is_done).length,
    overdue:items.filter(x=>!x.is_done&&x.due_date!==null&&x.due_date<today).length,
    nextWeek:items.filter(x=>!x.is_done&&x.due_date!==null&&dayDiff(x.due_date,today)>=0&&dayDiff(x.due_date,today)<=7).length,
    exams:items.filter(x=>x.kind==='exam'&&!x.is_done&&x.due_date!==null&&x.due_date>=today).length,
  };
}
