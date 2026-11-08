/** Prepare reviewed SEO artifacts in docs/ only; NEVER alters public/, app/ or deployment.
 * Run: npm run prepare:seo-candidate
 * Existing prelaunch noindex and robots rules are intentionally left unchanged.
 */
import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SITE,validateLaunchInventory,isPrivatePublicPath} from './launch-inventory.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const inventory=validateLaunchInventory({
  routesText:read('app/routes.ts'),
  sitemapXml:read('docs/sitemap-public-template.xml'),
  robotsText:read('public/robots.txt'),
  seoSource:read('app/lib/seo.ts'),
  rootSource:read('app/root.tsx'),
  publicFolder:resolve(root,'public'), exists:existsSync,
});
if(inventory.failures.length)throw new Error('Candidate refused: '+inventory.failures.join('; '));
if(inventory.publicPaths.some(isPrivatePublicPath))throw new Error('Private path detected; refusing candidate.');
const out=resolve(root,'docs/seo-release-candidate');
mkdirSync(out,{recursive:true});
const robots=[
  '# REVIEW CANDIDATE ONLY — this file must never be copied until release approval.',
  '# Public crawlers need to access noindex pages to read their noindex rule.',
  'User-agent: *',
  'Allow: /',
  `Sitemap: ${SITE}/sitemap.xml`,
  '',
].join('\n');
const xml=[
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- REVIEW CANDIDATE ONLY — publish after legal/security/content QA and explicit approval. -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...inventory.publicPaths.map(path=>`  <url><loc>${SITE}${path}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
writeFileSync(resolve(out,'robots.txt'),robots);
writeFileSync(resolve(out,'sitemap.xml'),xml);
console.log(`Prepared ${inventory.publicPaths.length} public URL candidates in docs/seo-release-candidate/`);
console.log('NOT PUBLISHED. Current public/robots.txt, publicSeoMeta and root noindex are UNCHANGED.');
