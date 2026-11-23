/**
 * Read-only synthetic browser measurements for public GoAcadio pages.
 * NOTE: FCP/LCP/CLS here are one-run lab observations; NOT real-user CrUX data.
 * INP cannot be inferred from a passive page load and is deliberately omitted.
 *
 * Run after npm ci + npx playwright install chromium:
 *   node scripts/audit-browser-performance.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = new URL(process.env.GOACADIO_AUDIT_ORIGIN || 'https://goacadio.com');
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('Audit must use an HTTPS site origin without a path.');
}
const paths = [
  '/', '/tools', '/tools/flashcards', '/guides',
  '/guides/flashcards-spaced-repetition-study-guide',
  '/guides/student-project-to-internship-cv',
  '/tools/gpa-calculator', '/tools/focus-timer',
];
const devices = [
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1365, height: 900, isMobile: false, hasTouch: false },
];
const folder = resolve('artifacts/performance');
await mkdir(folder, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
let failed = false;

try {
  for (const device of devices) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: 1,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
      reducedMotion: 'reduce',
    });

    for (const path of paths) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message.slice(0, 300)));
      await page.addInitScript(() => {
        const sample = { lcp: null, cls: 0 };
        Object.defineProperty(window, '__goacadioLabMetrics', { value: sample, configurable: false });
        try {
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              sample.lcp = entry.startTime;
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch { /* browser does not provide LCP entries */ }
        try {
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) sample.cls += entry.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch { /* browser does not provide CLS entries */ }
      });

      try {
        const response = await page.goto(new URL(path, origin).href, {
          waitUntil: 'load',
          timeout: 30_000,
        });
        await page.waitForTimeout(1200);
        const metrics = await page.evaluate(() => {
          const nav = performance.getEntriesByType('navigation')[0];
          const paint = performance.getEntriesByType('paint')
            .find(item => item.name === 'first-contentful-paint');
          const sample = window.__goacadioLabMetrics || {};
          return {
            fcpMs: paint ? Math.round(paint.startTime) : null,
            lcpMs: sample.lcp === null ? null : Math.round(sample.lcp),
            cls: Math.round((sample.cls || 0) * 10000) / 10000,
            domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
            loadMs: nav ? Math.round(nav.loadEventEnd) : null,
            totalResourceRequests: performance.getEntriesByType('resource').length,
            viewportWidth: document.documentElement.clientWidth,
            documentWidth: document.documentElement.scrollWidth,
            title: document.title,
            h1: document.querySelector('main h1')?.textContent?.trim()?.slice(0, 200) || null,
          };
        });
        const code = response?.status() ?? null;
        const overflow = metrics.documentWidth > metrics.viewportWidth + 1;
        if (code !== 200 || errors.length || overflow || !metrics.h1) failed = true;
        const name = (path === '/' ? 'home' : path.replace(/^\//, '').replaceAll('/', '-'));
        const screenshotFile = device.name + '-' + name + '.png';
        await page.screenshot({ path: resolve(folder, screenshotFile), fullPage: true });
        records.push({
          path, device: device.name, status: code, overflow,
          errors, screenshot: screenshotFile, ...metrics,
        });
        console.log(
          device.name.padEnd(7) + ' ' + String(code) + ' ' + path.padEnd(52) +
          ' FCP=' + String(metrics.fcpMs) + 'ms' +
          ' LCP=' + String(metrics.lcpMs) + 'ms CLS=' + String(metrics.cls) +
          (overflow ? ' OVERFLOW' : '') + (errors.length ? ' PAGE ERRORS' : ''),
        );
      } catch (error) {
        failed = true;
        records.push({
          path, device: device.name, status: null, error: String(error).slice(0, 450),
        });
        console.error('FAILED ' + device.name + ' ' + path + ': ' + String(error));
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const report = {
  site: origin.href, measuredAt: new Date().toISOString(),
  methodology: 'Single-run synthetic Chromium observations, not CrUX field Core Web Vitals.',
  limitations: 'INP is not measured. FCP/LCP/CLS are not population p75 and can vary between runs.',
  records,
};
await writeFile(resolve(folder, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log('Report: artifacts/performance/report.json');
if (failed) process.exitCode = 1;
