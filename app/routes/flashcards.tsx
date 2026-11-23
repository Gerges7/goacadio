import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import type { MetaFunction } from 'react-router';
import { useLocale } from '@/components/locale-provider';
import { loadLocal, saveLocal, storageKeys } from '@/lib/storage';
import {
  MAX_BACK_LENGTH, MAX_DECK_LENGTH, MAX_FLASHCARDS, MAX_FRONT_LENGTH,
  createFlashcard, dueFlashcards, sanitizeFlashcards, scheduleFlashcard,
  type Flashcard, type ReviewRating,
} from '@/lib/flashcards';

export const meta: MetaFunction = () => [
  { title: 'Free Flashcards & Spaced Review | GoAcadio' },
  { name: 'description', content: 'Create bilingual flashcards and practice spaced review in your browser without creating an account.' },
  // Initially noindex until live content, accessibility and indexing are reviewed.
  { name: 'robots', content: 'noindex, follow' },
];

export default function FlashcardsPage() {
  const { text, lang } = useLocale();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [clock, setClock] = useState(0);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'library' | 'review'>('library');
  const [revealed, setRevealed] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [deck, setDeck] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setCards(sanitizeFlashcards(loadLocal<unknown>(storageKeys.flashcards, [])));
    setClock(Date.now());
    setLoaded(true);
    const interval = window.setInterval(() => setClock(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  useEffect(() => {
    if (loaded) saveLocal(storageKeys.flashcards, cards);
  }, [cards, loaded]);
  useEffect(() => {
    if (filter !== 'all' && !cards.some(card => card.deck === filter)) setFilter('all');
  }, [cards, filter]);

  const decks = useMemo(() => [...new Set(cards.map(card => card.deck))].sort(), [cards]);
  const visible = useMemo(() => cards.filter(card => filter === 'all' || card.deck === filter), [cards, filter]);
  const due = useMemo(() => dueFlashcards(cards, clock || 0, filter), [cards, clock, filter]);
  const current = due[0] ?? null;

  function clearEditor() {
    setFront(''); setBack(''); setDeck(''); setEditingId(null);
  }

  function saveCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFront = front.trim(), nextBack = back.trim(), nextDeck = deck.trim() || 'General';
    if (!nextFront || !nextBack || nextFront.length > MAX_FRONT_LENGTH ||
        nextBack.length > MAX_BACK_LENGTH || nextDeck.length > MAX_DECK_LENGTH) {
      setNotice(text('راجع نص البطاقة وحدود الطول.', 'Check the card text and field limits.'));
      return;
    }
    if (editingId) {
      setCards(previous => previous.map(card => card.id === editingId
        ? { ...card, front: nextFront, back: nextBack, deck: nextDeck } : card));
      setNotice(text('تم تعديل البطاقة.', 'Card updated.'));
    } else {
      if (cards.length >= MAX_FLASHCARDS) {
        setNotice(text('وصلت للحد الأقصى من البطاقات على الجهاز.', 'You reached the local card limit.'));
        return;
      }
      const id = window.crypto.randomUUID();
      const card = createFlashcard(id, nextFront, nextBack, nextDeck);
      if (!card) return;
      setCards(previous => [...previous, card]);
      setClock(Date.now());
      setNotice(text('البطاقة جاهزة للمراجعة.', 'Card is ready for review.'));
    }
    clearEditor();
  }

  function editCard(card: Flashcard) {
    setEditingId(card.id);
    setFront(card.front); setBack(card.back); setDeck(card.deck);
    setView('library');
    setNotice(text('عدّل البيانات ثم احفظ التغيير.', 'Edit the fields and save your changes.'));
  }

  function deleteCard(id: string) {
    if (!window.confirm(text('تحذف البطاقة من هذا الجهاز نهائيًا؟', 'Delete this card from this device?'))) return;
    setCards(previous => previous.filter(card => card.id !== id));
    if (editingId === id) clearEditor();
    setRevealed(false);
    setNotice(text('تم حذف البطاقة.', 'Card deleted.'));
  }

  function rate(rating: ReviewRating) {
    if (!current || !revealed) return;
    setCards(previous => previous.map(card => card.id === current.id
      ? scheduleFlashcard(card, rating) : card));
    setClock(Date.now());
    setRevealed(false);
    setNotice(text('تم تحديد موعد المراجعة القادمة.', 'Next review scheduled.'));
  }

  async function importCards(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (file.size > 500_000) {
      setNotice(text('ملف JSON كبير جدًا؛ الحد 500KB.', 'JSON file exceeds the 500KB limit.'));
      return;
    }
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const payload = Array.isArray(parsed) ? parsed :
        parsed && typeof parsed === 'object' && 'cards' in parsed
          ? (parsed as { cards: unknown }).cards : null;
      if (!Array.isArray(payload) || payload.length < 1) throw Error('invalid');
      const incoming = sanitizeFlashcards(payload);
      if (!incoming.length) throw Error('invalid');
      const existing = new Set(cards.map(card => card.id));
      const additions = incoming.filter(card => !existing.has(card.id))
        .slice(0, Math.max(0, MAX_FLASHCARDS - cards.length));
      setCards(previous => [...previous, ...additions]);
      setClock(Date.now());
      setNotice(additions.length
        ? text('تم استيراد ' + additions.length + ' بطاقة.', 'Imported ' + additions.length + ' cards.')
        : text('لا توجد بطاقات جديدة قابلة للاستيراد.', 'No new cards could be imported.'));
    } catch {
      setNotice(text('ملف غير صالح. استخدم نسخة JSON مصدّرة من الأداة.', 'Invalid file. Use a JSON backup exported by this tool.'));
    }
  }

  function exportCards() {
    const blob = new Blob([JSON.stringify({ version: 1, cards }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'goacadio-flashcards.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <>
    <div className="page-hero"><div className="container">
      <span className="section-kicker">ACTIVE RECALL</span>
      <h1>{text('بطاقات المراجعة الذكية 🗂️', 'Flashcards & spaced review 🗂️')}</h1>
      <p>{text(
        'اكتب سؤالًا وإجابة، واختبر نفسك وقيّم تذكّرك. الأداة ترجعلك البطاقة للمراجعة في موعد لاحق.',
        'Create question-and-answer cards, test yourself and rate your recall. The tool schedules each card for later review.',
      )}</p>
    </div></div>
    <div className="page-content"><div className="container stack">
      <section className="panel flashcards-toolbar">
        <div className="flashcards-stats" aria-live="polite">
          <div><strong>{cards.length}</strong><span>{text('إجمالي البطاقات', 'Total cards')}</span></div>
          <div><strong>{due.length}</strong><span>{text('مستحقة الآن', 'Due now')}</span></div>
          <div><strong>{decks.length}</strong><span>{text('مجموعات', 'Decks')}</span></div>
        </div>
        <div className="actions">
          <button type="button" className={view === 'library' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => {setView('library'); setRevealed(false);}}>{text('بطاقاتي', 'My cards')}</button>
          <button type="button" className={view === 'review' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => {setView('review'); setRevealed(false);}}>{text('راجع البطاقات', 'Review cards')}</button>
        </div>
      </section>

      <div className="field flashcards-filter">
        <label htmlFor="flashcards-deck-filter">{text('المجموعة', 'Deck')}</label>
        <select className="input" id="flashcards-deck-filter" value={filter} onChange={e => {setFilter(e.target.value); setRevealed(false);}}>
          <option value="all">{text('كل المجموعات', 'All decks')}</option>
          {decks.map(name => <option value={name} key={name}>{name}</option>)}
        </select>
      </div>

      {notice && <div role="status" className="note">{notice}</div>}
      {view === 'library' ? <div className="flashcards-layout">
        <form className="panel stack" onSubmit={saveCard}>
          <h2 className="panel-title">{editingId ? text('تعديل البطاقة', 'Edit card') : text('بطاقة جديدة', 'New flashcard')}</h2>
          <div className="field">
            <label htmlFor="flashcard-front">{text('السؤال / وجه البطاقة', 'Question / front')}</label>
            <textarea className="input" id="flashcard-front" rows={3} required maxLength={MAX_FRONT_LENGTH} value={front} onChange={e => setFront(e.target.value)} placeholder={text('ما هو المفهوم الذي تريد تذكره؟', 'What concept do you want to remember?')} />
            <small>{front.length}/{MAX_FRONT_LENGTH}</small>
          </div>
          <div className="field">
            <label htmlFor="flashcard-back">{text('الإجابة / ظهر البطاقة', 'Answer / back')}</label>
            <textarea className="input" id="flashcard-back" rows={5} required maxLength={MAX_BACK_LENGTH} value={back} onChange={e => setBack(e.target.value)} placeholder={text('اكتب الإجابة بشكل واضح ومختصر.', 'Write a clear, concise answer.')} />
            <small>{back.length}/{MAX_BACK_LENGTH}</small>
          </div>
          <div className="field">
            <label htmlFor="flashcard-deck">{text('اسم المجموعة', 'Deck name')}</label>
            <input className="input" id="flashcard-deck" maxLength={MAX_DECK_LENGTH} value={deck} onChange={e => setDeck(e.target.value)} placeholder={text('مثلاً: Anatomy', 'e.g. Anatomy')} />
          </div>
          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={!loaded}>{editingId ? text('احفظ التعديل', 'Save changes') : text('إضافة بطاقة', 'Add card')}</button>
            {editingId && <button className="btn btn-outline" type="button" onClick={clearEditor}>{text('إلغاء', 'Cancel')}</button>}
          </div>
          <div className="note">{text(
            'البيانات محفوظة على هذا الجهاز فقط. لا تتزامن مع حسابك؛ صدّر نسخة JSON للاحتفاظ بها.',
            'Cards are saved only on this device, not synced to your account. Export a JSON backup to keep them safe.',
          )}</div>
        </form>
        <section className="panel stack">
          <div className="flashcards-list-header">
            <h2 className="panel-title">{text('بطاقاتي', 'My cards')} ({visible.length})</h2>
            <div className="actions">
              <button className="small-btn" type="button" disabled={!cards.length} onClick={exportCards}>{text('تصدير JSON', 'Export JSON')}</button>
              <button type="button" className="small-btn flashcards-import" onClick={() => document.getElementById('flashcards-import')?.click()}>{text('استيراد JSON', 'Import JSON')}</button>
              <input id="flashcards-import" className="flashcards-file-input" type="file" accept=".json,application/json" onChange={e => void importCards(e)} />
            </div>
          </div>
          {!loaded ? <p>{text('جاري استعادة البطاقات...', 'Loading saved cards...')}</p>
            : !visible.length ? <div className="placeholder">{text('ابدأ بإضافة بطاقة سؤال وإجابة.', 'Add a question-and-answer card to begin.')}</div>
            : <div className="flashcards-list">{visible.map(card => <article className="flashcard-item" key={card.id}>
                <div>
                  <b dir="auto">{card.front}</b>
                  <small>{card.deck} · {text('المراجعة القادمة:', 'Next review:')} {new Date(card.dueAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</small>
                </div>
                <div className="actions">
                  <button type="button" className="small-btn" onClick={() => editCard(card)}>{text('تعديل', 'Edit')}</button>
                  <button type="button" className="small-btn danger-btn" onClick={() => deleteCard(card.id)}>{text('حذف', 'Delete')}</button>
                </div>
              </article>)}</div>}
        </section>
      </div> : <section className="panel stack flashcard-review-panel">
        <h2 className="panel-title">{text('المراجعة النشطة', 'Active recall')}</h2>
        {!current ? <div className="placeholder">{text('لا توجد بطاقات مستحقة الآن. ارجع لاحقًا أو أضف بطاقات جديدة.', 'No cards due right now. Come back later or add new cards.')}</div> : <>
          <p className="inline-help">{current.deck} · {due.length} {text('بطاقة مستحقة', 'due cards')}</p>
          <div className="flashcard-review" aria-live="polite">
            <small>{text('السؤال', 'Question')}</small>
            <h3 dir="auto">{current.front}</h3>
            {revealed && <div className="flashcard-answer">
              <small>{text('الإجابة', 'Answer')}</small>
              <p dir="auto">{current.back}</p>
            </div>}
          </div>
          {!revealed ? <button type="button" className="btn btn-primary" onClick={() => setRevealed(true)}>{text('اعرض الإجابة', 'Reveal answer')}</button>
            : <div className="flashcard-rating" role="group" aria-label={text('قيّم تذكّرك', 'Rate your recall')}>
              <button type="button" onClick={() => rate('again')} className="btn btn-outline">{text('لم أتذكر', 'Again')}</button>
              <button type="button" onClick={() => rate('hard')} className="btn btn-outline">{text('صعب', 'Hard')}</button>
              <button type="button" onClick={() => rate('good')} className="btn btn-primary">{text('جيد', 'Good')}</button>
              <button type="button" onClick={() => rate('easy')} className="btn btn-outline">{text('سهل', 'Easy')}</button>
            </div>}
        </>}
        <p className="inline-help">{text('«لم أتذكر» تعيد السؤال بعد 10 دقائق. الخيارات الأخرى تؤجّل المراجعة أيامًا حسب تقييمك.', 'Again repeats the question after 10 minutes. Other ratings schedule later reviews based on your recall.')}</p>
      </section>}
    </div></div>
  </>;
}
