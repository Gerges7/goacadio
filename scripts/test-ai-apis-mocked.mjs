/**
 * End-to-end API action contract tests, without network, credentials or real AI.
 * Exercise the production route functions with fake Supabase Auth/RLS responses,
 * the quota RPC and a fake Cloudflare AI inference binding.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const modules = new Map();
globalThis.__GOACADIO_TEST_ENV = {
  VITE_SUPABASE_URL: 'https://mock-qa-supabase.invalid',
  VITE_SUPABASE_PUBLISHABLE_KEY: 'test-key-no-privileges',
};
function moduleUri(path) {
  if (modules.has(path)) return modules.get(path);
  const source = read(path);
  const output = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const aliases = {
    '@/lib/ai-study': 'app/lib/ai-study.ts',
    '@/lib/quiz': 'app/lib/quiz.ts',
    './ai-study': 'app/lib/ai-study.ts',
  };
  const js = output
    .replaceAll('import.meta.env', 'globalThis.__GOACADIO_TEST_ENV')
    .replace(/\bfrom\s+(['"])([^'"]+)\1/g, (_, q, spec) => {
      if (!aliases[spec]) throw Error('Unknown import in API test: '+spec);
      return `from '${moduleUri(aliases[spec])}'`;
    });
  const uri = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
  modules.set(path, uri);
  return uri;
}
const { action: studyAction } = await import(moduleUri('app/routes/api.ai-study.ts'));
const { action: quizAction } = await import(moduleUri('app/routes/api.generate-quiz.ts'));
const USER = '11111111-1111-4111-8111-111111111111';
const COURSE = '22222222-2222-4222-8222-222222222222';
const token = 'qa-only-no-real-secret';

const quiz = { title: 'Lecture 1', questions: [
  {kind:'mcq',question:'What is 2+2?',options:['1','2','4','5'],answerIndex:2,explanation:'Four.'},
  {kind:'tf',question:'Earth is a planet.',options:['True','False'],answerIndex:0,explanation:'Yes.'},
  {kind:'mcq',question:'What is 3+3?',options:['5','6','7','8'],answerIndex:1,explanation:'Six.'},
  {kind:'tf',question:'Ice is hot.',options:['True','False'],answerIndex:1,explanation:'Ice is cold.'},
]};
const lecture = 'Photosynthesis converts light energy into chemical energy in plants. '.repeat(6);

const savedFetch = globalThis.fetch;
let quota = 4;
let authValid = true;
let courseAccessible = true;
let emptyAI = false;
let calls = [];
const fakeAI = {
  async run(model, input) {
    calls.push({ kind: 'ai', model, input });
    if (emptyAI) return { response: '' };
    if (input.response_format?.type === 'json_object') return quiz;
    return { choices: [{ message: { content: 'A verified mock teaching explanation.' } }] };
  },
};
globalThis.fetch = async (url, options = {}) => {
  const u = new URL(url.toString());
  assert.equal(u.origin, 'https://mock-qa-supabase.invalid');
  calls.push({ kind: 'fetch', path: u.pathname, method: options.method || 'GET' });
  const response = (data, status = 200) => Response.json(data, { status });
  if (u.pathname === '/auth/v1/user') return response(authValid ? { id: USER } : { error: 'invalid_token' }, authValid ? 200 : 401);
  if (u.pathname === '/rest/v1/rpc/reserve_ai_study_request') {
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer ' + token);
    return response(quota);
  }
  if (u.pathname === '/rest/v1/student_courses') {
    assert.equal(u.searchParams.get('user_id'), 'eq.'+USER);
    return response(courseAccessible ? [{ name: 'Linear Algebra', code: 'MTH201' }] : []);
  }
  throw Error('Unexpected network request: ' + u.href);
};

const context = { cloudflare: { env: { AI: fakeAI } } };
const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
async function invoke(action, path, body, customHeaders = headers) {
  const request = new Request('https://goacadio.com' + path, {
    method: 'POST', headers: customHeaders, body: JSON.stringify(body),
  });
  const response = await action({ request, context, params: {} });
  return { response, body: await response.json() };
}
async function assertTest(name, test) {
  quota = 4; authValid = true; courseAccessible = true; emptyAI = false; calls = [];
  await test();
  console.log('PASS ' + name);
}
try {
  await assertTest('Authenticated AI study: verified user, atomic quota and explanation', async () => {
    const { response, body } = await invoke(studyAction, '/api/ai-study', {
      mode: 'explain', prompt: 'Explain matrix multiplication', notes: '',
      history: [{ role: 'user', content: 'What is a matrix?' }],
    });
    assert.equal(response.status, 200);
    assert.equal(body.answer, 'A verified mock teaching explanation.');
    assert.equal(body.remaining, 4);
    assert.equal(body.limit, 5);
    assert.equal(calls.filter(c => c.path === '/auth/v1/user').length, 1);
    assert.equal(calls.filter(c => c.path === '/rest/v1/rpc/reserve_ai_study_request').length, 1);
    assert.equal(calls.filter(c => c.kind === 'ai').length, 1);
  });
  await assertTest('Authenticated AI study rejects inaccessible course before quota', async () => {
    courseAccessible = false;
    const { response, body } = await invoke(studyAction, '/api/ai-study', {
      mode: 'explain', prompt: 'Explain calculus', courseId: COURSE,
    });
    assert.equal(response.status, 404);
    assert.equal(body.error, 'COURSE_NOT_FOUND');
    assert.equal(calls.filter(c => c.kind === 'ai').length, 0);
    assert.equal(calls.filter(c => c.path === '/rest/v1/rpc/reserve_ai_study_request').length, 0);
  });
  await assertTest('Authenticated AI quota exhausted denies inference', async () => {
    quota = -1;
    const { response, body } = await invoke(studyAction, '/api/ai-study', {
      mode: 'explain', prompt: 'Explain algorithms',
    });
    assert.equal(response.status, 429);
    assert.equal(body.error, 'DAILY_LIMIT_REACHED');
    assert.equal(calls.filter(c => c.kind === 'ai').length, 0);
  });
  await assertTest('Expired bearer token blocks AI before quota', async () => {
    authValid = false;
    const { response, body } = await invoke(studyAction, '/api/ai-study', {
      mode: 'explain', prompt: 'Explain algorithms',
    });
    assert.equal(response.status, 401);
    assert.equal(body.error, 'SIGN_IN_REQUIRED');
    assert.equal(calls.filter(c => c.kind === 'ai').length, 0);
  });
  await assertTest('Malformed AI inputs rejected without account lookups', async () => {
    const { response, body } = await invoke(studyAction, '/api/ai-study', {
      mode: 'inappropriate', prompt: 'a',
    });
    assert.equal(response.status, 400);
    assert.equal(body.error, 'INVALID_INPUT');
    assert.equal(calls.length, 0);
  });
  await assertTest('Empty inference output has safe error and no student data', async () => {
    emptyAI = true;
    const { response, body } = await invoke(studyAction, '/api/ai-study', {
      mode: 'explain', prompt: 'Explain algorithms',
    });
    assert.equal(response.status, 502);
    assert.equal(body.error, 'AI_EMPTY_RESPONSE');
    assert.equal(JSON.stringify(body).includes('algorithms'), false);
  });
  await assertTest('Authenticated quiz: verified user, quota, 4 valid practice questions', async () => {
    const { response, body } = await invoke(quizAction, '/api/generate-quiz', {
      source: lecture, count: 4, format: 'mixed', language: 'en',
    });
    assert.equal(response.status, 200);
    assert.equal(body.quiz.questions.length, 4);
    assert.equal(body.remaining, 4);
    assert.equal(calls.filter(c => c.path === '/auth/v1/user').length, 1);
    assert.equal(calls.filter(c => c.path === '/rest/v1/rpc/reserve_ai_study_request').length, 1);
    assert.equal(calls.filter(c => c.kind === 'ai').length, 1);
  });
  await assertTest('Authenticated quiz denies unauthorized course before inference', async () => {
    courseAccessible = false;
    const { response, body } = await invoke(quizAction, '/api/generate-quiz', {
      source: lecture, count: 4, format: 'mixed', language: 'en', courseId: COURSE,
    });
    assert.equal(response.status, 404);
    assert.equal(body.error, 'COURSE_NOT_FOUND');
    assert.equal(calls.filter(c => c.kind === 'ai').length, 0);
  });
  await assertTest('Authenticated quiz quota exhausted blocks AI', async () => {
    quota = -1;
    const { response, body } = await invoke(quizAction, '/api/generate-quiz', {
      source: lecture, count: 4, format: 'mixed', language: 'en',
    });
    assert.equal(response.status, 429);
    assert.equal(body.error, 'DAILY_LIMIT_REACHED');
    assert.equal(calls.filter(c => c.kind === 'ai').length, 0);
  });
  await assertTest('Quiz rejects too-short source and invalid formats', async () => {
    const { response, body } = await invoke(quizAction, '/api/generate-quiz', {
      source: 'short', count: 5, format: 'unknown', language: 'xx',
    });
    assert.equal(response.status, 400);
    assert.equal(body.error, 'INVALID_INPUT');
    assert.equal(calls.length, 0);
  });
} finally {
  globalThis.fetch = savedFetch;
  delete globalThis.__GOACADIO_TEST_ENV;
}
console.log('10/10 isolated AI tutor and quiz API contract tests passed.');
