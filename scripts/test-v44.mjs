/** GoAcadio V4.4: Egyptian university/faculty catalog checks. No network. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const sql = read('supabase/008_egyptian_university_faculty_catalog.sql');
const page = read('app/routes/universities.tsx');
const pkg = JSON.parse(read('package.json'));

const uniBlock = sql.match(/INSERT INTO _goacadio_egypt_universities[\s\S]*?VALUES\n([\s\S]*?);/);
const facultyBlock = sql.match(/INSERT INTO _goacadio_egypt_faculties[\s\S]*?VALUES\n([\s\S]*?);/);
assert.ok(uniBlock, 'university seed block exists');
assert.ok(facultyBlock, 'faculty seed block exists');
const universityCount = (uniBlock[1].match(/^\(/gm) ?? []).length;
const facultyCount = (facultyBlock[1].match(/^\(/gm) ?? []).length;
assert.equal(universityCount, 127, '127 Egyptian institutions are seeded');
assert.ok(facultyCount >= 600, 'at least 600 faculty records are seeded');
assert.match(sql, /ADD COLUMN IF NOT EXISTS institution_type/);
assert.match(sql, /ADD COLUMN IF NOT EXISTS source_url/);
assert.match(sql, /ON CONFLICT\(code\)/);
assert.match(sql, /is_published=true/);
assert.doesNotMatch(sql, /\bDELETE\s+FROM\b|\bDROP\s+TABLE\b/i, 'migration must not delete existing data');
assert.match(page, /institution_type/);
assert.match(page, /faculties/);
assert.match(page, /source_url/);
assert.match(page, /noindex, follow/);
assert.equal(pkg.scripts['test:v44'], 'node scripts/test-v44.mjs');
assert.ok(pkg.scripts['check:ci'].includes('npm run test:v44'));
console.log(`V4.4 catalog checks passed: ${universityCount} institutions, ${facultyCount} faculty records.`);
