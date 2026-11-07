/** Internal-only sitemap preparation. Deliberately NEVER writes to public/.
 * Run: node scripts/generate-sitemap-template.mjs
 * Publishing is a separate, reviewed release decision.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const routes = read('app/routes.ts');
const guideSource = read('app/lib/study-guides.ts');
const site = 'https://goacadio.com';
const staticPublic = [
  '/', '/tools', '/tools/gpa-calculator', '/tools/focus-timer', '/tools/cv-builder',
  '/guides', '/help', '/contact', '/privacy', '/services', '/universities',
];
const guideSlugs = [...guideSource.matchAll(/\bslug:\s*'([a-z0-9-]+)'/g)].map(m => m[1]);
if (guideSlugs.length < 3 || new Set(guideSlugs).size !== guideSlugs.length) {
  throw new Error('Could not uniquely find all guide slugs in app/lib/study-guides.ts');
}
const guideRoute = /route\('guides\/:slug'/.test(routes);
if (!guideRoute) throw new Error('Expected guides/:slug route is missing');
const paths = [...staticPublic, ...guideSlugs.map(s => '/guides/' + s)];
const privateStart = /^\/(?:admin|account|auth|dashboard|api|quiz-generator|quiz-history|planner|study-stats|revision|ai-study)(?:\/|$)/;
for (const path of paths) {
  if (privateStart.test(path)) throw new Error('Private path in public sitemap: ' + path);
  if (path !== '/' && !routes.includes(`route('${path.slice(1)}'`)) {
    if (!path.startsWith('/guides/')) throw new Error('Missing public route: ' + path);
  }
}
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<!-- INTERNAL PRELAUNCH TEMPLATE ONLY: DO NOT UPLOAD TO public/ BEFORE APPROVAL. -->\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  paths.map(path => `  <url><loc>${site}${path}</loc></url>`).join('\n') +
  '\n</urlset>\n';
const out = resolve(root,'docs/sitemap-public-template.xml');
writeFileSync(out,xml,'utf8');
console.log(`Prepared ${paths.length} public URLs in docs/sitemap-public-template.xml (NOT published).`);
