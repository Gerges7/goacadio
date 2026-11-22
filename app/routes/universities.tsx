import { useEffect, useMemo, useState } from 'react';
import { Link, type MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

type University = {
  id: string; name_en: string; name_ar: string | null; country_code: string;
  institution_type?: string; source_url?: string | null;
};
type Faculty = { id: string; university_id: string; name_en: string; name_ar: string | null };

const TYPES: Record<string, { ar: string; en: string }> = {
  public: { ar: 'حكومية', en: 'Public' },
  public_special: { ar: 'حكومية – وضع خاص', en: 'Public – special status' },
  private: { ar: 'خاصة', en: 'Private' },
  national: { ar: 'أهلية', en: 'National' },
  government_technological: { ar: 'تكنولوجية حكومية', en: 'Government technological' },
  private_technological: { ar: 'تكنولوجية خاصة', en: 'Private technological' },
  international_branch: { ar: 'فرع جامعة أجنبية', en: 'International branch' },
  special_nature: { ar: 'ذات طبيعة خاصة', en: 'Special nature' },
  other: { ar: 'أخرى', en: 'Other' },
};

export const meta: MetaFunction = () => [
  { title: 'Egyptian Universities and Faculties | GoAcadio' },
  { name: 'description', content: 'Search Egyptian universities and browse their published faculties in the GoAcadio student directory.' },
  { name: 'robots', content: 'noindex, follow' },
];

export default function Universities() {
  const { text, lang } = useLocale();
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');

  useEffect(() => {
    const client = getSupabase();
    if (!client) { setLoading(false); return; }
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      const modern = await client.from('universities')
        .select('id,name_en,name_ar,country_code,institution_type,source_url')
        .eq('country_code', 'EG').eq('is_published', true).order('name_ar');
      let universityRows: University[];
      // Keep the page usable before the V4.4 SQL migration is applied.
      if (modern.error?.code === '42703') {
        const legacy = await client.from('universities')
          .select('id,name_en,name_ar,country_code')
          .eq('country_code', 'EG').eq('is_published', true).order('name_en');
        if (legacy.error) throw legacy.error;
        universityRows = (legacy.data ?? []).map(x => ({ ...x, institution_type: 'other', source_url: null }));
      } else {
        if (modern.error) throw modern.error;
        universityRows = (modern.data ?? []) as University[];
      }
      const facultyResult = await client.from('faculties')
        .select('id,university_id,name_en,name_ar')
        .eq('is_published', true).order('name_ar');
      if (facultyResult.error) throw facultyResult.error;
      if (active) {
        setUniversities(universityRows);
        setFaculties((facultyResult.data ?? []) as Faculty[]);
        setLoading(false);
      }
    }
    void load().catch((e: unknown) => {
      if (active) {
        setError(e instanceof Error ? e.message : 'تعذر تحميل الدليل حالياً.');
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const facultyMap = useMemo(() => {
    const map = new Map<string, Faculty[]>();
    for (const faculty of faculties) {
      const list = map.get(faculty.university_id) ?? [];
      list.push(faculty);
      map.set(faculty.university_id, list);
    }
    return map;
  }, [faculties]);

  const visible = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    return universities.filter(university => {
      if (type !== 'all' && (university.institution_type ?? 'other') !== type) return false;
      if (!q) return true;
      const facultyList = facultyMap.get(university.id) ?? [];
      return [university.name_ar ?? '', university.name_en, ...facultyList.flatMap(f => [f.name_ar ?? '', f.name_en])]
        .some(value => value.toLocaleLowerCase().includes(q));
    });
  }, [universities, facultyMap, search, type]);

  const label = (x: { name_ar: string | null; name_en: string }) =>
    lang === 'ar' && x.name_ar ? x.name_ar : x.name_en;
  const typeLabel = (value?: string) => {
    const item = TYPES[value ?? 'other'] ?? TYPES.other;
    return lang === 'ar' ? item.ar : item.en;
  };

  return <>
    <div className="page-hero"><div className="container">
      <span className="section-kicker">EGYPTIAN UNIVERSITY DIRECTORY</span>
      <h1>{text('دليل الجامعات والكليات المصرية 🎓', 'Egyptian Universities and Faculties')}</h1>
      <p>{text('ابحث عن جامعتك، اختار نوع المؤسسة، واستعرض الكليات المنشورة. يمكنك إدخال الكلية يدويًا من لوحة الطالب إذا لم تكن مدرجة.', 'Search for your institution, filter by type, and browse published faculties. You can enter a faculty manually in your student profile if it is not listed.')}</p>
    </div></div>
    <div className="page-content"><div className="container stack">
      <section className="panel stack">
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div><strong>{universities.length}</strong> {text('مؤسسة تعليم عالٍ', 'institutions')} · <strong>{faculties.length}</strong> {text('كلية مدرجة', 'listed faculties')}</div>
          <Link to="/dashboard" className="btn btn-primary">{text('اختار جامعتك في حسابك', 'Choose in student profile')}</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <input className="input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={text('ابحث باسم الجامعة أو الكلية...', 'Search university or faculty...')} aria-label={text('البحث في دليل الجامعات','Search university directory')} />
          <select className="input" value={type} onChange={e => setType(e.target.value)} aria-label={text('نوع الجامعة','Institution type')}>
            <option value="all">{text('كل أنواع المؤسسات','All institution types')}</option>
            {Object.entries(TYPES).filter(([key]) => key !== 'other').map(([key, value]) =>
              <option key={key} value={key}>{lang === 'ar' ? value.ar : value.en}</option>
            )}
          </select>
        </div>
        {loading && <div className="placeholder">{text('جاري تحميل الجامعات والكليات...', 'Loading universities and faculties...')}</div>}
        {!loading && error && <div className="note" role="alert">{error}</div>}
        {!loading && !error && visible.length === 0 && <div className="placeholder">{text('لا توجد نتائج مطابقة. جرّب كلمة بحث أخرى أو أدخل بياناتك يدويًا من لوحة الطالب.', 'No matching results. Try another search or enter your details manually in your student profile.')}</div>}
        {!loading && !error && <div className="stack" style={{ gap: 10 }}>
          {visible.map(university => {
            const list = facultyMap.get(university.id) ?? [];
            return <details key={university.id} className="panel" style={{ padding: 16 }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18 }}>{label(university)}</h2>
                  <span className="inline-help">{typeLabel(university.institution_type)}</span>
                </div>
                <span className="tag">{list.length} {text('كلية', 'faculties')}</span>
              </summary>
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14 }}>
                {list.length > 0
                  ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {list.map(faculty => <span key={faculty.id} className="tag">{label(faculty)}</span>)}
                    </div>
                  : <p className="inline-help">{text('لم تُدرج قائمة كليات موثقة لهذه المؤسسة بعد. يمكنك كتابة اسم كليتك يدويًا في حسابك.', 'A faculty list has not been added for this institution yet. You can enter your faculty manually in your profile.')}</p>}
                {university.source_url && <p style={{ marginBottom: 0, marginTop: 12 }}>
                  <a href={university.source_url} target="_blank" rel="noreferrer">{text('المصدر الرسمي', 'Official source')} ↗</a>
                </p>}
              </div>
            </details>;
          })}
        </div>}
      </section>
      <div className="note">{text('تنبيه: الكليات والبرامج قد تتغير بقرارات رسمية. دليل GoAcadio مساعد لاختيار بيانات الملف الدراسي، وليس بديلاً عن موقع الجامعة أو لائحتها المعتمدة.', 'Note: faculties and programs may change through official decisions. This directory helps populate your student profile; it does not replace your university website or academic regulations.')}</div>
    </div></div>
  </>;
}
