import { expect, test } from '@playwright/test';

const pageRoutes = [
  '/',
  '/tools',
  '/tools/gpa-calculator',
  '/tools/focus-timer',
  '/tools/cv-builder',
  '/guides',
  '/dashboard',
  '/planner',
  '/study-stats',
  '/ai-study',
  '/quiz-generator',
  '/quiz-history',
  '/revision',
  '/universities',
  '/services',
  '/privacy',
  '/about',
  '/terms',
  '/help',
  '/contact',
  '/account',
  '/auth',
  '/admin',
];

test('all registered page routes render without uncaught browser errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  for (const path of pageRoutes) {
    const response = await page.goto(path);
    expect(response?.status(), `HTTP status for ${path}`).toBe(200);
    await expect(page.locator('main'), `main landmark for ${path}`).toBeVisible();
    await expect(page.locator('main').locator(':scope > *').first(), `page content for ${path}`).toBeVisible();
  }

  expect(pageErrors, 'uncaught browser errors across route smoke test').toEqual([]);
});

test('homepage language switch updates content direction and persists', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Change language' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('link', { name: 'Tools', exact: true })).toBeVisible();

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('link', { name: 'Tools', exact: true })).toBeVisible();
});

test('light and dark theme toggle persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'التبديل للوضع الداكن' }).click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'التبديل للوضع الفاتح' })).toBeVisible();
});

test('GPA calculator computes the default credit-weighted semester GPA', async ({ page }) => {
  await page.goto('/tools/gpa-calculator');
  await expect(page.locator('.result-number').first()).toHaveText('3.43');
});

test('focus timer starts and pauses without losing its countdown', async ({ page }) => {
  await page.goto('/tools/focus-timer');
  const timer = page.getByRole('timer');
  await expect(timer).toHaveText('25:00');

  await page.getByRole('button', { name: 'ابدأ الجلسة' }).click();
  await expect(page.getByRole('button', { name: 'إيقاف مؤقت' })).toBeVisible();
  await page.getByRole('button', { name: 'إيقاف مؤقت' }).click();
  await expect(page.getByRole('button', { name: 'ابدأ الجلسة' })).toBeVisible();
  await expect(timer).toHaveText(/^24:[0-5][0-9]$/);
});

test('CV builder updates its preview and restores the local draft', async ({ page }) => {
  await page.goto('/tools/cv-builder');
  await page.getByLabel('الاسم بالكامل').fill('GoAcadio Browser Test');
  await expect(page.locator('.cv-resume h2')).toHaveText('GoAcadio Browser Test');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('goacadio:v1:cv'))).not.toBeNull();

  await page.reload();
  await expect(page.locator('.cv-resume h2')).toHaveText('GoAcadio Browser Test');
});

test('mobile navigation opens and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'فتح القائمة' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'القائمة الرئيسية' }).getByRole('link', { name: 'الأدوات' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'فتح القائمة' })).toHaveAttribute('aria-expanded', 'false');
});

test('locale and theme remain usable when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = function () { throw new DOMException('Storage blocked', 'SecurityError'); };
    Storage.prototype.setItem = function () { throw new DOMException('Storage blocked', 'SecurityError'); };
  });

  await page.goto('/');
  await expect(page.locator('main')).toBeVisible();
  await page.getByRole('button', { name: 'Change language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('services page is non-indexable and never cacheable as shared HTML', async ({ page }) => {
  const response = await page.goto('/services');
  expect(response?.status()).toBe(200);
  expect(response?.headers()['x-robots-tag']).toContain('noindex');
  expect(response?.headers()['cache-control']).toContain('no-store');
});

test('guest AI endpoints reject requests before inference', async ({ request }) => {
  for (const path of ['/api/ai-study', '/api/generate-quiz']) {
    const response = await request.post(path, { data: {} });
    expect(response.status(), path).toBe(401);
    expect(await response.json()).toMatchObject({ error: 'SIGN_IN_REQUIRED' });
    expect(response.headers()['cache-control']).toContain('no-store');
  }
});

test('core public pages do not overflow a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/tools', '/tools/gpa-calculator', '/tools/focus-timer', '/tools/cv-builder', '/guides', '/contact']) {
    await page.goto(path);
    const width = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(width.content, `horizontal overflow on ${path}`).toBeLessThanOrEqual(width.viewport + 1);
  }
});
