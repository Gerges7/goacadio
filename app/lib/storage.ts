export const storageKeys = {
  profile: 'goacadio:v1:profile',
  courses: 'goacadio:v1:courses',
  gpa: 'goacadio:v1:gpa',
  cv: 'goacadio:v1:cv',
  focus: 'goacadio:v1:focus',
  locale: 'goacadio:v1:locale'
};

export function loadLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}
export function saveLocal<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* blocked storage */ }
}
export function todayKey(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}
