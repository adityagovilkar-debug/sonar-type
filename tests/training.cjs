// Phase 4 (Training & comfort): pairs, fingers, layouts, weekly goal, warm-up, assist, text, palette, easy-read
const { check, SIM } = require('./lib.cjs');
module.exports = [
  check('pairs recorded', `prefs.pairs = {}; const w = put('thing', 0, .6); type(w); press('q'); const k = Object.keys(prefs.pairs).join(',');
    return 'pairs ' + k + ' (expect th,hi,in,ng), ms ' + Math.round(prefs.pairs.th.ms);`),
  check('pair weakness + adaptive', `prefs.pairs = {}; for (const a of 'abcdefghijklmnop') for (const b of 'aeiou') prefs.pairs[a + b] = { n: 20, ms: 150, miss: 0 };
    prefs.pairs.qu = { n: 20, ms: 600, miss: .3 }; G.weakPairs = pairWeakness(); G.weak = null; G.game = 'drill';
    let hits = 0; for (let i = 0; i < 300; i++) { G.recent = []; if (/qu/.test(pickFromTier(3))) hits++; } G.weakPairs = null; let base = 0; for (let i = 0; i < 300; i++) { G.recent = []; if (/qu/.test(pickFromTier(3))) base++; }
    return 'weakest pairs ' + weakestPairs(3).join(',') + ', words with qu: adaptive ' + hits + '/300 vs random ' + base + '/300';`),
  check('fingers + layouts', `prefs.letters = {}; for (const ch of 'abcdefghijklmnopqrstuvwxyz') prefs.letters[ch] = { n: 30, ms: 150, miss: .01 }; prefs.letters.a.ms = 400; prefs.letters.q.ms = 380;
    const out = []; for (const lay of Object.keys(LAYOUTS)) { prefs.comfort.layout = lay; openLog('letters'); const t = $('#lgBody').textContent; out.push(lay + ':' + (t.match(/Hands[^·]*·[^·]*·[^R]*/) || [''])[0].slice(0, 70)); closeLog(); } prefs.comfort.layout = 'qwerty';
    return out.join(' | ');`),
  check('weekly goal', `prefs.history = []; prefs.goalsMet = {}; prefs.goal = { type: 'runs', target: 2 }; const now = Date.now(); prefs.history.push({ at: now, secs: 60, wpm: 40, acc: 95, game: 'sector' });
    const p1 = goalProgress(); G.points = 100; G.correct = 30; G.t = 40; gameOver('hull'); const met = !!prefs.goalsMet[weekKey()];
    return 'before ' + p1.value + '/' + p1.target + ' met ' + p1.met + ', after a run met ' + met + ', debrief row ' + /Weekly goal met/.test($('#dArchive').textContent) + ', line ' + goalLine();`),
  check('goal ui', `prefs.goal = { type: 'wpm', target: 40 }; openLog('progress'); document.querySelector('[data-gstep="1"]').click(); const t1 = prefs.goal.target; document.querySelector('[data-goal="acc"]').click(); const t2 = prefs.goal.type + ' ' + prefs.goal.target; closeLog();
    return 'stepped to ' + t1 + ', switched to ' + t2;`),
  check('warm-up', `prefs.comfort.warmup = true; startRun(4, 'sector'); const w0 = G.warmT, stage = G.sec.stage; for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    const words = G.words.length, h0 = G.hull; put('ox', 0, .2, { speed: 300 }); for (let i = 0; i < 40; i++) update(1 / 60); const hull = G.hull; G.points = 500;
    for (let i = 0; i < 60 * 28; i++) update(1 / 60); const after = { warmT: G.warmT, pts: G.points, stage: G.sec.stage, t: Math.round(G.t) };
    prefs.comfort.warmup = false;
    return 'warmT ' + w0 + ', stage during ' + stage + ', words spawned ' + words + ', hull ' + hull + '/' + h0 + ' | after: ' + JSON.stringify(after) + ', warmups ' + prefs.life.warmups;`),
  check('warm-up skip', `prefs.comfort.warmup = true; startRun(4, 'descent'); G.points = 300; endWarmup(); const r = 'warmT ' + G.warmT + ', points ' + G.points + ', depth ' + G.depth; prefs.comfort.warmup = false; return r;`),
  check('no warm-up for daily/expedition', `prefs.comfort.warmup = true; startRun(4, 'expedition'); const a = G.warmT; startRun(sel, 'daily'); const b = G.warmT; prefs.comfort.warmup = false; return 'expedition ' + a + ', daily ' + b + ' (expect 0, 0)';`),
  check('assist', `prefs.comfort.assist = .7; startRun(5, 'sector'); G.words = []; G.spawnT = 999; const w = put('anchor', 0, .8, { speed: 60 }); const d0 = w.dist; for (let i = 0; i < 60; i++) update(1 / 60); const moved = d0 - w.dist;
    G.points = 99999; G.correct = 100; G.t = 60; gameOver('hull'); const marked = prefs.hiAssist['sector:5']; prefs.comfort.assist = 1;
    return 'moved ' + moved.toFixed(1) + 'px in 1 s at 60 (expect 42), record marked ' + marked + ', debrief sub ' + $('#dSub').textContent.slice(0, 30);`),
  check('text + font + palette', `const cw0 = S.cw, p0 = C['pen-1']; prefs.comfort.text = 1.3; prefs.comfort.easy = true; prefs.comfort.palette = 'cb'; applyTheme();
    const r = 'cw ' + cw0.toFixed(1) + ' -> ' + S.cw.toFixed(1) + ', font ' + S.font + ', pen-1 ' + p0 + ' -> ' + C['pen-1'] + ', data-text ' + document.documentElement.dataset.text;
    prefs.comfort.text = 1; prefs.comfort.easy = false; prefs.comfort.palette = 'standard'; applyTheme(); return r;`),
  check('settings screen', `quitToTitle(); openSettings(); const rows = document.querySelectorAll('#ovSet [data-cft]').length; document.querySelector('#ovSet [data-cft="assist"]').click(); const a = prefs.comfort.assist;
    document.querySelector('#ovSet [data-set="shake"]').click(); const sh = prefs.shake; prefs.comfort.assist = 1; setScreen('title');
    return 'comfort rows ' + rows + ', assist after click ' + a + ', shake toggled to ' + sh + ', pause rows ' + (startRun(3, 'sector'), pause(), document.querySelectorAll('#ovPause [data-cft]').length);`),
  check('logbook', `const out = []; for (const [k] of LOG_TABS) { openLog(k); out.push(k + ':' + $('#lgBody').textContent.length); closeLog(); } return out.join(' ');`),
  [null, SIM, 30],
  [null, `prefs.comfort.warmup = true; const r = JSON.stringify(sim(4, 'sector', 55)); prefs.comfort.warmup = false; r`, 30],
  [null, `JSON.stringify(sim(5, 'sector', 60))`, 30],
  [null, `JSON.stringify(sim(4, 'descent', 50, {}, .03, 300))`, 30],
];
