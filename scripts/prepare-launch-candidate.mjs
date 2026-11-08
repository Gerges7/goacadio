/** Prepare an internal copy of the already approved/public SEO artifacts in docs/ only.
 * Run: npm run prepare:seo-candidate
 * Does not alter the live indexable launch. This is an archived audit copy.
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
  '# INTERNAL AUDIT COPY — live SEO artifacts are under public/.',
  '# Public crawlers need to access private noindex pages to read their noindex rule.',
  'User-agent: *',
  'Allow: /',
  `Sitemap: ${SITE}/sitemap.xml`,
  '',
].join('\n');
const xml=[
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!-- INTERNAL AUDIT COPY: public/sitemap.xml is the deployed file. -->',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...inventory.publicPaths.map(path=>`  <url><loc>${SITE}${path}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
writeFileSync(resolve(out,'robots.txt'),robots);
writeFileSync(resolve(out,'sitemap.xml'),xml);
console.log(`Prepared ${inventory.publicPaths.length} public URL candidates in docs/seo-release-candidate/`);
console.log('INTERNAL COPY ONLY. Current public/robots.txt and sitemap.xml are not changed by this command.');
