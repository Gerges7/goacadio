import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

const pageRoutes = [
  '/',
  '/tools',
  '/tools/gpa-calculator',
  '/tools/focus-timer',
  '/tools/cv-builder',
  '/tools/flashcards',
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
  // Warm the local Vite client once so the route loop measures app behavior, not first-load HMR startup.
  await page.goto('/');
  await expect(page.locator('button.lang-toggle')).toBeVisible();
  await page.waitForTimeout(150);

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
  await expect(page.locator('nav.navigation').getByRole('link', { name: 'Tools', exact: true })).toBeVisible();

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('nav.navigation').getByRole('link', { name: 'Tools', exact: true })).toBeVisible();
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
  await expect(timer).not.toHaveText('25:00', { timeout: 3000 });
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

  const openMenu = page.getByRole('button', { name: 'فتح القائمة' });
  await openMenu.click();
  const closeMenu = page.getByRole('button', { name: 'إغلاق القائمة' });
  await expect(closeMenu).toHaveAttribute('aria-expanded', 'true');
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

test('services page remains non-indexable', async ({ page }) => {
  const response = await page.goto('/services');
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
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
  for (const path of ['/', '/tools', '/tools/gpa-calculator', '/tools/focus-timer', '/tools/cv-builder', '/tools/flashcards', '/guides', '/contact']) {
    await page.goto(path);
    const width = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(width.content, `horizontal overflow on ${path}`).toBeLessThanOrEqual(width.viewport + 1);
  }
});

test('flashcards: create, reveal, schedule and retain local cards after reload', async ({ page }) => {
  await page.goto('/tools/flashcards');
  await page.locator('#flashcard-front').fill('What is a variable?');
  await page.locator('#flashcard-back').fill('A named storage location for a value.');
  await page.locator('#flashcard-deck').fill('Programming');
  await page.getByRole('button', { name: 'إضافة بطاقة' }).click();

  await expect(page.locator('.flashcard-item')).toContainText('What is a variable?');
  await page.getByRole('button', { name: 'راجع البطاقات' }).click();
  await expect(page.locator('.flashcard-review')).toContainText('What is a variable?');
  await page.getByRole('button', { name: 'اعرض الإجابة' }).click();
  await expect(page.locator('.flashcard-answer')).toContainText('A named storage location');
  await page.getByRole('button', { name: 'جيد' }).click();
  await expect(page.locator('.flashcard-review-panel .placeholder')).toContainText('لا توجد بطاقات مستحقة');

  await page.reload();
  await expect(page.locator('.flashcard-item')).toContainText('What is a variable?');
  await expect(page.locator('.flashcards-stats')).toContainText('1');
});

test('flashcards: edit, export, delete and restore a JSON backup', async ({ page }) => {
  await page.goto('/tools/flashcards');
  await page.locator('#flashcard-front').fill('Old question');
  await page.locator('#flashcard-back').fill('Old answer');
  await page.getByRole('button', { name: 'إضافة بطاقة' }).click();
  await expect(page.locator('.flashcard-item')).toContainText('Old question');

  await page.getByRole('button', { name: 'تعديل', exact: true }).click();
  await page.locator('#flashcard-front').fill('Updated question');
  await page.locator('#flashcard-back').fill('Updated answer');
  await page.getByRole('button', { name: 'احفظ التعديل' }).click();
  await expect(page.locator('.flashcard-item')).toContainText('Updated question');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'تصدير JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('goacadio-flashcards.json');
  const backupFile = await download.path();
  expect(backupFile).toBeTruthy();
  const backup = await readFile(backupFile!, 'utf8');
  expect(JSON.parse(backup).cards).toHaveLength(1);

  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'حذف', exact: true }).click();
  await expect(page.locator('.flashcard-item')).toHaveCount(0);

  await page.locator('#flashcards-import').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(backup),
  });
  await expect(page.locator('.flashcard-item')).toContainText('Updated question');
  await page.reload();
  await expect(page.locator('.flashcard-item')).toContainText('Updated question');
});

test('flashcards: invalid JSON import is rejected without wiping existing cards', async ({ page }) => {
  await page.goto('/tools/flashcards');
  await page.locator('#flashcard-front').fill('Unchanged');
  await page.locator('#flashcard-back').fill('Preserved');
  await page.getByRole('button', { name: 'إضافة بطاقة' }).click();

  await page.locator('#flashcards-import').setInputFiles({
    name: 'broken.json', mimeType: 'application/json',
    buffer: Buffer.from('{ this is not JSON'),
  });
  await expect(page.getByRole('status')).toContainText('ملف غير صالح');
  await expect(page.locator('.flashcard-item')).toContainText('Unchanged');
});
