/* Обществоведение: тренажёр. Без сборки и зависимостей — открывается как обычная страница. */
(function () {
  'use strict';
  const TERMS = window.TERMS, SCHEMES = window.SCHEMES, OLYMP = window.OLYMP, PERSONS = window.PERSONS;
  const CHAPTERS = window.CHAPTERS, SECTIONS = window.SECTIONS;
  const app = document.getElementById('app');

  /* ───────── утилиты ───────── */
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) n.append(kid.nodeType ? kid : document.createTextNode(kid));
    return n;
  }
  const rnd = n => Math.floor(Math.random() * n);
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const lcf = s => (/^[А-ЯЁ][а-яё]/.test(s) && !/^(Я-|Президент|Парламент|Национальн|Совет|Палат|Правительств|Конституц|Бог|Интернет|Республик)/.test(s)) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  const base = t => t.term.replace(/\s*\(.*\)$/, '');
  const tkey = t => t.g + '|' + t.term;
  const chapOf = t => CHAPTERS[t.g].findIndex(c => t.s >= c.from && t.s <= c.to);
  const secLabel = t => `${t.g} кл. · § ${t.s}. ${SECTIONS[t.g][t.s]}`;
  const fmt = x => (Math.round(x * 10) / 10).toString().replace('.', ',');

  function norm(s) {
    return s.toLowerCase().replace(/ё/g, 'е').replace(/[«»"'`().,;:!?]/g, ' ').replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  /** 2 — точно, 1 — с опечаткой, 0 — неверно */
  function matchAnswer(input, answers) {
    const v = norm(input); if (!v) return 0;
    let best = 0;
    for (const a of answers) {
      const n = norm(a);
      if (v === n) return 2;
      const d = lev(v, n);
      if ((n.length >= 6 && d <= 1) || (n.length >= 11 && d <= 2)) best = 1;
    }
    return best;
  }

  /* ───────── хранилище прогресса ───────── */
  const KEY = 'obsh.v1';
  let store = { terms: {}, log: [], prefs: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.terms) store = Object.assign(store, s); } catch (e) { /* нет доступа — работаем без сохранения */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* игнорируем */ } }
  function mark(key, ok) {
    if (!key) return;
    const r = store.terms[key] || (store.terms[key] = { c: 0, w: 0 });
    if (ok) r.c++; else r.w++;
    r.t = Date.now(); save();
  }
  const isWeak = t => { const r = store.terms[tkey(t)]; return r && r.w > 0 && r.w >= r.c; };

  /* ───────── область (класс / раздел / параграф) ───────── */
  function scopeSelect(value, onchange, withWeak) {
    const sel = el('select', { onchange: () => onchange(sel.value), 'aria-label': 'Тема' });
    sel.append(el('option', { value: 'all' }, 'Все темы (9 и 10 классы)'));
    if (withWeak) sel.append(el('option', { value: 'weak' }, '★ Только мои ошибки'));
    for (const g of [9, 10]) {
      const og = el('optgroup', { label: g + ' класс' });
      og.append(el('option', { value: 'g' + g }, `${g} класс — весь курс`));
      CHAPTERS[g].forEach((c, i) => {
        og.append(el('option', { value: `c${g}-${i}` }, `Раздел ${c.n}. ${c.title}`));
        for (let s = c.from; s <= c.to; s++) og.append(el('option', { value: `s${g}-${s}` }, `   § ${s}. ${SECTIONS[g][s]}`));
      });
      sel.append(og);
    }
    sel.value = value; if (!sel.value) sel.value = 'all';
    return sel;
  }
  function inScope(x, scope) {
    if (!scope || scope === 'all') return true;
    if (scope === 'weak') return x.term ? isWeak(x) : true;
    const m = /^([gcs])(\d+)(?:-(\d+))?$/.exec(scope); if (!m) return true;
    const g = +m[2]; if (x.g !== g) return false;
    if (m[1] === 'g') return true;
    if (m[1] === 'c') { const c = CHAPTERS[g][+m[3]]; return x.s >= c.from && x.s <= c.to; }
    return x.s === +m[3];
  }
  function scopeName(scope) {
    if (scope === 'weak') return 'мои ошибки';
    const m = /^([gcs])(\d+)(?:-(\d+))?$/.exec(scope || ''); if (!m) return 'все темы';
    if (m[1] === 'g') return m[2] + ' класс';
    if (m[1] === 'c') return `${m[2]} кл., раздел ${CHAPTERS[m[2]][+m[3]].n}`;
    return `${m[2]} кл., § ${m[3]}`;
  }

  /* ───────── подбор близких (похожих) вариантов ───────── */
  function distractors(t, n) {
    const used = new Set([norm(base(t))]); const out = [];
    const tiers = [
      x => x.grp === t.grp && x.g === t.g,
      x => x.g === t.g && x.s === t.s,
      x => x.g === t.g && chapOf(x) === chapOf(t),
      x => x.g === t.g, () => true];
    for (const f of tiers) {
      for (const x of shuffle(TERMS.filter(f))) {
        const b = norm(base(x));
        if (used.has(b)) continue;
        used.add(b); out.push(x);
        if (out.length === n) return out;
      }
    }
    return out;
  }
  // скрываем в определении слова, выдающие ответ (кроме слов, общих для всего «гнезда»)
  const wordsOf = s => (norm(s).match(/[a-zа-я]{4,}/g) || []);
  const wstem = w => w.slice(0, Math.max(4, w.length - 3));
  const grpCache = {};
  function commonWords(t) {
    const k = t.g + '|' + t.grp;
    if (!grpCache[k]) {
      const cnt = {}; const mem = TERMS.filter(x => x.g === t.g && x.grp === t.grp);
      mem.forEach(x => new Set(wordsOf(base(x)).map(wstem)).forEach(w => { cnt[w] = (cnt[w] || 0) + 1; }));
      grpCache[k] = new Set(Object.keys(cnt).filter(w => cnt[w] >= Math.max(2, mem.length / 2)));
    }
    return grpCache[k];
  }
  function maskDef(t) {
    const common = commonWords(t);
    const stems = wordsOf(base(t)).filter(w => !/^(республик|беларус|человек|общество|государств)/.test(w) || wordsOf(base(t)).length === 1).map(wstem).filter(w => !common.has(w));
    if (!stems.length) return t.def;
    return t.def.replace(/[A-Za-zА-Яа-яЁё]{4,}/g, w => stems.some(s => norm(w).startsWith(s)) ? '▢▢▢' : w);
  }

  /* ───────── доска «карточки → ячейки» (схемы, таблицы, соотнесение) ───────── */
  function board(sc) {
    const zones = []; let sel = null; let locked = false;
    const bank = el('div', { class: 'bank', 'aria-label': 'Карточки' });
    function makeChip(v) {
      const c = el('button', { class: 'chip', type: 'button', draggable: 'true' }, v);
      c.dataset.v = v;
      c.addEventListener('click', e => {
        e.stopPropagation(); if (locked) return;
        if (c.parentElement !== bank) { bank.append(c); refresh(); return; }
        if (sel === c) sel = null; else sel = c;
        refresh();
      });
      c.addEventListener('dragstart', e => { if (locked) { e.preventDefault(); return; } sel = c; e.dataTransfer.setData('text/plain', v); refresh(); });
      return c;
    }
    function place(z) {
      if (locked || !sel) return;
      if (z.capN === 1 && z.el.querySelector('.chip')) bank.append(z.el.querySelector('.chip'));
      if (z.el.querySelectorAll('.chip').length >= z.capN) return;
      z.el.append(sel); sel = null; refresh();
    }
    function makeZone(accept, capN, hint) {
      const z = { accept: new Set(accept), capN, el: el('div', { class: 'zone', tabindex: '0', role: 'button', 'aria-label': hint || 'Ячейка для карточки' }) };
      z.el.addEventListener('click', () => place(z));
      z.el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); place(z); } });
      z.el.addEventListener('dragover', e => e.preventDefault());
      z.el.addEventListener('drop', e => { e.preventDefault(); place(z); });
      zones.push(z); return z.el;
    }
    function refresh() {
      bank.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', c === sel));
      zones.forEach(z => z.el.classList.toggle('can', !!sel && !locked));
    }
    let body; const values = [];
    if (sc.type === 'classify') {
      body = el('div', { class: 'cols' }, sc.cols.map(c => { values.push(...c.items); return el('div', { class: 'col' }, el('h4', null, c.name), makeZone(c.items, c.items.length, c.name)); }));
    } else if (sc.type === 'order') {
      body = el('div', { class: 'steps' }, sc.steps.map((s, i) => { values.push(s); return el('div', { class: 'step' }, el('span', { class: 'n' }, i + 1), makeZone([s], 1, 'Шаг ' + (i + 1))); }));
    } else {
      body = el('table', { class: 'tbl' },
        el('thead', null, el('tr', null, sc.head.map(hd => el('th', null, hd)))),
        el('tbody', null, sc.rows.map(r => el('tr', null, el('td', { class: 'lab' }, r[0]),
          r.slice(1).map((v, i) => { values.push(v); return el('td', { 'data-h': sc.head[i + 1] }, makeZone([v], 1, r[0])); })))));
    }
    shuffle([...new Set(values.concat(sc.extra || []))]).forEach(v => bank.append(makeChip(v)));
    const node = el('div', null,
      el('p', { class: 'muted small' }, 'Нажмите на карточку, затем на ячейку (или перетащите). Нажатие на размещённую карточку возвращает её обратно.', (sc.extra && sc.extra.length) ? ' Среди карточек есть лишние.' : ''),
      bank, body);
    function check() {
      locked = true; sel = null; refresh();
      let ok = 0, total = 0;
      zones.forEach(z => {
        total += z.capN; const placed = [...z.el.querySelectorAll('.chip')]; const got = new Set();
        placed.forEach(c => { const good = z.accept.has(c.dataset.v) && !got.has(c.dataset.v); if (good) { ok++; got.add(c.dataset.v); } c.classList.add(good ? 'ok' : 'bad'); c.disabled = true; });
        const miss = [...z.accept].filter(v => !got.has(v));
        if (miss.length) z.el.append(el('div', { class: 'ans' }, '✓ ' + miss.join('; ')));
      });
      bank.querySelectorAll('.chip').forEach(c => { c.disabled = true; });
      return { ok, total };
    }
    return { node, check };
  }

  /* ───────── движок викторины ───────── */
  function runQuiz(host, cfg) {
    const qs = cfg.questions; let i = 0, pts = 0; const wrong = [];
    if (!qs.length) { host.replaceChildren(el('div', { class: 'card' }, el('p', null, 'В выбранной теме пока нет заданий этого типа. Выберите другую тему.'))); return; }
    let keyHandler = null;
    function setKeys(fn) { if (keyHandler) document.removeEventListener('keydown', keyHandler); keyHandler = fn; if (fn) document.addEventListener('keydown', fn); }
    cleanup = () => setKeys(null);

    function show() {
      const q = qs[i]; let answered = false;
      const fb = el('div', { 'aria-live': 'polite' });
      const next = el('button', { class: 'btn', type: 'button', disabled: true, onclick: go }, i === qs.length - 1 ? 'Результат' : 'Дальше →');
      function go() { if (!answered) return; i++; if (i < qs.length) show(); else finish(); }
      function done(gain, node, cls) {
        answered = true; pts += gain;
        if (gain < 1) wrong.push(q);
        if (q.key) mark(q.key, gain >= 1);
        fb.replaceChildren(el('div', { class: 'fb ' + cls }, node));
        next.disabled = false; next.focus({ preventScroll: true });
      }
      const card = el('div', { class: 'card' },
        el('div', { class: 'qmeta' }, el('span', null, `Вопрос ${i + 1} из ${qs.length}`), el('span', null, 'Баллы: ' + fmt(pts))),
        el('div', { class: 'progress' }, el('i', { style: `width:${(i / qs.length) * 100}%` })),
        q.tag ? el('div', null, el('span', { class: 'tag' }, q.tag), q.extra ? el('span', { class: 'tag x', title: 'Понятие встречается в олимпиадах; в пособии нет отдельного определения' }, 'олимпиадное') : null) : null);

      if (q.kind === 'mcq') {
        card.append(el('div', { class: 'q' + (q.big ? ' term' : '') }, q.lead ? el('div', { class: 'muted small' }, q.lead) : null, q.prompt));
        const btns = q.opts.map((o, k) => el('button', { class: 'opt', type: 'button', onclick: () => pick(k) }, el('span', { class: 'k' }, k + 1), el('span', null, o.label)));
        const pick = k => {
          if (answered) return;
          btns.forEach((b, j) => { b.disabled = true; if (q.opts[j].ok) b.classList.add('ok'); });
          const good = !!q.opts[k].ok; if (!good) btns[k].classList.add('bad');
          done(good ? 1 : 0, [el('b', { class: 'h' }, good ? 'Верно!' : 'Неверно'), q.explain ? q.explain(k) : null], good ? 'ok' : 'bad');
        };
        card.append(el('div', { class: 'opts' }, btns));
        setKeys(e => {
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
          if (!answered && e.key >= '1' && e.key <= String(btns.length)) pick(+e.key - 1);
          else if (answered && e.key === 'Enter') { e.preventDefault(); go(); }
        });
      } else if (q.kind === 'input') {
        card.append(el('div', { class: 'q' }, q.lead ? el('div', { class: 'muted small' }, q.lead) : null, q.prompt));
        const inp = el('input', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: 'Введите ответ…', 'aria-label': 'Ответ' });
        const hint = el('div', { class: 'hint' });
        let hinted = 0; const main = q.answers[0];
        const submit = () => {
          if (answered || !inp.value.trim()) return;
          const r = matchAnswer(inp.value, q.answers); inp.disabled = true;
          const gain = r ? (hinted ? .5 : 1) : 0;
          done(gain, [el('b', { class: 'h' }, r === 2 ? (hinted ? 'Верно (с подсказкой — 0,5 балла)' : 'Верно!') : r === 1 ? 'Верно, но проверьте написание' : 'Неверно'),
            el('div', null, 'Правильный ответ: ', el('b', null, main)), q.explain ? q.explain() : null], r === 2 ? 'ok' : r === 1 ? 'warn' : 'bad');
        };
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); submit(); } });
        const showHint = () => {
          hinted++; const n = Math.min(hinted, Math.max(1, Math.floor(main.length / 3)));
          hint.textContent = main.split('').map((ch, j) => (/[\s-]/.test(ch) ? ch : (j < n ? ch : '•'))).join('') + `  (букв: ${main.replace(/[\s-]/g, '').length})`;
        };
        card.append(el('div', { class: 'typed' }, inp, el('button', { class: 'btn', type: 'button', onclick: submit }, 'Проверить'),
          el('button', { class: 'btn ghost', type: 'button', onclick: showHint }, 'Подсказка'),
          el('button', { class: 'btn ghost', type: 'button', onclick: () => { if (!answered) { inp.value = inp.value || '—'; inp.disabled = true; done(0, [el('b', { class: 'h' }, 'Правильный ответ'), el('div', null, el('b', null, main)), q.explain ? q.explain() : null], 'bad'); } } }, 'Не знаю')), hint);
        setKeys(e => { if (answered && e.key === 'Enter') { e.preventDefault(); go(); } });
        setTimeout(() => inp.focus({ preventScroll: true }), 0);
      } else { // board
        card.append(el('h2', null, q.title), q.lead ? el('p', { class: 'muted small' }, q.lead) : null);
        const b = board(q.scheme); card.append(b.node);
        const chk = el('button', { class: 'btn', type: 'button', onclick: () => {
          if (answered) return; chk.disabled = true;
          const r = b.check(); const frac = r.total ? r.ok / r.total : 0;
          done(frac, [el('b', { class: 'h' }, frac === 1 ? 'Всё верно!' : `Верно ${r.ok} из ${r.total}`), frac < 1 ? el('div', null, 'Зелёным подписаны правильные ответы для незаполненных и ошибочных ячеек.') : null, q.explain ? q.explain() : null], frac === 1 ? 'ok' : frac >= .5 ? 'warn' : 'bad');
        } }, 'Проверить');
        card.append(el('div', { class: 'row', style: 'margin-top:14px' }, chk));
        setKeys(null);
      }
      card.append(fb, el('div', { class: 'row end' }, el('span', { class: 'muted small' }, q.kind === 'mcq' ? 'Клавиши 1–4 — выбор, Enter — дальше' : ''), next));
      host.replaceChildren(card);
      window.scrollTo({ top: 0 });
    }
    function finish() {
      setKeys(null);
      const pct = Math.round((pts / qs.length) * 100);
      store.log.unshift({ d: Date.now(), m: cfg.title, s: Math.round(pts * 10) / 10, n: qs.length }); store.log = store.log.slice(0, 100); save();
      const verdict = pct >= 90 ? 'Отлично! Олимпиадный уровень.' : pct >= 70 ? 'Хороший результат — осталось закрепить.' : pct >= 50 ? 'Неплохо, но есть что повторить.' : 'Стоит ещё раз прочитать параграф и вернуться.';
      host.replaceChildren(el('div', { class: 'card' },
        el('p', { class: 'muted' }, cfg.title),
        el('div', { class: 'score' }, `${fmt(pts)} / ${qs.length}`),
        el('p', null, `${pct} % — ${verdict}`),
        wrong.length ? el('div', null, el('h3', null, 'Что повторить'), el('ul', null, wrong.slice(0, 30).map(q => el('li', null, q.review || q.title || '')))) : null,
        el('div', { class: 'row', style: 'margin-top:16px' },
          el('button', { class: 'btn', type: 'button', onclick: cfg.again }, 'Ещё раз'),
          el('a', { class: 'btn ghost', href: '#/', style: 'text-decoration:none' }, 'К списку игр'))));
    }
    show();
  }
  let cleanup = null;

  /* ───────── генераторы заданий ───────── */
  function pickTerms(scope, n, allowExtra) {
    let pool = TERMS.filter(t => inScope(t, scope) && (allowExtra || !t.extra));
    // чаще показываем то, в чём ошибались, и то, что ещё не встречалось
    const w = t => { const r = store.terms[tkey(t)]; return !r ? 1.5 : Math.max(.3, 1 + r.w * 1.2 - r.c * .35); };
    const out = []; pool = pool.slice();
    while (out.length < n && pool.length) {
      const sum = pool.reduce((a, t) => a + w(t), 0); let x = Math.random() * sum, k = 0;
      for (; k < pool.length - 1; k++) { x -= w(pool[k]); if (x <= 0) break; }
      out.push(pool.splice(k, 1)[0]);
    }
    return out;
  }
  const explainTerm = (t, others) => () => el('div', null,
    el('div', null, el('b', null, cap(base(t))), ' — ', lcf(t.def)),
    others && others.length ? el('details', { class: 'more' }, el('summary', null, 'Чем отличаются остальные варианты'), el('ul', null, others.map(o => el('li', null, el('b', null, cap(base(o))), ' — ', lcf(o.def))))) : null,
    el('div', { class: 'muted small', style: 'margin-top:6px' }, secLabel(t)));

  const GEN = {
    def2term(scope, n, ex) {
      return pickTerms(scope, n, ex).map(t => {
        const ds = distractors(t, 3);
        return { kind: 'mcq', key: tkey(t), tag: secLabel(t), extra: t.extra, lead: 'О каком понятии идёт речь?', prompt: maskDef(t),
          opts: shuffle([{ label: cap(base(t)), ok: true }, ...ds.map(d => ({ label: cap(base(d)) }))]), explain: explainTerm(t, ds), review: `${cap(base(t))} — ${lcf(t.def)}` };
      });
    },
    term2def(scope, n, ex) {
      return pickTerms(scope, n, ex).map(t => {
        const ds = distractors(t, 3);
        return { kind: 'mcq', key: tkey(t), tag: secLabel(t), extra: t.extra, big: true, lead: 'Выберите верное определение', prompt: cap(t.term),
          opts: shuffle([{ label: maskDef(t), ok: true }, ...ds.map(d => ({ label: maskDef(d) }))]), explain: explainTerm(t, ds), review: `${cap(base(t))} — ${lcf(t.def)}` };
      });
    },
    type(scope, n, ex) {
      return pickTerms(scope, n, ex).map(t => ({ kind: 'input', key: tkey(t), tag: secLabel(t), extra: t.extra, lead: 'Впишите понятие', prompt: maskDef(t),
        answers: [base(t), t.term, ...t.alt], explain: () => el('div', { class: 'muted small', style: 'margin-top:6px' }, secLabel(t)), review: `${cap(base(t))} — ${lcf(t.def)}` }));
    },
    truefalse(scope, n, ex) {
      const stmt = (t, truth, avoid) => {
        const other = truth ? null : distractors(t, 8).find(x => !avoid.includes(x) && x.def !== t.def);
        if (!other) truth = true;
        return { t, truth, other, text: `${cap(base(t))} — это ${lcf((truth ? t : other).def).replace(/\.$/, '')}.` };
      };
      return pickTerms(scope, n, ex).map(t => {
        const mate = distractors(t, 6).find(x => x.def !== t.def) || t;
        const A = stmt(t, Math.random() < .5, [mate]), B = stmt(mate, Math.random() < .5, [t, A.other]);
        const right = A.truth && B.truth ? 2 : A.truth ? 0 : B.truth ? 1 : 3;
        const why = s => el('li', null, el('b', null, s === A ? 'А' : 'Б'), s.truth ? ' — верно. ' : ` — неверно: это определение понятия «${base(s.other)}». `, !s.truth ? [el('b', null, cap(base(s.t))), ' — ', lcf(s.t.def)] : null);
        return { kind: 'mcq', key: tkey(t), tag: secLabel(t), lead: 'Верны ли следующие суждения?',
          prompt: el('div', null, el('div', { class: 'stmt' }, el('b', null, 'А.'), ' ', A.text), el('div', { class: 'stmt' }, el('b', null, 'Б.'), ' ', B.text)),
          opts: ['Верно только А', 'Верно только Б', 'Верны оба суждения', 'Оба суждения неверны'].map((label, k) => ({ label, ok: k === right })),
          explain: () => el('ul', null, why(A), why(B)), review: `${cap(base(t))} — ${lcf(t.def)}` };
      });
    },
    match(scope, n, ex) {
      const groups = {};
      TERMS.filter(t => inScope(t, scope) && (ex || !t.extra)).forEach(t => { (groups[t.g + '|' + t.s + '|' + t.grp] = groups[t.g + '|' + t.s + '|' + t.grp] || []).push(t); });
      const sets = shuffle(Object.values(groups).filter(a => a.length >= 3)).slice(0, n);
      return sets.map(a => {
        const items = shuffle(a).slice(0, 5); const names = new Set(items.map(t => norm(base(t))));
        const extra = distractors(items[0], 8).filter(d => !names.has(norm(base(d)))).slice(0, 1).map(d => cap(base(d)));
        return { kind: 'board', title: 'Соотнесите понятия и определения', lead: secLabel(items[0]), review: 'Соотнесение: ' + items.map(t => base(t)).join(', '),
          scheme: { type: 'table', head: ['Определение', 'Понятие'], rows: items.map(t => [maskDef(t), cap(base(t))]), extra } };
      });
    },
    schemes(scope, n) {
      return shuffle(SCHEMES.filter(s => inScope(s, scope === 'weak' ? 'all' : scope))).slice(0, n).map(s => ({ kind: 'board', title: s.title, lead: `${s.g} кл. · § ${s.s}. ${SECTIONS[s.g][s.s]}`, scheme: s, review: `Схема «${s.title}» (${s.g} кл., § ${s.s})` }));
    },
    persons(scope, n) {
      return shuffle(PERSONS).slice(0, n).map(p => {
        const same = shuffle(PERSONS.filter(x => x !== p && x.grp === p.grp)), rest = shuffle(PERSONS.filter(x => x !== p && x.grp !== p.grp));
        const ds = same.concat(rest).slice(0, 3);
        return { kind: 'mcq', lead: 'О ком идёт речь?', prompt: p.fact, opts: shuffle([{ label: p.name, ok: true }, ...ds.map(d => ({ label: d.name }))]),
          explain: () => el('ul', null, ds.map(d => el('li', null, el('b', null, d.name), ' — ', lcf(d.fact)))), review: `${p.name}: ${p.fact}` };
      });
    }
  };
  const MODES = [
    { id: 'def2term', ico: '🎯', name: 'Узнай понятие', desc: 'Дано определение — выберите понятие из четырёх близких по смыслу.' },
    { id: 'term2def', ico: '📖', name: 'Выбери определение', desc: 'Дано понятие — найдите его определение среди похожих.' },
    { id: 'type', ico: '⌨️', name: 'Впиши понятие', desc: 'Вариантов нет: введите термин сами, как в олимпиадной части «Запишите ответ».' },
    { id: 'schemes', ico: '🧩', name: 'Схемы и таблицы', desc: 'Заполните схему, таблицу или последовательность из учебника.', noExtra: true, counts: [3, 5, 10] },
    { id: 'match', ico: '🔗', name: 'Соотнеси', desc: 'Сопоставьте несколько близких понятий с их определениями.', counts: [3, 5, 8] },
    { id: 'truefalse', ico: '⚖️', name: 'Верны ли суждения?', desc: 'Формат «верно А / верно Б / оба / ни одного», как в олимпиадных тестах.' },
    { id: 'persons', ico: '🧠', name: 'Кто это?', desc: 'Учёные и мыслители: кто что создал и кому принадлежит высказывание.', noScope: true, noExtra: true }
  ];

  /* ───────── страницы ───────── */
  function pageHome() {
    const answered = Object.values(store.terms).reduce((a, r) => a + r.c + r.w, 0);
    app.replaceChildren(
      el('section', { class: 'hero' }, el('h1', null, 'Готовимся к олимпиаде по обществоведению'),
        el('p', null, `Тренажёр по учебным пособиям 9 и 10 классов: ${TERMS.length} понятий, ${SCHEMES.length} схем и таблиц, олимпиадные варианты и поиск ответов по тексту учебника. В заданиях неверные варианты подобраны из близких понятий той же темы — угадать не получится.`),
        answered ? el('p', { class: 'small' }, `Вы уже ответили на ${answered} вопр. `, el('a', { href: '#/progress' }, 'Посмотреть прогресс →')) : null),
      el('h2', { class: 'section-title' }, 'Игры с понятиями'),
      el('div', { class: 'grid' }, MODES.map(m => el('a', { class: 'card tile', href: '#/play/' + m.id }, el('span', { class: 'ico', 'aria-hidden': 'true' }, m.ico), el('b', null, m.name), el('span', null, m.desc)))),
      el('h2', { class: 'section-title' }, 'Ещё'),
      el('div', { class: 'grid' },
        el('a', { class: 'card tile', href: '#/search' }, el('span', { class: 'ico', 'aria-hidden': 'true' }, '🔎'), el('b', null, 'Поиск по учебнику'), el('span', null, 'Задайте вопрос — получите определение и фрагменты учебника с номером параграфа и страницы.')),
        el('a', { class: 'card tile', href: '#/olymp' }, el('span', { class: 'ico', 'aria-hidden': 'true' }, '🏆'), el('b', null, 'Олимпиадные варианты'), el('span', null, 'Задания первого этапа республиканской олимпиады с пояснениями к ответам.')),
        el('a', { class: 'card tile', href: '#/terms' }, el('span', { class: 'ico', 'aria-hidden': 'true' }, '🗂️'), el('b', null, 'Словарь понятий'), el('span', null, 'Все понятия по параграфам — для повторения перед игрой.'))));
  }

  function pagePlay(id) {
    const mode = MODES.find(m => m.id === id); if (!mode) return pageHome();
    const p = store.prefs; const counts = mode.counts || [10, 20, 30];
    let scope = mode.noScope ? 'all' : (p.scope || 'all'); let n = counts.includes(p['n_' + id]) ? p['n_' + id] : counts[0]; let ex = p.ex !== false;
    const host = el('div');
    const start = () => {
      p.scope = mode.noScope ? p.scope : scope; p['n_' + id] = n; p.ex = ex; save();
      if (cleanup) cleanup();
      runQuiz(host, { title: `${mode.name} · ${scopeName(scope)}`, questions: GEN[id](scope, n, ex), again: start });
    };
    const cnt = el('select', { 'aria-label': 'Количество заданий', onchange: () => { n = +cnt.value; start(); } }, counts.map(c => el('option', { value: c, selected: c === n }, c + ' заданий')));
    const chk = el('input', { type: 'checkbox', checked: ex, onchange: () => { ex = chk.checked; start(); } });
    app.replaceChildren(
      el('h1', null, mode.ico + ' ' + mode.name), el('p', { class: 'muted' }, mode.desc),
      el('div', { class: 'bar' },
        mode.noScope ? null : el('label', { style: 'flex:3 1 260px' }, 'Тема', scopeSelect(scope, v => { scope = v; start(); }, id !== 'schemes')),
        el('label', { style: 'flex:1 1 130px' }, 'Сколько', cnt),
        mode.noExtra ? null : el('label', { class: 'chk', title: 'Понятия, которые встречаются в олимпиадных заданиях, но не имеют отдельного определения в пособии' }, chk, 'с олимпиадными понятиями')),
      host);
    start();
  }

  function pageOlymp(id) {
    const v = OLYMP.find(x => x.id === id);
    if (!v) {
      app.replaceChildren(el('h1', null, '🏆 Олимпиадные варианты'),
        el('p', { class: 'muted' }, 'Задания первого этапа республиканской олимпиады. После каждого ответа — пояснение. Задания на соответствие выполняются карточками, открытые вопросы — вводом слова.'),
        el('div', { class: 'grid' }, OLYMP.map(o => el('a', { class: 'card tile', href: '#/olymp/' + o.id }, el('b', null, o.title), el('span', null, `${o.tasks.length} заданий: тест, соответствие, «запишите ответ»`)))),
        el('p', { class: 'small muted', style: 'margin-top:18px' }, 'Часть вопросов выходит за рамки пособий 9–10 классов (например, XI класс). Спорные вопросы помечены в пояснениях.'));
      return;
    }
    const host = el('div');
    const start = () => {
      if (cleanup) cleanup();
      const qs = v.tasks.map(t => {
        const e = t.e ? () => el('div', null, t.e) : null;
        if (t.t === 'mcq') return { kind: 'mcq', prompt: t.q, opts: t.o.map((label, k) => ({ label, ok: k === t.a })), explain: e, review: `${t.q} — ${t.o[t.a]}` };
        if (t.t === 'input') return { kind: 'input', prompt: t.q, answers: t.a, explain: e, review: `${t.q} — ${t.a[0]}` };
        return { kind: 'board', title: t.q, explain: e, review: t.q, scheme: { type: 'table', head: ['Характеристика', 'Понятие'], rows: t.p.map(x => [x[1], x[0]]), extra: t.x } };
      });
      runQuiz(host, { title: v.title, questions: qs, again: start });
    };
    app.replaceChildren(el('p', { class: 'small' }, el('a', { href: '#/olymp' }, '← Все варианты')), el('h1', null, v.title), host);
    start();
  }

  /* ───────── поиск по учебнику ───────── */
  const STOP = new Set('что такое как какие какой какая какое каков это этот эта эти в во и на чем чём для кто почему называется называют называть является являются ли или по к ко с со о об от из у же бы не а но то его ее её их при так все всё дайте дать определение определения понятие понятия термин значит означает объясните расскажите про между чего кого где когда зачем если есть быть бывает бывают можно нужно относится относятся входит входят также тоже еще ещё'.split(' ').map(w => w.replace(/ё/g, 'е')));
  function stem(w) {
    w = w.toLowerCase().replace(/ё/g, 'е');
    if (w.length > 4) {
      const r = w.replace(/(иями|ями|ами|ией|иям|иях|ого|его|ому|ему|ыми|ими|ость|ости|остью|ение|ения|ению|ая|яя|ое|ее|ые|ие|ый|ий|ой|ей|ов|ев|ам|ям|ах|ях|ом|ем|ую|юю|ия|ию|ии|а|я|о|е|ы|и|у|ю|ь|й)$/, '');
      if (r.length >= 3) w = r;
    }
    return w.slice(0, 9);
  }
  const tokens = s => (s.toLowerCase().match(/[a-zа-яё]{2,}/g) || []);
  const qStems = s => [...new Set(tokens(s).map(w => w.replace(/ё/g, 'е')).filter(w => !STOP.has(w)).map(stem))];
  let IDX = null;
  function loadCorpus() {
    return new Promise((res, rej) => {
      if (window.CORPUS) return res();
      const s = el('script', { src: 'data/corpus.js' }); s.onload = () => res(); s.onerror = () => rej(new Error('corpus')); document.head.append(s);
    });
  }
  function buildIndex() {
    if (IDX) return IDX;
    const docs = window.CORPUS.map(d => {
      const tf = new Map(); const ts = tokens(d[3]).map(stem); ts.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));
      const bold = new Set(); (d[3].match(/⟦[^⟧]+⟧/g) || []).forEach(b => tokens(b).forEach(w => bold.add(stem(w))));
      return { g: d[0], s: d[1], p: d[2], text: d[3], tf, len: ts.length, bold };
    });
    const df = new Map(); docs.forEach(d => d.tf.forEach((_, t) => df.set(t, (df.get(t) || 0) + 1)));
    const avg = docs.reduce((a, d) => a + d.len, 0) / docs.length;
    TERMS.forEach(t => { t._st = [...new Set(tokens(base(t)).map(stem))]; t._all = new Set(tokens(t.term + ' ' + t.def + ' ' + t.alt.join(' ')).map(stem)); });
    SCHEMES.forEach(s => { s._st = new Set(tokens(s.title).map(stem)); });
    return (IDX = { docs, df, avg, N: docs.length });
  }
  function search(q, grade) {
    const I = buildIndex(); const qs = qStems(q); if (!qs.length) return null;
    const need = qs.length >= 3 ? Math.ceil(qs.length * .6) : qs.length >= 2 ? 2 : 1;
    const passages = [];
    for (const d of I.docs) {
      if (grade && d.g !== grade) continue;
      let sc = 0, hit = 0, bold = 0;
      for (const t of qs) {
        const f = d.tf.get(t); if (!f) continue; hit++;
        const idf = Math.log(1 + (I.N - I.df.get(t) + .5) / (I.df.get(t) + .5));
        sc += idf * (f * 2.4) / (f + 1.4 * (1 - .6 + .6 * d.len / I.avg));
        if (d.bold.has(t)) bold++;
      }
      if (hit < Math.min(need, qs.length)) continue;
      sc *= (hit / qs.length) ** 2 * (1 + .8 * bold / qs.length);
      passages.push({ d, sc });
    }
    passages.sort((a, b) => b.sc - a.sc);
    const qset = new Set(qs);
    const terms = TERMS.filter(t => (!grade || t.g === grade)).map(t => {
      const inQ = t._st.filter(s => qset.has(s)).length; const cover = qs.filter(s => t._all.has(s)).length / qs.length;
      const exact = inQ === t._st.length;
      return { t, sc: (exact ? 10 + t._st.length : 0) + (inQ / t._st.length) * 3 + cover * 2, exact, cover };
    }).filter(x => x.exact || (x.cover >= .75 && qs.length >= 2)).sort((a, b) => b.sc - a.sc).slice(0, 4).map(x => x.t);
    const schemes = SCHEMES.filter(s => (!grade || s.g === grade)).map(s => ({ s, c: qs.filter(x => s._st.has(x)).length }))
      .filter(x => x.c >= Math.max(1, Math.min(2, qs.length)) && x.c / qs.length >= .5).sort((a, b) => b.c - a.c).slice(0, 3).map(x => x.s);
    return { qs: qset, terms, schemes, passages };
  }
  function highlight(text, qs) {
    const p = el('p'); const sents = text.split(/(?<=[.!?…])\s+(?=[А-ЯЁ«⟦])/);
    let bestI = -1, bestC = 0;
    sents.forEach((s, i) => { const c = new Set(tokens(s).map(stem).filter(x => qs.has(x))).size; if (c > bestC) { bestC = c; bestI = i; } });
    sents.forEach((s, i) => {
      const span = el('span', { class: i === bestI ? 'best' : null }); let bold = false, holder = span;
      for (const part of s.match(/[⟦⟧]|[A-Za-zА-Яа-яЁё]+|[^⟦⟧A-Za-zА-Яа-яЁё]+/g) || []) {
        if (part === '⟦') { bold = true; holder = el('b'); span.append(holder); continue; }
        if (part === '⟧') { bold = false; holder = span; continue; }
        holder.append(/^[A-Za-zА-Яа-яЁё]/.test(part) && qs.has(stem(part)) ? el('mark', null, part) : part);
      }
      p.append(span, ' ');
    });
    return p;
  }
  function schemeStatic(s) {
    if (s.type === 'classify') return el('ul', null, s.cols.map(c => el('li', null, el('b', null, c.name + ': '), c.items.join('; '))));
    if (s.type === 'order') return el('ol', null, s.steps.map(x => el('li', null, x)));
    return el('table', { class: 'plain' }, el('thead', null, el('tr', null, s.head.map(x => el('th', null, x)))), el('tbody', null, s.rows.map(r => el('tr', null, r.map(c => el('td', null, c))))));
  }
  function pageSearch(q0) {
    const input = el('input', { type: 'search', placeholder: 'Например: чем конформизм отличается от коллективизма', 'aria-label': 'Вопрос', value: q0 || '' });
    const gsel = el('select', { 'aria-label': 'Класс', style: 'flex:0 1 150px', onchange: run }, el('option', { value: '' }, '9 и 10 класс'), el('option', { value: '9' }, '9 класс'), el('option', { value: '10' }, '10 класс'));
    const out = el('div', { 'aria-live': 'polite' });
    const ex = ['Что такое социальная мобильность?', 'Функции семьи', 'Виды безработицы', 'Чем мораль отличается от права?', 'Признаки государства', 'Стратегии поведения в конфликте', 'Типы избирательных систем', 'Полномочия Президента'];
    function run() {
      const q = input.value.trim();
      history.replaceState(null, '', '#/search' + (q ? '/' + encodeURIComponent(q) : ''));
      if (!q) { out.replaceChildren(); return; }
      out.replaceChildren(el('p', { class: 'muted' }, 'Ищем в учебнике…'));
      loadCorpus().then(() => {
        const r = search(q, +gsel.value || 0);
        if (!r) { out.replaceChildren(el('p', null, 'Уточните вопрос: добавьте ключевое слово (понятие, тему).')); return; }
        const nodes = [];
        const schemeCard = s => el('div', { class: 'card res term' }, el('div', { class: 'src' }, `Схема / таблица · ${s.g} кл. · § ${s.s}. ${SECTIONS[s.g][s.s]}`), el('p', null, el('b', { class: 't' }, s.title)), schemeStatic(s));
        const full = r.schemes.filter(s => [...s._st].every(x => r.qs.has(x)));
        full.forEach(s => nodes.push(schemeCard(s)));
        r.terms.slice(0, full.length ? 2 : 4).forEach(t => nodes.push(el('div', { class: 'card res term' }, el('div', { class: 'src' }, 'Понятие · ' + secLabel(t), t.extra ? ' · олимпиадное (в пособии нет отдельного определения)' : ''), el('p', null, el('b', { class: 't' }, cap(t.term)), ' — ', lcf(t.def)))));
        r.schemes.filter(s => !full.includes(s)).forEach(s => nodes.push(schemeCard(s)));
        const list = r.passages.slice(0, 30);
        if (list.length) nodes.push(el('h2', { class: 'section-title' }, 'Фрагменты учебника'));
        const mk = x => el('div', { class: 'card res' }, el('div', { class: 'src' }, `${x.d.g} класс · § ${x.d.s}. ${SECTIONS[x.d.g][x.d.s]} · с. ${x.d.p}`), highlight(x.d.text, r.qs));
        list.slice(0, 6).forEach(x => nodes.push(mk(x)));
        if (list.length > 6) {
          const more = el('button', { class: 'btn ghost', type: 'button', onclick: () => { more.replaceWith(...list.slice(6).map(mk)); } }, `Показать ещё ${list.length - 6}`);
          nodes.push(more);
        }
        if (!nodes.length) nodes.push(el('div', { class: 'card' }, el('p', null, 'В учебниках 9 и 10 классов ничего не нашлось. Попробуйте сформулировать короче — одним-двумя ключевыми словами.')));
        out.replaceChildren(...nodes);
      }).catch(() => out.replaceChildren(el('p', null, 'Не удалось загрузить текст учебника. Обновите страницу.')));
    }
    let timer; input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 350); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(timer); run(); } });
    app.replaceChildren(el('h1', null, '🔎 Поиск по учебнику'),
      el('p', { class: 'muted' }, 'Введите вопрос или понятие. Сначала показываются определения и схемы, затем — фрагменты пособий с параграфом и страницей; самое подходящее предложение подсвечено.'),
      el('div', { class: 'searchbox' }, input, gsel, el('button', { class: 'btn', type: 'button', onclick: run }, 'Найти')),
      el('div', { class: 'examples' }, ex.map(x => el('button', { type: 'button', onclick: () => { input.value = x; run(); } }, x))), out);
    if (q0) run(); else input.focus({ preventScroll: true });
  }

  /* ───────── словарь ───────── */
  function pageTerms() {
    let scope = store.prefs.dscope || 'g9'; let text = '';
    const list = el('div', { class: 'dict' });
    const render = () => {
      const f = norm(text); const nodes = []; let last = '';
      const items = TERMS.filter(t => inScope(t, scope) && (!f || norm(t.term + ' ' + t.def).includes(f)));
      items.forEach(t => {
        const k = t.g + '|' + t.s;
        if (k !== last) { nodes.push(el('h3', null, `${t.g} класс · § ${t.s}. ${SECTIONS[t.g][t.s]}`)); last = k; }
        const r = store.terms[tkey(t)];
        nodes.push(el('div', { class: 'it' }, el('b', null, cap(t.term)), ' — ', lcf(t.def), ' ', t.extra ? el('span', { class: 'tag x' }, 'олимпиадное') : null, r && r.w > 0 && r.w >= r.c ? el('span', { class: 'tag x' }, 'повторить') : null));
      });
      if (!items.length) nodes.push(el('p', { class: 'muted' }, 'Ничего не найдено.'));
      list.replaceChildren(el('p', { class: 'muted small' }, `Понятий: ${items.length}`), ...nodes);
    };
    const inp = el('input', { type: 'search', placeholder: 'Быстрый фильтр по слову…', 'aria-label': 'Фильтр', oninput: () => { text = inp.value; render(); } });
    app.replaceChildren(el('h1', null, '🗂️ Словарь понятий'),
      el('div', { class: 'bar' }, el('label', { style: 'flex:2 1 260px' }, 'Тема', scopeSelect(scope, v => { scope = v; store.prefs.dscope = v; save(); render(); }, true)), el('label', null, 'Поиск', inp)), list);
    render();
  }

  /* ───────── прогресс ───────── */
  function pageProgress() {
    const recs = TERMS.map(t => ({ t, r: store.terms[tkey(t)] })).filter(x => x.r);
    const c = recs.reduce((a, x) => a + x.r.c, 0), w = recs.reduce((a, x) => a + x.r.w, 0);
    const mastered = recs.filter(x => x.r.c >= 2 && x.r.c > x.r.w).length;
    const weak = recs.filter(x => isWeak(x.t)).sort((a, b) => (b.r.w - b.r.c) - (a.r.w - a.r.c));
    const byCh = [];
    for (const g of [9, 10]) CHAPTERS[g].forEach((ch, i) => {
      const all = TERMS.filter(t => t.g === g && chapOf(t) === i); const m = all.filter(t => { const r = store.terms[tkey(t)]; return r && r.c >= 1 && r.c > r.w; }).length;
      byCh.push(el('tr', null, el('td', null, `${g} кл. · ${ch.n}. ${ch.title}`), el('td', { style: 'width:34%' }, el('div', { class: 'meter' }, el('i', { style: `width:${all.length ? m / all.length * 100 : 0}%` }))), el('td', null, `${m} / ${all.length}`)));
    });
    app.replaceChildren(el('h1', null, '📈 Мой прогресс'),
      el('div', { class: 'stats' },
        el('div', { class: 'card stat' }, el('b', null, c + w), el('span', null, 'ответов на вопросы о понятиях')),
        el('div', { class: 'card stat' }, el('b', null, c + w ? Math.round(c / (c + w) * 100) + ' %' : '—'), el('span', null, 'верных ответов')),
        el('div', { class: 'card stat' }, el('b', null, `${mastered} / ${TERMS.length}`), el('span', null, 'понятий усвоено (2+ верных ответа)')),
        el('div', { class: 'card stat' }, el('b', null, weak.length), el('span', null, 'понятий стоит повторить'))),
      el('div', { class: 'card', style: 'margin-bottom:16px' }, el('h2', null, 'По разделам'), el('table', { class: 'plain' }, el('tbody', null, byCh))),
      weak.length ? el('div', { class: 'card', style: 'margin-bottom:16px' }, el('h2', null, 'Что повторить'),
        el('div', { class: 'row', style: 'margin-bottom:10px' }, el('button', { class: 'btn', type: 'button', onclick: () => { store.prefs.scope = 'weak'; save(); location.hash = '#/play/def2term'; } }, 'Тренировать мои ошибки')),
        el('div', { class: 'dict' }, weak.slice(0, 40).map(x => el('div', { class: 'it' }, el('b', null, cap(x.t.term)), ' — ', lcf(x.t.def), el('div', { class: 'muted small' }, `${secLabel(x.t)} · ошибок: ${x.r.w}, верно: ${x.r.c}`))))) : null,
      store.log.length ? el('div', { class: 'card', style: 'margin-bottom:16px' }, el('h2', null, 'Последние игры'), el('table', { class: 'plain' },
        el('thead', null, el('tr', null, el('th', null, 'Дата'), el('th', null, 'Игра'), el('th', null, 'Результат'))),
        el('tbody', null, store.log.slice(0, 15).map(l => el('tr', null, el('td', null, new Date(l.d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })), el('td', null, l.m), el('td', null, `${fmt(l.s)} / ${l.n}`)))))) : el('p', { class: 'muted' }, 'Пока нет сыгранных игр — начните с любой на главной странице.'),
      el('button', { class: 'btn ghost', type: 'button', onclick: () => { if (confirm('Удалить весь сохранённый прогресс на этом устройстве?')) { store = { terms: {}, log: [], prefs: {} }; save(); pageProgress(); } } }, 'Сбросить прогресс'));
  }

  /* ───────── маршрутизация ───────── */
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const parts = location.hash.replace(/^#\/?/, '').split('/'); const page = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === (page === 'play' ? 'home' : page)));
    if (page === 'play') pagePlay(parts[1]);
    else if (page === 'search') pageSearch(parts[1] ? decodeURIComponent(parts.slice(1).join('/')) : '');
    else if (page === 'olymp') pageOlymp(parts[1]);
    else if (page === 'terms') pageTerms();
    else if (page === 'progress') pageProgress();
    else pageHome();
    window.scrollTo({ top: 0 });
  }
  window.addEventListener('hashchange', route);
  route();
})();
