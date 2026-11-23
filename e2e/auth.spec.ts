import { expect, test, type Page } from '@playwright/test';

const FAKE_SUPABASE = 'https://goacadio-e2e.invalid';
const EMAIL = 'qa-student@example.test';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const user = {
  id: USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: EMAIL,
  email_confirmed_at: '2026-11-01T00:00:00Z',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: {},
  created_at: '2026-11-01T00:00:00Z',
};
const jwtPart = (data: object) => Buffer.from(JSON.stringify(data)).toString('base64url');
const accessToken = [
  jwtPart({ alg: 'HS256', typ: 'JWT' }),
  jwtPart({ sub: USER_ID, role: 'authenticated', aud: 'authenticated', exp: 4102444800 }),
  'fake-test-signature',
].join('.');

async function fakeSupabase(page: Page) {
  const courses: Array<{ id: string; name: string; code: string | null; catalog_course_id: null }> = [];
  const calls: string[] = [];
  await page.route(FAKE_SUPABASE + '/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    calls.push(method + ' ' + path);
    const cors = {
      'access-control-allow-origin': 'http://127.0.0.1:5173',
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'apikey,authorization,content-type,x-client-info,prefer,accept,x-supabase-api-version',
    };
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    const json = async (data: unknown, status = 200) => route.fulfill({
      status,
      contentType: 'application/json',
      headers: cors,
      body: JSON.stringify(data),
    });

    if (path === '/auth/v1/signup') return json({ user, session: null });
    if (path === '/auth/v1/recover') return json({});
    if (path === '/auth/v1/user') return json(user);
    if (path === '/auth/v1/logout') return json({}, 200);
    if (path === '/auth/v1/token') {
      const body = JSON.parse(request.postData() || '{}') as { password?: string };
      if (body.password === 'wrong-password') {
        return json({ code: 'invalid_credentials', msg: 'Invalid login credentials' }, 400);
      }
      return json({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'fake-refresh-token',
        user,
      });
    }

    if (path.startsWith('/rest/v1/')) {
      if (method === 'GET') {
        if (path === '/rest/v1/countries') {
          return json([{ code: 'EG', name_en: 'Egypt', name_ar: 'مصر' }]);
        }
        if (path === '/rest/v1/student_courses') return json(courses);
        return json([]);
      }
      if (path === '/rest/v1/student_courses' && method === 'POST') {
        const payload = JSON.parse(request.postData() || '{}') as { name: string; code?: string | null };
        const created = { id: '22222222-2222-4222-8222-222222222222', name: payload.name, code: payload.code || null, catalog_course_id: null };
        courses.push(created);
        return json(created, 201);
      }
      if (path === '/rest/v1/student_courses' && method === 'DELETE') {
        courses.length = 0;
        return route.fulfill({ status: 204 });
      }
      if (path === '/rest/v1/student_profiles' && method === 'POST') {
        return json({}, 201);
      }
      return json({});
    }
    // Unknown requests are kept on the isolated fake domain, never sent to production.
    return json({ code: 'unexpected_fake_api_request' }, 404);
  });
  return { calls, courses };
}

test('registration form: privacy links, native validation and confirmation response', async ({ page }) => {
  const mock = await fakeSupabase(page);
  await page.goto('/auth');
  await page.getByRole('button', { name: 'إنشاء حساب جديد' }).click();
  await expect(page.getByRole('heading', { name: 'إنشاء حساب جديد' })).toBeVisible();
  await expect(page.locator('form').getByRole('link', { name: 'الخصوصية' })).toHaveAttribute('href', '/privacy');
  await expect(page.locator('form').getByRole('link', { name: 'شروط الاستخدام' })).toHaveAttribute('href', '/terms');

  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill('short');
  await page.getByRole('button', { name: 'أنشئ الحساب' }).click();
  await expect.poll(() => page.locator('#password').evaluate((input: HTMLInputElement) => input.validity.tooShort)).toBe(true);
  expect(mock.calls.filter(call => call.includes('/auth/v1/signup'))).toHaveLength(0);

  await page.locator('#password').fill('long-enough-test-password');
  await page.getByRole('button', { name: 'أنشئ الحساب' }).click();
  await expect(page.getByRole('status')).toContainText('راجع بريدك الإلكتروني');
  expect(mock.calls.filter(call => call.includes('/auth/v1/signup'))).toHaveLength(1);
});

test('invalid login, successful login, student course creation, and logout', async ({ page }) => {
  const mock = await fakeSupabase(page);
  await page.goto('/auth');
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill('wrong-password');
  await page.getByRole('button', { name: 'دخول', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Invalid login credentials');
  await expect(page).toHaveURL(/\/auth$/);

  await page.locator('#password').fill('valid-test-password');
  await page.getByRole('button', { name: 'دخول', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.locator('.hello')).toContainText(EMAIL);
  await page.getByPlaceholder('Data Structures').fill('Physics');
  await page.getByRole('button', { name: 'إضافة مادة' }).click();
  await expect(page.locator('.course-item')).toContainText('Physics');
  expect(mock.courses).toHaveLength(1);

  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await expect(page.getByRole('heading', { name: 'لوحة الطالب الخاصة بك' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'لوحة الطالب الخاصة بك' })).toBeVisible();
});

test('password recovery request and new-password page are accessible', async ({ page }) => {
  const mock = await fakeSupabase(page);
  await page.goto('/auth');
  await page.getByRole('button', { name: 'نسيت كلمة المرور؟' }).click();
  await expect(page.getByRole('heading', { name: 'استعادة كلمة المرور' })).toBeVisible();
  await page.locator('#email').fill(EMAIL);
  await page.getByRole('button', { name: 'أرسل رابط الاستعادة' }).click();
  await expect(page.getByRole('status')).toContainText('لو البريد مسجل');
  expect(mock.calls.some(call => call.includes('/auth/v1/recover'))).toBe(true);

  await page.goto('/auth?recovery=1');
  await expect(page.getByRole('heading', { name: 'تعيين كلمة مرور جديدة' })).toBeVisible();
  await expect(page.locator('#email')).toHaveCount(0);
  await expect(page.locator('#password')).toHaveAttribute('autocomplete', 'new-password');
});

test('account labels and validation remain usable in English on mobile', async ({ page }) => {
  await fakeSupabase(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/auth');
  await page.getByRole('button', { name: 'Change language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('button', { name: 'Create an account' }).click();
  await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
  await expect(page.locator('#password')).toHaveAttribute('minlength', '8');
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});
