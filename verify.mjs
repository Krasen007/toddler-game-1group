import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(dir, 'gamefortoddler.html'), 'utf8');

const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) throw new Error('no <script> block found');
writeFileSync(join(dir, '.extracted.js'), m[1]);
console.log('extracted', m[1].length, 'chars of JS');
console.log('total lines:', html.split('\n').length);
// ---- minimal DOM shim, enough to actually execute the game's logic ----
const spoken = [];
let timers = [], now = 0, seq = 0;
globalThis.setTimeout = (f, ms) => { const id = ++seq; timers.push({ id, at: now + (ms || 0), f }); return id };
globalThis.clearTimeout = id => { timers = timers.filter(t => t.id !== id) };
globalThis.setInterval = (f, ms) => { const id = ++seq; timers.push({ id, at: now + (ms || 0), f, rep: ms }); return id };
globalThis.clearInterval = id => { timers = timers.filter(t => t.id !== id) };
function tick(ms) {
    const end = now + ms;
    for (let g = 0; g < 60; g++) {
        const due = timers.filter(t => t.at <= end).sort((a, b) => a.at - b.at)[0];
        if (!due) break;
        timers = timers.filter(t => t !== due);
        now = due.at;
        due.f();
        if (due.rep) timers.push({ ...due, at: now + due.rep });
    }
    now = end;
}
class CL {
    constructor() { this.s = new Set() }
    add(...c) { c.forEach(x => this.s.add(x)) }
    remove(...c) { c.forEach(x => this.s.delete(x)) }
    contains(c) { return this.s.has(c) }
}
class El {
    constructor(tag, id) {
        this.tagName = (tag || 'div').toUpperCase(); this.id = id || '';
        this.children = []; this.style = {}; this.dataset = {}; this._cls = new CL();
        this._text = ''; this._html = ''; this.hidden = false; this.listeners = {};
        this.offsetWidth = 46; this.offsetHeight = 46;
        this.clientWidth = 600; this.clientHeight = 400;
        this._rect = { left: 0, top: 0, width: 46, height: 46 };
    }
    get className() { return [...this._cls.s].join(' ') }
    set className(v) { this._cls = new CL(); String(v).split(/\s+/).filter(Boolean).forEach(c => this._cls.add(c)) }
    get classList() { return this._cls }
    set innerHTML(v) { this._html = String(v); this.children = []; parseInto(this, String(v)) }
    get innerHTML() { return this._html }
    set textContent(v) { this._text = String(v) }
    get textContent() { return this._text }
    append(...n) { n.forEach(x => this.children.push(x)) }
    appendChild(n) { this.children.push(n); return n }
    remove() { this.removed = true }
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f) }
    setAttribute(k, v) { this['attr_' + k] = String(v) }
    getAttribute(k) { return this['attr_' + k] ?? null }
    removeEventListener(t, f) { this.listeners[t] = (this.listeners[t] || []).filter(x => x !== f) }
    setPointerCapture() { }
    getBoundingClientRect() { return this._rect }
    getContext() { return new Proxy({}, { get: () => () => ({}) }) }
    querySelectorAll(sel) { const w = sel.replace(/^\./, ''); return this.children.filter(c => c.classList.contains(w)) }
    closest() { return null }
}
const els = new Map();
// Parse just enough HTML to build a real element tree (ids + classes),
// so selectors like $('#gm .big') resolve the way a browser would.
function parseInto(root, html) {
    const stack = [root];
    for (const mm of html.matchAll(/<(\/?)([a-z0-9]+)\b([^>]*)>/gi)) {
        const [, close, tag, attrs] = mm;
        if (close) { if (stack.length > 1) stack.pop(); continue }
        const el = new El(tag);
        const id = attrs.match(/id="([^"]+)"/), cls = attrs.match(/class="([^"]+)"/);
        if (id) { el.id = id[1]; els.set(id[1], el) }
        if (cls) el.className = cls[1];
        stack[stack.length - 1].append(el);
        if (!/^(img|br|input)$/i.test(tag)) stack.push(el);
    }
}
function querySelector(sel) {
    sel = sel.trim();
    const m2 = sel.match(/^#([\w-]+)\s+\.([\w-]+)$/);
    if (m2) {
        const root = els.get(m2[1]);
        if (!root) return null;
        const walk = n => n.flatMap(c => [c, ...walk(c.children || [])]);
        return walk(root.children || []).find(e => e.classList.contains(m2[2])) || null;
    }
    return els.get(sel.replace(/^[#.]/, '')) || null;
}
function reg(id) { const e = new El('div', id); els.set(id, e); return e }
['menu-wrap', 'menu', 'game', 'bar', 'back', 'st', 'theme', 're', 'p', 'show', 'opts', 'draw', 'pal', 'cv', 'move', 'music', 'drum', 'acc', 'fx', 'bd', 'ball', 'gm', 'gt', 'gn', 'go', 'dz', 'sky'].forEach(i => reg(i));
globalThis.document = {
    documentElement: { dataset: {} },
    querySelector,
    querySelectorAll: () => [],
    createElement: t => new El(t)
};
globalThis.innerWidth = 800; globalThis.innerHeight = 600;
globalThis.speechSynthesis = { speak: u => spoken.push(u.text), cancel() { } };
globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t } };
globalThis.AudioContext = class {
    createOscillator() { return { frequency: { setValueAtTime() { }, exponentialRampToValueAtTime() { } }, connect() { return this }, start() { }, stop() { } } }
    createGain() { return { gain: { setValueAtTime() { }, exponentialRampToValueAtTime() { } }, connect() { return this } } }
    get currentTime() { return 0 }; get destination() { return {} }
};
globalThis.matchMedia = () => ({ matches: false });
let FORCE_REDUCED = false;
const realMatchMedia = globalThis.matchMedia;
globalThis.matchMedia = q => FORCE_REDUCED && /reduced-motion/.test(q) ? { matches: true } : realMatchMedia(q);
const store = {};
globalThis.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => store[k] = String(v) };
globalThis.addEventListener = () => { }; globalThis.removeEventListener = () => { };
globalThis.Math.random = () => 0; // deterministic: pick() always returns index 0

// ---- load the game ----
const shimSrc = `
const window = globalThis;
const document = globalThis.document, innerWidth = 800, innerHeight = 600;
const localStorage = globalThis.localStorage, matchMedia = globalThis.matchMedia;
const speechSynthesis = globalThis.speechSynthesis, SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance;
const AudioContext = globalThis.AudioContext, addEventListener = globalThis.addEventListener, removeEventListener = globalThis.removeEventListener;
${m[1].replace(/^const \$ = /, 'var $ = ')}
return { open, say, tell, bad, good, round, startThrow, startGait, startPop, stopFx, G, hint: () => hint };
`;
const game = new Function(shimSrc)();

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => { cond ? (pass++, console.log('  PASS  ' + name)) : (fail++, console.log('  FAIL  ' + name + '  <<< ' + extra)) };
const css = html.match(/<style>([\s\S]*)<\/style>/)[1];
console.log('\n[1] Dark-mode contrast on .opt (was 1.05:1)');
const optRule = css.match(/\.opt \{[\s\S]*?\n        \}/)[0];
ok('.opt uses var(--ink), not a hardcoded hex', /color:\s*var\(--ink\)/.test(optRule) && !/color:\s*#3a2c4a/.test(optRule));
const lum = h => { const c = h.match(/\w\w/g).map(x => parseInt(x, 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2] };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return +((x + .05) / (y + .05)).toFixed(2) };
const d = ratio('fff1d6', '3a2f55');
ok(`dark .opt text on --card = ${d}:1 (needs >=4.5)`, d >= 4.5, `got ${d}`);
ok(`.opt.ok dark ink on green = ${ratio('3a2c4a', '4cc26b')}:1 (>=4.5)`, ratio('3a2c4a', '4cc26b') >= 4.5);
ok(`.opt.no dark ink on red = ${ratio('3a2c4a', 'ff6b6b')}:1 (>=3)`, ratio('3a2c4a', 'ff6b6b') >= 3);

console.log('\n[2] Theme system entry point is now wired');
ok('data-theme is always set at boot', ['light', 'dark'].includes(document.documentElement.dataset.theme), String(document.documentElement.dataset.theme));
document.querySelector('#theme').onclick();
ok('toggle flips to dark', document.documentElement.dataset.theme === 'dark');
ok('toggle persists to localStorage', localStorage.getItem('tg-theme') === 'dark');
ok('button icon reflects state (sun in dark)', document.querySelector('#theme').textContent === '☀️', document.querySelector('#theme').textContent);
document.querySelector('#theme').onclick();
ok('toggle flips back to light', document.documentElement.dataset.theme === 'light');
ok('":not([data-theme=light])" no longer matches unconditionally', document.documentElement.dataset.theme !== undefined);
ok('no orphaned :root[data-theme=dark] .tile override left', !/data-theme="dark"\] \.tile/.test(css));

console.log('\n[3] prefers-reduced-motion now covers the INFINITE motions');
const rm = css.match(/@media \(prefers-reduced-motion:reduce\)[\s\S]*?\n        \}/)[0];
ok('#gm .big -> hop (infinite 28px bounce) disabled', /#gm \.big/.test(rm));
ok('.bl -> up (infinite balloon field) disabled', /\.bl\s*\{[\s\S]*?animation: none/.test(rm));
ok('.bl kept playable via a static resting spot', /bottom:\s*4%/.test(rm));

console.log('\n[4] gait is no longer a fictional game');
game.open('gait');
const st0 = els.get('st').textContent;
document.querySelector('#gn').onclick(); tick(200);
ok('gait awards NO star for a self-report', els.get('st').textContent === st0 && st0 === '', `got "${els.get('st').textContent}"`);
ok('gait still speaks real movement prompts', spoken.some(t => /стъпки|скок|бягай|въже|пръсти/i.test(t)));

console.log('\n[5] throw actually throws (no pointermove = never moved)');
function setupThrow() {
    game.open('throw');
    const bd = document.querySelector('#bd'), ball = document.querySelector('#ball');
    bd._rect = { left: 0, top: 0, width: 600, height: 400 };
    bd.getBoundingClientRect = () => bd._rect;
    ball.getBoundingClientRect = () => ({ left: parseFloat(ball.style.left) || 0, top: parseFloat(ball.style.top) || 0, width: 46, height: 46 });
    const bks = bd.querySelectorAll('.bk');
    bks.forEach((b, j) => b._rect = { left: 20 + j * 180, top: 300, width: 120, height: 90 });
    const pe = (x, y) => ({ preventDefault() { }, pointerId: 1, clientX: x, clientY: y, target: bks[0] });
    return { bd, ball, bks, pe };
}
const t1 = setupThrow();
ok('three baskets built', t1.bks.length === 3, `got ${t1.bks.length}`);
t1.ball.onpointerdown(t1.pe(30, 30));
ok('ball picks up a colour (index 0 = red)', t1.ball.textContent === '🔴', t1.ball.textContent);
const pos0 = { l: t1.ball.style.left, t: t1.ball.style.top };
t1.ball.onpointermove(t1.pe(130, 250));
ok('ball MOVES on pointermove (was the bug)', t1.ball.style.left !== pos0.l && parseFloat(t1.ball.style.top) > 0, `left=${t1.ball.style.left} top=${t1.ball.style.top}`);
ok('drag preserves grab-offset (ball does not snap under finger)', (parseFloat(t1.ball.style.left)) === 130 - 30, `left=${t1.ball.style.left}`);
t1.ball.onpointermove(t1.pe(80, 340)); // basket 0 spans x 20..140, y 300..390
const b0 = t1.ball.getBoundingClientRect();
ok('ball can be dragged down into a basket', b0.top > 300 && b0.top < 390, `top=${b0.top}`);
t1.ball.onpointerup(t1.pe(80, 340));
ok('correct basket awards a star', els.get('st').textContent !== '', `"${els.get('st').textContent}"`);
ok('ball resets to a plain football', t1.ball.textContent === '⚽');
ok('position resets for the next throw', t1.ball.style.left === '' && t1.ball.style.top === '');
const t2 = setupThrow();
t2.ball.onpointerdown(t2.pe(30, 30));     // red = basket 0
t2.ball.onpointermove(t2.pe(430, 340));  // drop into basket 2 (yellow) -> wrong
t2.ball.onpointerup(t2.pe(430, 340));
ok('wrong basket awards NO star', els.get('st').textContent === '', `got "${els.get('st').textContent}"`);
t2.ball.onpointerdown(t2.pe(30, 30));
t2.ball.onpointerup(t2.pe(30, 30));      // a tap, not a drag
ok('a tap with no drag does not score', els.get('st').textContent === '', `got "${els.get('st').textContent}"`);
console.log('\n[6] The 🔊 button is no longer dead UI');
for (const g of ['gait', 'throw', 'pop', 'shake', 'draw', 'music']) {
    game.open(g); spoken.length = 0;
    document.querySelector('#re').onclick();
    ok(`🔊 speaks in "${g}"`, spoken.length === 1 && spoken[0].length > 3, JSON.stringify(spoken));
}
game.open('count'); spoken.length = 0; document.querySelector('#re').onclick();
ok('🔊 repeats the question in quiz games', spoken.length === 1 && /Колко са/.test(spoken[0]), JSON.stringify(spoken));
game.open('shake');
spoken.length = 0; document.querySelector('#dz').onclick(); tick(400); document.querySelector('#re').onclick();
ok('praise ("Браво!") does NOT overwrite the replayable hint', spoken.some(t => /Клатушкай/.test(t)), JSON.stringify(spoken));

console.log('\n[7] A wrong answer no longer strands the child');
const findWrong = () => { for (const b of els.get('opts').children) { const s0 = els.get('st').textContent; b.onclick(); if (els.get('st').textContent === s0) return b } return null };
game.open('count');
ok('a wrong option exists to test', !!findWrong());
game.open('count'); spoken.length = 0; timers = [];
const wrong = findWrong();
spoken.length = 0;
wrong.onclick();
ok('child is invited to try again', spoken.some(t => /Опитай пак|Хайде пак|направим пак/.test(t)), JSON.stringify(spoken));
const before = spoken.length;
tick(1400);
ok('the SAME question is automatically re-asked (no button hunt)', spoken.length > before && spoken.some(t => /Колко са/.test(t)), JSON.stringify(spoken));
ok('red "no" state is cleared on re-ask', !wrong.classList.contains('no'));
game.open('count'); spoken.length = 0; timers = [];
let right = null;
for (const b of els.get('opts').children) { const s0 = els.get('st').textContent; b.onclick(); if (els.get('st').textContent !== s0) { right = b; break } }
ok('a correct option still scores', els.get('st').textContent !== '');

console.log('\n[8] No abrasive buzzer on a mistake');
ok('bad() contains no sawtooth', !/function bad\(b\)[\s\S]{0,260}sawtooth/.test(m[1]));
ok('nudge() is a quiet two-note sine', /function nudge\(\)[^}]*'sine'/.test(m[1]));
ok('no 200Hz sawtooth anywhere in the file', !/tone\(200[^)]*sawtooth/.test(m[1]));
ok('good() keeps its pleasant triangle ramp', /function good\(b\)[\s\S]{0,120}'triangle'/.test(m[1]));

console.log('\n[9] No zombie timers after exit');
game.open('pop'); tick(3000);
document.querySelector('#back').onclick();
tick(30000);
ok('balloon field cleared on exit', els.get('move').children.length === 0, `${els.get('move').children.length}`);

console.log('\n[10] Tap-surface hygiene (enables the drag)');
ok('.opt blocks text selection + callout', /-webkit-touch-callout: none/.test(css.match(/\.opt \{[\s\S]*?\n        \}/)[0]));
ok('.bb blocks text selection + callout', /-webkit-touch-callout: none/.test(css.match(/\.bb \{[\s\S]*?\n        \}/)[0]));

console.log('\n[11] Reduced-motion fallback keeps pop playable');
FORCE_REDUCED = true;
game.open('pop');
tick(4200); // ~5 balloons spawned
const calmBl = els.get('sky').children;
ok('static balloons still spawn (game remains playable)', calmBl.length >= 4, `${calmBl.length}`);
const lefts = calmBl.map(b => parseFloat(b.style.left));
ok('calm balloons use distinct slot columns (no pile-up)', new Set(lefts.map(l => Math.round(l))).size === lefts.length, lefts.join(','));
ok('calm balloons get explicit bottom rows', calmBl.every(b => /calc\(/.test(b.style.bottom)), calmBl.map(b => b.style.bottom).join(' | '));
FORCE_REDUCED = false;
game.open('pop'); tick(4200);
const normalBl = els.get('sky').children;
ok('normal mode still spawns the rising field', normalBl.length >= 4, `${normalBl.length}`);

console.log(`\n${'='.repeat(50)}\n  ${pass} passed, ${fail} failed\n${'='.repeat(50)}`);
process.exit(fail ? 1 : 0);