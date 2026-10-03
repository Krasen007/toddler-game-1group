
        const $ = s => document.querySelector(s), pick = a => a[Math.random() * a.length | 0], shuf = a => [...a].sort(() => Math.random() - .5);
        let stars = 0, cur = null, q = null, ac = null, hint = '', badT = 0;
        function say(t) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'bg-BG'; u.rate = .8; u.pitch = 1.25; speechSynthesis.speak(u) } catch (e) { } }
        /* tell() marks what the 🔊 button repeats; say() stays free for praise,
           so a tap on the bear never overwrites the game's own instruction. */
        function tell(t) { hint = t; say(t) }
        /* "Not yet" cue: a quiet two-note sine. Deliberately NOT the abrasive
           sawtooth buzz — a toddler's mistake gets the same warmth as a win. */
        function nudge() { tone(392, .13, 'sine', .07); later(() => tone(294, .22, 'sine', .06), 150) }
        function tone(f, d, ty, v, sl) { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain(); o.type = ty || 'sine'; o.frequency.setValueAtTime(f, ac.currentTime); if (sl) o.frequency.exponentialRampToValueAtTime(sl, ac.currentTime + d); g.gain.setValueAtTime(v || .2, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + d); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + d) } catch (e) { } }
        /* Theme: resolved before first paint, persisted across sessions, with the
           system preference as the default. data-theme is ALWAYS set, so the
           :not([data-theme="light"]) branch can no longer match unconditionally. */
        const RM = window.matchMedia && matchMedia('(prefers-color-scheme:dark)');
        let thm = 'light';
        try { thm = localStorage.getItem('tg-theme') || (RM && RM.matches ? 'dark' : 'light') } catch (e) { }
        document.documentElement.dataset.theme = thm;
        function paintTheme() { const b = $('#theme'); b.textContent = thm == 'dark' ? '☀️' : '🌙'; b.setAttribute('aria-label', thm == 'dark' ? 'Светла тема' : 'Тъмна тема') }
        $('#theme').onclick = () => { thm = thm == 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = thm; try { localStorage.setItem('tg-theme', thm) } catch (e) { } paintTheme() };
        paintTheme();
        const svg = (k, c) => `<svg viewBox="0 0 100 100" width="88" height="88">${k == 0 ? `<circle cx="50" cy="50" r="42" fill="${c}"/>` : k == 1 ? `<rect x="10" y="10" width="80" height="80" fill="${c}"/>` : `<polygon points="50,8 94,90 6,90" fill="${c}"/>`}</svg>`;
        const FR = [['🍎', 'ябълката', 'ябълка'], ['🍌', 'бананът', 'банан'], ['🍓', 'ягодата', 'ягода'], ['🍊', 'портокалът', 'портокал'], ['🍇', 'гроздето', 'грозде'], ['🍐', 'крушата', 'круша'], ['🥕', 'морковът', 'морков'], ['🍅', 'доматът', 'домат'], ['🥒', 'краставицата', 'краставица'], ['🌽', 'царевицата', 'царевица']];
        const AN = [['🐕', 'кучето', '🐶', 'кученце'], ['🐈', 'котката', '🐱', 'котенце'], ['🐄', 'кравата', '🐮', 'телце'], ['🐔', 'кокошката', '🐥', 'пиленце']];
        const MN = [['🍎', 'ябълка', 'ябълки'], ['⚽', 'топка', 'топки'], ['🐦', 'птичка', 'птички'], ['⭐', 'звезда', 'звезди'], ['🚗', 'кола', 'коли']];
        const WE = [['☀️', 'слънчево'], ['🌧️', 'дъждовно'], ['❄️', 'снежно']];
        const SH = [['кръга', '#ff7a59'], ['квадрата', '#2bb3a3'], ['триъгълника', '#e8a900']];
        const WLD = [['🐕', 'кучето', 1], ['🐈', 'котката', 1], ['🐄', 'кравата', 1], ['🐔', 'кокошката', 1], ['🐇', 'зайчето', 0], ['🦊', 'лисицата', 0], ['🐻', 'мечката', 0], ['🦌', 'сърната', 0], ['🐿️', 'катеричката', 0]];
        const POL = [
            ['🤝', 'Срещна приятел. Какво казваш?', ['👋', 'Здравей!'], ['🤐', 'Нищо.'], ['💢', 'Махни се!']],
            ['🫂', 'Удари случайно приятел. Какво казваш?', ['🙏', 'Извинявай!'], ['😡', 'Така ти се пада!'], ['😈', 'Ха-ха!']],
            ['🎁', 'Получи подарък. Какво казваш?', ['💛', 'Благодаря!'], ['🙄', 'И какво?'], ['😑', '...']],
            ['🚪', 'Изпращаш приятел. Какво казваш?', ['👋', 'Довиждане!'], ['🤫', 'Шшшт!'], ['🚫', 'Не!']]];
        const JOB = [
            ['👩‍🏫', 'Кой учи децата в детската градина?', ['👩‍🏫', 'учителката'], ['👮', 'полицаят'], ['✈️', 'пилотът']],
            ['🤒', 'Коя помага на болно дете?', ['👩‍⚕️', 'лекарката'], ['👩‍🏫', 'учителката'], ['💇', 'фризьорката']],
            ['🍲', 'Кой готви храната за децата?', ['🧑‍🍳', 'готвачът'], ['👩‍🏫', 'учителката'], ['🚌', 'шофьорът']]];
        const HOL = [
            ['🎂', 'Това е торта. За кой празник е?', ['🎂', 'рожден ден'], ['🥚', 'Великден'], ['🚗', 'автомобил']],
            ['🎄', 'Това е коледна елха. За кой празник е?', ['🎄', 'Коледа'], ['🌸', '8 март'], ['📚', 'учебна книга']],
            ['🌸', 'Това е маргаритка. За кой празник е?', ['🌸', '8 март'], ['🎄', 'Коледа'], ['🎃', 'Хелоуин']],
            ['📛', 'Това е табелка с име. За кой празник е?', ['📛', 'имен ден'], ['🎂', 'рожден ден'], ['⛵', 'празник на кораба']]];
        const CTR = [
            ['🇧🇬', 'Как се казва нашата страна?', ['🇧🇬', 'България'], ['🇷🇸', 'Сърбия'], ['🇬🇷', 'Гърция']],
            ['🏙️', 'Коя е столицата на България?', ['🏙️', 'София'], ['🗼', 'Париж'], ['🍕', 'Рим']],
            ['🎬', 'От какви цветове е българското знаме?', ['⬜🟩🟥', 'бяло, зелено и червено'], ['🔵⚪', 'синьо и бяло'], ['🟨⬛', 'жълто и черно']]];
        const PLC = [
            ['🛏️', 'Къде спиш нощем?', ['🏠', 'в къщи'], ['🏫', 'в детската градина'], ['🏥', 'в болницата']],
            ['🧸', 'Къде играеш с другите деца?', ['🏫', 'в детската градина'], ['🛋️', 'сам на дивана'], ['🏦', 'в банката']],
            ['🪑', 'Къде сядаш, когато дойдеш в градината?', ['🏫', 'в детската градина'], ['🏠', 'в къщи'], ['⛵', 'в лодката']]];
        const CAR = [
            ['🚗', 'Когато пътуваш в кола, какво слагаш?', ['🔒', 'колан'], ['🎈', 'балон'], ['🧸', 'играчка']],
            ['👶', 'На какво седиш в колата?', ['🪑', 'на детско столче'], ['🛋️', 'на диван'], ['🏍️', 'на мотор']],
            ['🚦', 'Какво правиш, когато светофарът е червен?', ['🛑', 'чакаш'], ['🏃', 'бягаш'], ['😴', 'спиш']]];
        const RYM = [
            ['🐱', 'Котенцето казва:', ['🐱', 'Мяу', 1], ['🐶', 'Бау', 0], ['🐮', 'Му', 0]],
            ['🐶', 'Кученцето казва:', ['🐶', 'Бау', 1], ['🐱', 'Мяу', 0], ['🐔', 'Пи-пи', 0]],
            ['🐮', 'Телето казва:', ['🐮', 'Му', 1], ['🐔', 'Пи-пи', 0], ['🐑', 'Бе', 0]],
            ['🐔', 'Пиленцето казва:', ['🐔', 'Пи-пи', 1], ['🐑', 'Бе', 0], ['🐴', 'И-ха-ха', 0]],
            ['🐴', 'Кончето казва:', ['🐴', 'И-ха-ха', 1], ['🐱', 'Мяу', 0], ['🐶', 'Бау', 0]]];
        const G = {
            count: { e: '🍎', n: 'Брой до три', r: 'Математика 1', gen() { const n = 1 + Math.random() * 3 | 0, it = pick(['🍎', '🐥', '🎈', '🚗', '⭐']); return { p: 'Колко са? Преброй!', say: 'Колко са? Преброй: ' + ['едно', 'две', 'три'].slice(0, n).join(', '), s: it.repeat(n), o: [1, 2, 3].map(k => ({ t: k, ok: k == n })) } } },
            many: { e: '🍎🍎🍎', n: 'Едно и много', r: 'Математика 2 · Български 8', gen() { const m = pick(MN), one = Math.random() < .5, a = m[0], b = m[0].repeat(5), p = one ? `Къде е една ${m[1]}?` : `Къде има много ${m[2]}?`; return { p, s: '', o: shuf([{ t: a, ok: one }, { t: `<span style="font-size:.5em">${b}</span>`, ok: !one }]) } } },
            shape: { e: '🔺', n: 'Фигури', r: 'Математика 9–10', gen() { const t = pick([0, 1, 2]); return { p: 'Избери ' + SH[t][0], s: '', o: shuf([0, 1, 2]).map(k => ({ t: svg(k, SH[k][1]), ok: k == t })) } } },
            baby: { e: '🐕🐶', n: 'Малките', r: 'Околен свят 17', gen() { const t = pick(AN), o = shuf(AN.filter(a => a != t)).slice(0, 2).concat([t]); return { p: `Къде е малкото на ${t[1]}?`, say: `Къде е малкото на ${t[1]}? Намери ${t[3]}!`, s: t[0], o: shuf(o).map(a => ({ t: a[2], l: a[3], ok: a == t })) } } },
            fruit: { e: '🍓🥕', n: 'Плодове и зеленчуци', r: 'Околен свят 19', gen() { const t = pick(FR), o = shuf(FR.filter(x => x != t)).slice(0, 2).concat([t]); return { p: `Къде е ${t[1]}?`, s: '', o: shuf(o).map(f => ({ t: f[0], l: f[2], ok: f == t })) } } },
            day: { e: '☀️🌙', n: 'Ден и нощ', r: 'Математика 7', gen() { const d = Math.random() < .5; return { p: 'Ден ли е, или нощ?', s: d ? '🌳☀️🐦' : '🌙⭐😴', o: [{ t: '☀️', l: 'ден', ok: d }, { t: '🌙', l: 'нощ', ok: !d }] } } },
            wx: { e: '🌧️', n: 'Времето', r: 'Околен свят 20', gen() { const t = pick(WE); return { p: `Кое е ${t[1]} време?`, s: '', o: shuf(WE).map(w => ({ t: w[0], ok: w == t })) } } },
            music: { e: '🥁', n: 'Тъпан и акордеон', r: 'Музика 1', m: 'music' },
            draw: { e: '🎨', n: 'Рисуване и оцветяване', r: 'Изобр. изкуство 2–6', m: 'draw' },
            pop: { e: '🎈', n: 'Пукай балони', r: 'Физ. култура 14', m: 'pop' },
            shake: { e: '🐻', n: 'Клатушка и танц', r: 'Физ. култура 13 · Музика 4', m: 'shake' },
            tale: { e: '🐰', n: 'Приказка', r: 'Български 11–14', gen() { return tale() } },
            updown: { e: '⬆️⬇️', n: 'Горе и долу', r: 'Математика 6', gen() { const u = Math.random() < .5; return { p: 'Къде е птичката: горе или долу?', s: `<div style="height:150px;display:flex;flex-direction:column;justify-content:${u ? 'flex-start' : 'flex-end'}">🐦</div>`, o: [{ t: '⬆️', l: 'горе', ok: u }, { t: '⬇️', l: 'долу', ok: !u }] } } },
            height: { e: '🌲', n: 'Високо и ниско', r: 'Математика 4–5', gen() { const h = Math.random() < .5, f = x => `<span style="font-size:${x}em">🌲</span>`; return { p: h ? 'Кое е високо?' : 'Кое е ниско?', s: '', o: shuf([{ t: f(1.4), ok: h }, { t: f(.5), ok: !h }]) } } },
            season: { e: '🌸❄️', n: 'Сезони', r: 'Математика 8', gen: ng([['🌸', 'пролетта'], ['☀️', 'лятото'], ['🍂', 'есента'], ['⛄', 'зимата']]) },
            family: { e: '👩👨', n: 'Семейството', r: 'Български 2', gen: ng([['👩', 'мама'], ['👨', 'татко'], ['👵', 'баба'], ['👴', 'дядо'], ['👶', 'бебето']]) },
            hygiene: { e: '🧼', n: 'Чистичко дете', r: 'Околен свят 12', gen() { const t = pick([['🧼', 'С какво си мием ръцете?'], ['🪥', 'С какво си мием зъбките?'], ['🚿', 'Къде се къпем?']]); return { p: t[1], s: '', o: ['🧼', '🪥', '🚿'].map(e => ({ t: e, ok: e == t[0] })) } } },
            transport: { e: '🚌', n: 'Превозни средства', r: 'Констр. 13', gen: ng([['🚗', 'колата'], ['🚌', 'автобуса'], ['🚂', 'влака'], ['✈️', 'самолета'], ['🚲', 'колелото'], ['🚜', 'трактора']]) },
            seq: { e: '🟥🟦🟨', n: 'Подреди като мен', r: 'Конструиране 1', gen() { const C = ['🟥', '🟦', '🟨'], s = [0, 1, 2].map(() => Math.random() * 3 | 0); return { p: 'Подреди като мен!', say: 'Подреди кубчетата като мен!', s: s.map(i => C[i]).join(''), seq: s, i: 0, o: shuf([0, 1, 2]).map(c => ({ t: C[c], c })) } } },
            gait: { e: '🚶', n: 'Стъпки, бягане, скок', r: 'Физ. култура 1–4, 7–8', m: 'gait' },
            throw: { e: '⚽', n: 'Хвърли топката', r: 'Физ. култура 5', m: 'throw' },
            cmp: { e: '⚖️', n: 'Толкова, колкото', r: 'Математика 3', gen() { const a = pick([1, 2, 3]), b = pick([1, 2, 3]), x = pick(['🍎', '⭐', '🟢']), y = pick(['🐥', '🚗', '🎈']), row = (c, n) => `<div style="font-size:26px;line-height:1.25">${c.repeat(n)}</div>`, eq = a == b, p = eq ? 'Двете групи равни ли са?' : `Колко е първата група, а колко е втората?`, s = `<div style="display:flex;gap:18px;justify-content:center;align-items:flex-start">${row(x, a)}${row(y, b)}</div>`; return { p, say: eq ? 'Двете групи равни ли са? Сравни ги!' : `Първата група има ${a}, а втората има ${b}. Сравни ги!`, s, o: eq ? [{ t: '⚖️', l: 'да, равни са', ok: true }, { t: '❌', l: 'не', ok: false }] : shuf([{ t: `Първата: ${a}`, ok: true }, { t: `Втората: ${b}`, ok: false }]) } } },
            eqh: { e: '🌲', n: 'Равни по височина', r: 'Математика 4–5', gen() { const e = Math.random() < .5, f = x => `<span style="font-size:${x}em">🌲</span>`, a = .8 + Math.random() * .4, b = e ? a : a * .45; return { p: e ? 'Двете дървета равни ли са?' : 'Кое дърво е по-ниско?', s: '', o: e ? [{ t: `${f(a)} и ${f(b)}`, ok: true }, { t: `${f(a)} и ${f(a * 1.8)}`, ok: false }] : [{ t: `${f(a)} и ${f(b)}`, ok: false }, { t: `${f(b)} и ${f(a)}`, ok: true }] } } },
            fb: { e: '🧍', n: 'Отпред и отзад', r: 'Математика 6', gen() { const f = Math.random() < .5, k = f ? 'отпред' : 'отзад', kid = '🧒', bird = '🐦'; return { p: 'Къде е птичката спрямо теб?', say: `Къде е птичката спрямо теб – ${k}?`, s: `<div style="display:flex;gap:30px;justify-content:center;font-size:52px">${f ? bird + kid : kid + bird}</div>`, o: shuf([{ t: '🔜', l: 'отпред', ok: f }, { t: '🔙', l: 'отзад', ok: !f }]) } } },
            polite: { e: '🤝', n: 'Поздрави и извинения', r: 'Български 4', gen: qz(POL) },
            job: { e: '👩‍🏫', n: 'Професии', r: 'Околен свят 13', gen: qz(JOB) },
            holiday: { e: '🎂', n: 'Празници', r: 'Околен свят 14', gen: qz(HOL) },
            country: { e: '🇧🇬', n: 'Моята страна', r: 'Околен свят 15', gen: qz(CTR) },
            place: { e: '🏠', n: 'Дом и градина', r: 'Околен свят 8', gen: qz(PLC) },
            carseat: { e: '🚗', n: 'Безопасно в колата', r: 'Околен свят 11', gen: qz(CAR) },
            wild: { e: '🦊', n: 'Домашни и диви', r: 'Околен свят 18', gen() { const t = pick(WLD), d = !!t[2]; return { p: `${t[1]} — домашно или диво животно е?`, say: `${t[1]} — това домашно или диво животно е?`, s: t[0], o: shuf([{ t: '🏠', l: 'домашно', ok: d }, { t: '🌲', l: 'диво', ok: !d }]) } } },
            rhyme: { e: '🎵', n: 'Гласовете на животните', r: 'Български 15', gen() { const t = pick(RYM); return { p: t[1], say: t[1] + ' Как казва?', s: t[0], o: shuf(t.slice(2)).map(o => ({ t: o[1], ok: !!o[2] })) } } },
            clothes: { e: '🧥', n: 'Какво обличаме?', r: 'Констр. 8', gen() { const t = pick([['☂️', 'Навън вали. Какво вземаме?'], ['🧥', 'Навън е студено. Какво обличаме?'], ['🧢', 'Навън е слънчево. Какво слагаме на главата?']]); return { p: t[1], s: '', o: shuf(['☂️', '🧥', '🧢']).map(e => ({ t: e, ok: e == t[0] })) } } }
        };
        const SUBJ = [['Български език', 'tale rhyme polite family'], ['Математика', 'count many cmp shape updown height eqh fb day season'], ['Околен свят', 'baby wild fruit wx hygiene transport place carseat job holiday country'], ['Изобразително изкуство', 'draw'], ['Конструиране и технологии', 'seq clothes'], ['Физическа култура', 'gait throw pop shake'], ['Музика', 'music']];
        const menu = $('#menu');
        SUBJ.forEach(([n, ks]) => { const h = document.createElement('h2'); h.textContent = n; menu.append(h); ks.split(' ').forEach(k => { const b = document.createElement('button'); b.className = 'tile'; b.innerHTML = `<span class="e">${G[k].e}</span><b>${G[k].n}</b><small>${G[k].r}</small>`; b.onclick = () => open(k); menu.append(b) }) });
        function ng(L) { return () => { const t = pick(L), o = shuf(L.filter(x => x != t)).slice(0, 2).concat([t]); return { p: `Къде е ${t[1]}?`, s: '', o: shuf(o).map(f => ({ t: f[0], ok: f == t })) } } }
        function qz(L) { return () => { const t = pick(L), c = t[2], o = shuf(t.slice(3).concat([c])); return { p: t[1], s: t[0], o: o.map(x => ({ t: x[0], l: x[1], ok: x == c })) } } }
        const T = []; const later = (f, ms) => { const i = setTimeout(f, ms); T.push(i); return i };
        let tp = 0, spawnT, mv = 0;
        const TL = [['🐰🥕', 'Имало едно време едно зайче. Зайчето много обичало моркови.'], ['🐰🌳', 'Зайчето тръгнало да търси моркови в градината.'], ['🐰🥕🥕', 'Намерило голям морков и подскочило от радост! Скок, скок, зайче, скок!'], ['🐰😋', 'Зайчето хапнало моркова и казало: Ам-ам, вкусно!']];
        const QS = [['Кой имаше в приказката?', '🐰', ['🐻', '🐱']], ['Какво обичаше зайчето?', '🥕', ['🍌', '🐟']]];
        function tale() { if (tp < 4) { const t = TL[tp], l = tp == 0 ? 'начало' : tp == 3 ? 'край' : ''; tp++; return { p: t[1], s: t[0], o: [{ t: '▶', l, go: 1 }] } } if (tp < 6) { const k = QS[tp - 4]; tp++; return { p: k[0], s: '', o: shuf([k[1]].concat(k[2])).map(e => ({ t: e, ok: e == k[1] })) } } tp = 0; return tale() }
        function upd() { $('#st').textContent = '⭐'.repeat(Math.min(stars, 10)) + (stars > 10 ? ' +' + (stars - 10) : '') }
        function stopFx() { clearInterval(spawnT); clearTimeout(badT); T.forEach(clearTimeout); T.length = 0; removeEventListener('devicemotion', onMotion); $('#move').innerHTML = '' }
        function open(k) { cur = k; stars = 0; tp = 0; upd(); stopFx(); $('#menu-wrap').hidden = true; $('#game').hidden = false; const m = G[k].m;['music', 'draw', 'move'].forEach(i => $('#' + i).hidden = !(m == i || (i == 'move' && (m == 'pop' || m == 'shake' || m == 'gait' || m == 'throw'))));['p', 'show', 'opts'].forEach(i => $('#' + i).hidden = !!m); hint = ''; if (m) ({ music() { tell('Докосни тъпана и акордеона!') }, draw: initDraw, pop: startPop, shake: startShake, gait: startGait, throw: startThrow })[m](); else round() }
        function round() { q = G[cur].gen(); $('#p').textContent = q.p; $('#show').innerHTML = q.s || ''; const o = $('#opts'); o.innerHTML = ''; q.o.forEach(x => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = x.t + (x.l ? `<small>${x.l}</small>` : ''); b.onclick = () => ans(b, x); o.append(b) }); tell(q.say || q.p) }
        /* A wrong tap never dead-ends: gentle cue, then the SAME question is
           spoken again unprompted. Recovery must not depend on a 22px button. */
        function bad(b) { b.classList.add('no'); nudge(); say(pick(['Опитай пак!', 'Хайде пак!', 'Да го направим пак!'])); const qq = q; clearTimeout(badT); badT = later(() => { if (q !== qq) return; b.classList.remove('no'); tell(q.say || q.p) }, 1300) }
        function good(b) { clearTimeout(badT); b.classList.add('ok'); stars++; upd(); tone(660, .15, 'triangle'); later(() => tone(880, .25, 'triangle'), 150); const f = $('#fx'); f.textContent = pick(['🎉', '⭐', '🌟', '👏']); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); say(pick(['Браво!', 'Чудесно!', 'Много добре!'])); later(round, 1500) }
        function ans(b, x) { if (x.go) return round(); if (q.seq) { if (x.c != q.seq[q.i]) return bad(b); q.i++; tone(660, .1, 'triangle'); $('#p').textContent = 'Подреди като мен! ' + '✅'.repeat(q.i); if (q.i < q.seq.length) return; return good(b) } x.ok ? good(b) : bad(b) }
        $('#back').onclick = () => { try { speechSynthesis.cancel() } catch (e) { } stopFx(); $('#game').hidden = true; $('#menu-wrap').hidden = false };
        $('#re').onclick = () => { if (hint) say(hint) };
        $('#drum').onclick = () => { tone(150, .25, 'sine', .5, 40); say('Тъпан') };
        $('#acc').onclick = () => { [220, 277, 330].forEach(f => tone(f, .6, 'sawtooth', .08)); say('Акордеон') };
        function startPop() { $('#move').innerHTML = '<div id="sky"></div>'; tell('Пукай балоните!'); spawnT = setInterval(() => { const b = document.createElement('div'), s = 70 + Math.random() * 40; b.className = 'bl'; b.style.cssText = `left:${5 + Math.random() * 78}%;width:${s}px;height:${s * 1.2}px;background:hsl(${Math.random() * 360 | 0} 85% 60%);animation-duration:${4 + Math.random() * 3}s`; b.onpointerdown = () => { if (b.dataset.x) return; b.dataset.x = 1; b.textContent = '💥'; b.style.background = 'none'; stars++; upd(); tone(300 + Math.random() * 500, .12, 'square', .15, 80); setTimeout(() => b.remove(), 250) }; b.onanimationend = () => b.remove(); later(() => b.remove(), 7500); $('#sky').append(b) }, 750) }
        function startShake() { $('#move').innerHTML = '<div id="dz" style="font-size:130px;transition:transform .15s;margin-top:20px">🐻</div><p style="font-size:22px;margin:10px">Клатушкай телефона – мечето ще танцува! Или докосвай мечето.</p><button class="btn" id="go">▶ Старт</button>'; $('#go').onclick = async () => { try { if (window.DeviceMotionEvent && DeviceMotionEvent.requestPermission && await DeviceMotionEvent.requestPermission() != 'granted') return } catch (e) { } addEventListener('devicemotion', onMotion); $('#go').hidden = true; tell('Клатушкай!') }; $('#dz').onclick = dance; tell('Клатушкай телефона!') }
        function onMotion(e) { const g = e.accelerationIncludingGravity; if (!g) return; const m = Math.abs(g.x || 0) + Math.abs(g.y || 0) + Math.abs(g.z || 0); if (onMotion.p != null && Math.abs(m - onMotion.p) > 8) dance(); onMotion.p = m }
        const GA = [['🐾', 'Върви напред с малки стъпки!'], ['🦶', 'Върви с големи стъпки!'], ['🧍', 'Върви на пръсти!'], ['🦶', 'Върви на пети!'], ['⬅️', 'Върви назад!'], ['➡️', 'Върви встрани!'], ['🏃', 'Бягай в различни посоки!'], ['🦘', 'Подскачай на два крака!'], ['🧗', 'Пълзи и провирай се под въже!']];
        /* startGait no longer pretends to measure anything. There is no sensing here,
           so it awards no star for a self-report — it is a movement follow-along
           (like draw: ungraded), which is the only honest version of this game. */
        function startGait() {
            $('#move').innerHTML = '<div id="gm"><p id="gt" style="font-size:22px;font-weight:700"></p><span class="big">🧍</span><button class="btn" id="gn">Направих го! 👍</button></div>';
            const L = GA.slice(); let i = 0;
            const show = () => {
                if (!L.length) { L.push(...shuf(GA)) }
                const m = L.shift();
                $('#gm .big').textContent = m[0]; $('#gt').textContent = m[1];
                tell(m[1]); tone(400 + i * 40, .12, 'triangle', .12)
            };
            const step = () => { tone(700, .18, 'triangle'); later(() => tone(1000, .25, 'triangle'), 140); say(pick(['Браво!', 'Супер!', 'Отлично!'])); i++; show() };
            $('#gn').onclick = step;
            tell('Да правим движения заедно!'); show()
        }
        /* startThrow actually throws now. The ball is picked up on touch (random
           colour assigned), dragged under the finger via pointer capture, and
           graded by dropping it into the matching basket. */
        function startThrow() {
            $('#move').innerHTML = '<div id="bd"><div class="bb" id="ball">⚽</div></div><p style="font-size:20px;margin:8px">Хвърли топката в кошницата със същия цвят!</p>';
            const bd = $('#bd'), ball = $('#ball'), BK = [['🔴', '#e63946'], ['🔵', '#3a86ff'], ['🟡', '#ffd60a']], NM = ['червена', 'синя', 'жълта'];
            BK.forEach((k, j) => { const d = document.createElement('button'); d.className = 'bk'; d.style.left = (6 + j * 31) + '%'; d.style.background = k[1]; d.textContent = k[0]; d.dataset.i = j; bd.append(d) });
            let cur = -1, ox = 0, oy = 0, moved = false;
            const place = e => { const r = bd.getBoundingClientRect(); ball.style.left = Math.max(0, Math.min(r.width - ball.offsetWidth, e.clientX - r.left - ox)) + 'px'; ball.style.top = Math.max(0, Math.min(r.height - ball.offsetHeight, e.clientY - r.top - oy)) + 'px' };
            const reset = () => { cur = -1; moved = false; ball.classList.remove('sel'); ball.style.left = ''; ball.style.top = ''; ball.textContent = '⚽' };
            /* graded by geometry, not by which element the finger was over —
               the ball rides on top, so elementFromPoint would always miss it */
            const score = () => {
                const r = ball.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                let hit = -1;
                bd.querySelectorAll('.bk').forEach(b => { const s = b.getBoundingClientRect(); if (cx > s.left && cx < s.left + s.width && cy > s.top && cy < s.top + s.height) hit = +b.dataset.i });
                if (hit < 0 || cur < 0) { nudge(); say('Пусни я върху кошницата!'); return reset() }
                if (hit == cur) { stars++; upd(); tone(660, .15, 'triangle'); later(() => tone(880, .25, 'triangle'), 150); say(pick(['Браво!', 'Точно в кошницата!', 'Ура!'])) }
                else { nudge(); say('Това не е ' + NM[cur] + '!') }
                reset()
            };
            ball.onpointerdown = e => {
                e.preventDefault();
                try { ball.setPointerCapture(e.pointerId) } catch (er) { }
                cur = pick([0, 1, 2]); moved = false;
                const r = ball.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top;
                ball.classList.add('sel'); ball.textContent = BK[cur][0];
                tone(600, .1, 'triangle'); tell('Хвърли ' + NM[cur] + ' топката в кошницата!')
            };
            ball.onpointermove = e => { if (cur < 0) return; e.preventDefault(); moved = true; place(e) };
            ball.onpointerup = e => { if (cur < 0) return; e.preventDefault(); moved ? score() : reset() };
            ball.onpointercancel = reset;
            tell('Хвърли топката в кошницата!')
        }
        function dance() { const t = Date.now(); if (t - mv < 300) return; mv = t; stars++; upd(); tone(150, .2, 'sine', .4, 40); const d = $('#dz'); d.style.transform = `rotate(${stars % 2 ? -20 : 20}deg) scale(1.2)`; later(() => d.style.transform = '', 150); if (stars % 5 == 0) say('Браво!') }
        const COL = ['#e63946', '#ff9f1c', '#ffd60a', '#2bb3a3', '#3a86ff', '#8338ec', '#7b4a2e', '#222'];
        let tool = 'p', col = COL[0], pen = 0, cx; const cv = $('#cv');
        function clr() { cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height) }
        function tpl() { clr(); const x = cv.width / 2, y = cv.height / 2; cx.strokeStyle = '#222'; cx.lineWidth = 6; cx.beginPath(); if (Math.random() < .5) { cx.arc(x, y, 80, 0, 7); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; cx.moveTo(x + 110 * Math.cos(a), y + 110 * Math.sin(a)); cx.lineTo(x + 160 * Math.cos(a), y + 160 * Math.sin(a)) } } else { cx.rect(x - 90, y - 20, 180, 130); cx.moveTo(x - 110, y - 20); cx.lineTo(x, y - 110); cx.lineTo(x + 110, y - 20); cx.closePath(); cx.rect(x - 20, y + 40, 40, 70) } cx.stroke(); cx.lineWidth = 16; tell('Оцвети го!') }
        function initDraw() { cv.width = Math.min(innerWidth - 30, 720); cv.height = Math.max(300, innerHeight - 300); cx = cv.getContext('2d'); cx.lineCap = cx.lineJoin = 'round'; cx.lineWidth = 16; clr(); tool = 'p'; const P = $('#pal'); P.innerHTML = ''; const add = (t, bg, f) => { const b = document.createElement('button'); b.className = 'sw'; if (bg) b.style.background = bg; else b.textContent = t; b.onclick = f; P.append(b) }; COL.forEach(k => add('', k, () => { col = k; tool = 'p' }));['⭐', '🌸', '🔺', '🔵'].forEach(s => add(s, 0, () => tool = s)); add('🖼', 0, tpl); add('🗑', 0, clr); tell('Рисувай и оцветявай!') }
        const xy = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left - cv.clientLeft, e.clientY - r.top - cv.clientTop] };
        cv.onpointerdown = e => { const [x, y] = xy(e); if (tool != 'p') { cx.font = '64px serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(tool, x, y); tone(500, .1, 'triangle'); return } pen = 1; cx.strokeStyle = col; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + .1, y); cx.stroke() };
        cv.onpointermove = e => { if (!pen) return; const [x, y] = xy(e); cx.lineTo(x, y); cx.stroke() };
        cv.onpointerup = cv.onpointerleave = () => pen = 0;
    