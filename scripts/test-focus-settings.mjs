/** Regression tests for Focus Mode settings, completion logic and navigation. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const source=read('app/lib/focus-settings.ts');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const mod=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const {DEFAULT_FOCUS_SETTINGS,FOCUS_SETTING_LIMITS,normalizeFocusSettings,parseFocusSettings,focusModeMinutes,recommendedBreak}=mod;
const defaultDraft={focusMinutes:'25',shortBreakMinutes:'5',longBreakMinutes:'15',longBreakEvery:'4'};

assert.deepEqual(normalizeFocusSettings(null),DEFAULT_FOCUS_SETTINGS);
assert.deepEqual(parseFocusSettings(defaultDraft),DEFAULT_FOCUS_SETTINGS);
assert.deepEqual(parseFocusSettings({focusMinutes:'45',shortBreakMinutes:'7',longBreakMinutes:'22',longBreakEvery:'3'}),{
  focusMinutes:45,shortBreakMinutes:7,longBreakMinutes:22,longBreakEvery:3
});
for(const [key,{min,max}] of Object.entries(FOCUS_SETTING_LIMITS)){
  for(const invalid of ['0','-1','1.5','',String(max+1),'Infinity','  ','not a number']){
    assert.equal(parseFocusSettings({...defaultDraft,[key]:invalid}),null,key+' '+invalid);
  }
  assert.ok(parseFocusSettings({...defaultDraft,[key]:String(min)}),key+' min');
  assert.ok(parseFocusSettings({...defaultDraft,[key]:String(max)}),key+' max');
}
assert.deepEqual(normalizeFocusSettings({focusMinutes:900,shortBreakMinutes:7,longBreakMinutes:-2,longBreakEvery:100}),{
  focusMinutes:25,shortBreakMinutes:7,longBreakMinutes:15,longBreakEvery:4
});
const settings=parseFocusSettings({focusMinutes:'40',shortBreakMinutes:'8',longBreakMinutes:'20',longBreakEvery:'3'});
assert.ok(settings);
assert.equal(focusModeMinutes(settings,'focus'),40);
assert.equal(focusModeMinutes(settings,'shortBreak'),8);
assert.equal(focusModeMinutes(settings,'longBreak'),20);
assert.equal(recommendedBreak(1,settings),'shortBreak');
assert.equal(recommendedBreak(2,settings),'shortBreak');
assert.equal(recommendedBreak(3,settings),'longBreak');
assert.equal(recommendedBreak(6,settings),'longBreak');

const focus=read('app/routes/focus-timer.tsx');
assert.match(focus,/if\(mode!=='focus'\)/);
assert.match(focus,/minutes:duration/);
assert.match(focus,/minutes:base\.minutes\+duration/);
assert.match(focus,/storageKeys\.focusSettings/);
assert.match(focus,/saveSettings/);
const chrome=read('app/components/chrome.tsx');
assert.doesNotMatch(chrome,/href: '\/universities'/);
assert.match(read('app/routes.ts'),/route\('universities'/);
assert.match(read('app/routes/dashboard.tsx'),/from\('universities'\)/);
assert.match(read('supabase/010_focus_custom_sessions.sql'),/CHECK \(minutes BETWEEN 1 AND 180\)/);
console.log('Focus settings, session tracking, university navigation and SQL contract checks passed.');
