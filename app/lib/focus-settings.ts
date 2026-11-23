/** Local Focus Mode preferences. Keep these independent from daily progress. */
export type FocusMode = 'focus' | 'shortBreak' | 'longBreak';
export type FocusSettings = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
};

export const DEFAULT_FOCUS_SETTINGS: Readonly<FocusSettings> = Object.freeze({
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
});

export const FOCUS_SETTING_LIMITS = {
  focusMinutes: { min: 1, max: 180 },
  shortBreakMinutes: { min: 1, max: 60 },
  longBreakMinutes: { min: 1, max: 90 },
  longBreakEvery: { min: 2, max: 8 },
} as const;

export const FOCUS_SETTING_FIELDS = [
  'focusMinutes', 'shortBreakMinutes', 'longBreakMinutes', 'longBreakEvery',
] as const;

function validMinutes(key: keyof FocusSettings, value: unknown): value is number {
  const { min, max } = FOCUS_SETTING_LIMITS[key];
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/** Corrupt or out-of-range browser data never produces a runaway timer. */
export function normalizeFocusSettings(input: unknown): FocusSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ...DEFAULT_FOCUS_SETTINGS };
  const values = input as Record<string, unknown>;
  return {
    focusMinutes: validMinutes('focusMinutes', values.focusMinutes)
      ? values.focusMinutes as number : DEFAULT_FOCUS_SETTINGS.focusMinutes,
    shortBreakMinutes: validMinutes('shortBreakMinutes', values.shortBreakMinutes)
      ? values.shortBreakMinutes as number : DEFAULT_FOCUS_SETTINGS.shortBreakMinutes,
    longBreakMinutes: validMinutes('longBreakMinutes', values.longBreakMinutes)
      ? values.longBreakMinutes as number : DEFAULT_FOCUS_SETTINGS.longBreakMinutes,
    longBreakEvery: validMinutes('longBreakEvery', values.longBreakEvery)
      ? values.longBreakEvery as number : DEFAULT_FOCUS_SETTINGS.longBreakEvery,
  };
}

/** Inputs must be whole numbers in range; no silent clamping on save. */
export function parseFocusSettings(input: Record<keyof FocusSettings, string>): FocusSettings | null {
  const result = {} as FocusSettings;
  for (const key of FOCUS_SETTING_FIELDS) {
    const raw = input[key].trim();
    if (!/^\d+$/.test(raw)) return null;
    const value = Number(raw);
    if (!validMinutes(key, value)) return null;
    result[key] = value;
  }
  return result;
}

export function focusModeMinutes(settings: FocusSettings, mode: FocusMode): number {
  return mode === 'focus' ? settings.focusMinutes
    : mode === 'shortBreak' ? settings.shortBreakMinutes
    : settings.longBreakMinutes;
}

export function recommendedBreak(completedFocusSessions: number, settings: FocusSettings): FocusMode {
  return completedFocusSessions > 0 && completedFocusSessions % settings.longBreakEvery === 0
    ? 'longBreak' : 'shortBreak';
}
