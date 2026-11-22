-- GoAcadio V4.5: Saudi university catalog
-- 29 public universities: Saudi Ministry of Education public-university directory.
-- 15 private universities: Council of Universities' Affairs directory of private universities and colleges.
-- Only institutions explicitly listed as universities are seeded here; separately listed private colleges are not relabelled as universities.
-- Sources:
-- https://www.moe.gov.sa/ar/education/higher-education/universitieslist
-- https://www.cua.gov.sa/%D8%A7%D9%84%D8%AC%D8%A7%D9%85%D8%B9%D8%A7%D8%AA-%D8%A7%D9%84%D8%A3%D9%87%D9%84%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D9%83%D9%84%D9%8A%D8%A7%D8%AA/
-- Additive and idempotent: no existing universities, faculties, programs or student profiles are deleted.
-- Run after supabase/008_egyptian_university_faculty_catalog.sql.

BEGIN;

INSERT INTO public.countries(code,name_en,name_ar,is_active)
VALUES('SA','Saudi Arabia','السعودية',true)
ON CONFLICT(code) DO UPDATE
SET name_en=EXCLUDED.name_en,name_ar=EXCLUDED.name_ar,is_active=true;

CREATE TEMP TABLE _goacadio_saudi_universities(
  name_en text NOT NULL,
  name_ar text NOT NULL,
  institution_type text NOT NULL,
  source_url text NOT NULL
) ON COMMIT DROP;

INSERT INTO _goacadio_saudi_universities(name_en,name_ar,institution_type,source_url)
VALUES
('Umm Al-Qura University','جامعة أم القرى','public','https://uqu.edu.sa/'),
('Islamic University of Madinah','الجامعة الإسلامية بالمدينة المنورة','public','https://iu.edu.sa/'),
('Imam Muhammad bin Saud Islamic University','جامعة الإمام محمد بن سعود الإسلامية','public','https://imamu.edu.sa/'),
('King Saud University','جامعة الملك سعود','public','https://ksu.edu.sa/'),
('King Abdulaziz University','جامعة الملك عبدالعزيز','public','https://kau.edu.sa/'),
('King Fahd University of Petroleum and Minerals','جامعة الملك فهد للبترول والمعادن','public','https://kfupm.edu.sa/'),
('King Faisal University','جامعة الملك فيصل','public','https://kfu.edu.sa/'),
('King Khalid University','جامعة الملك خالد','public','https://kku.edu.sa/'),
('Qassim University','جامعة القصيم','public','https://qu.edu.sa/'),
('Taibah University','جامعة طيبة','public','https://taibahu.edu.sa/'),
('Taif University','جامعة الطائف','public','https://tu.edu.sa/'),
('University of Ha''il','جامعة حائل','public','https://uoh.edu.sa/'),
('Jazan University','جامعة جازان','public','https://jazanu.edu.sa/'),
('Jouf University','جامعة الجوف','public','https://ju.edu.sa/'),
('Al-Baha University','جامعة الباحة','public','https://bu.edu.sa/'),
('University of Tabuk','جامعة تبوك','public','https://ut.edu.sa/'),
('Najran University','جامعة نجران','public','https://nu.edu.sa/'),
('Northern Border University','جامعة الحدود الشمالية','public','https://nbu.edu.sa/'),
('Princess Nourah bint Abdulrahman University','جامعة الأميرة نورة بنت عبدالرحمن','public','https://pnu.edu.sa/'),
('King Saud bin Abdulaziz University for Health Sciences','جامعة الملك سعود بن عبدالعزيز للعلوم الصحية','public','https://ksau-hs.edu.sa/'),
('Imam Abdulrahman Bin Faisal University','جامعة الإمام عبدالرحمن بن فيصل','public','https://iau.edu.sa/'),
('Prince Sattam bin Abdulaziz University','جامعة الأمير سطام بن عبدالعزيز','public','https://psau.edu.sa/'),
('Shaqra University','جامعة شقراء','public','https://su.edu.sa/'),
('Majmaah University','جامعة المجمعة','public','https://mu.edu.sa/'),
('Saudi Electronic University','الجامعة السعودية الإلكترونية','public','https://seu.edu.sa/'),
('University of Jeddah','جامعة جدة','public','https://uj.edu.sa/'),
('University of Bisha','جامعة بيشة','public','https://ub.edu.sa/'),
('King Abdullah University of Science and Technology','جامعة الملك عبدالله للعلوم والتقنية','public','https://kaust.edu.sa/'),
('University of Hafr Al Batin','جامعة حفر الباطن','public','https://uhb.edu.sa/'),
('University of Business and Technology','جامعة الأعمال والتكنولوجيا','private','https://www.ubt.edu.sa/'),
('Arab Open University','الجامعة العربية المفتوحة','private','https://www.arabou.edu.sa/'),
('Prince Sultan University','جامعة الأمير سلطان','private','https://www.psu.edu.sa/'),
('Prince Fahd bin Sultan University','جامعة الأمير فهد بن سلطان','private','https://www.fbsu.edu.sa/'),
('Prince Mohammad Bin Fahd University','جامعة الأمير محمد بن فهد','private','https://www.pmu.edu.sa/'),
('Prince Mugrin University','جامعة الأمير مقرن بن عبدالعزيز','private','https://www.upm.edu.sa/'),
('Alfaisal University','جامعة الفيصل','private','https://www.alfaisal.edu/'),
('Al Yamamah University','جامعة اليمامة','private','https://yu.edu.sa/'),
('Dar Al Uloom University','جامعة دار العلوم','private','https://dau.edu.sa/'),
('Effat University','جامعة عفت','private','https://www.effatuniversity.edu.sa/'),
('Dar Al-Hekma University','جامعة دار الحكمة','private','https://www.dah.edu.sa/'),
('Riyadh Elm University','جامعة رياض العلم','private','https://home.riyadh.edu.sa/'),
('AlMaarefa University','جامعة المعرفة','private','https://www.um.edu.sa/'),
('University of the Future','جامعة المستقبل','private','https://uom.edu.sa/'),
('Sulaiman Al Rajhi University','جامعة سليمان الراجحي','private','https://sr.edu.sa/');

UPDATE public.universities u
SET name_en=s.name_en,
    name_ar=s.name_ar,
    institution_type=s.institution_type,
    source_url=s.source_url,
    is_published=true
FROM _goacadio_saudi_universities s
WHERE u.country_code='SA'
  AND (lower(btrim(u.name_en))=lower(btrim(s.name_en))
    OR (u.name_ar IS NOT NULL AND btrim(u.name_ar)=btrim(s.name_ar)));

INSERT INTO public.universities(country_code,name_en,name_ar,institution_type,source_url,is_published)
SELECT 'SA',s.name_en,s.name_ar,s.institution_type,s.source_url,true
FROM _goacadio_saudi_universities s
WHERE NOT EXISTS(
  SELECT 1 FROM public.universities u
  WHERE u.country_code='SA'
    AND (lower(btrim(u.name_en))=lower(btrim(s.name_en))
      OR (u.name_ar IS NOT NULL AND btrim(u.name_ar)=btrim(s.name_ar)))
);

SELECT institution_type,count(*) AS published_saudi_universities
FROM public.universities
WHERE country_code='SA' AND is_published=true
GROUP BY institution_type ORDER BY institution_type;

COMMIT;
