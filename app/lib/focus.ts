/** Local-date aggregation. Times are stored in UTC in Supabase. */
export type FocusSession = {
  id: string;
  minutes: number;
  completed_at: string;
  course_id: string | null;
};
export type PendingFocusSession = {
  client_session_id: string;
  minutes: number;
  completed_at: string;
  course_id: string | null;
};

export function focusDate(date: Date): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function lastLocalDays(count: number, now: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (count - i - 1));
    return focusDate(d);
  });
}

export function summarizeFocus(sessions: readonly FocusSession[], days = 7, now: Date = new Date()) {
  const dates = lastLocalDays(days, now);
  const dateSet = new Set(dates);
  const minutesByDay = new Map<string, number>(dates.map(day => [day, 0] as const));
  const sessionsByDay = new Map<string, number>(dates.map(day => [day, 0] as const));
  for (const session of sessions) {
    const date = new Date(session.completed_at);
    if (!Number.isFinite(date.getTime()) || !Number.isFinite(session.minutes)) continue;
    const key = focusDate(date);
    if (!dateSet.has(key) || session.minutes < 1 || session.minutes > 240) continue;
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + session.minutes);
    sessionsByDay.set(key, (sessionsByDay.get(key) ?? 0) + 1);
  }
  const chart = dates.map(day => ({ day, minutes: minutesByDay.get(day) ?? 0, sessions: sessionsByDay.get(day) ?? 0 }));
  const totalMinutes = chart.reduce((sum, d) => sum + d.minutes, 0);
  const totalSessions = chart.reduce((sum, d) => sum + d.sessions, 0);
  const activeDays = chart.filter(d => d.sessions > 0).length;
  return { chart, totalMinutes, totalSessions, activeDays, todayMinutes: chart[chart.length-1]?.minutes ?? 0 };
}
