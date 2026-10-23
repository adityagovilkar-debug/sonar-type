// Phase 4, part 2: letter pairs, the finger and hand map, keyboard layouts in the heatmap, the weekly goal, warm-up
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- letter pairs: the gap between two letters, remembered like single letters
rep(`  recordKey(w.text[idx], idx > 0 && w.lastKeyT != null ? G.t - w.lastKeyT : null, true);`,
    `  recordKey(w.text[idx], idx > 0 && w.lastKeyT != null ? G.t - w.lastKeyT : null, true);
  if (idx > 0) recordPair(w.text[idx - 1], w.text[idx], w.lastKeyT != null ? G.t - w.lastKeyT : null, true);`);
rep(`  if (G.lock && G.lock.fired < G.lock.text.length) recordKey(G.lock.text[G.lock.fired], null, false);`,
    `  if (G.lock && G.lock.fired < G.lock.text.length) {
    recordKey(G.lock.text[G.lock.fired], null, false);
    if (G.lock.fired > 0) recordPair(G.lock.text[G.lock.fired - 1], G.lock.text[G.lock.fired], null, false);
  }`);
rep(`// how much harder than average each letter is for this typist`, `function recordPair(a, b, gap, ok) {
  if (G.mode !== 'play' || G.warmT > 0 && false) return;
  const k = (a + b).toLowerCase();
  if (!/^[a-z]{2}$/.test(k)) return;
  const P = prefs.pairs[k] || (prefs.pairs[k] = { n: 0, ms: 0, miss: 0 });
  if (ok) { P.n++; P.miss *= .95; if (gap != null && gap > .02 && gap < 1.5) P.ms = P.ms ? P.ms * .92 + gap * 80 : gap * 1000; }
  else P.miss = P.miss * .95 + .05;
}
// pairs that are slower or missier than this typist's usual; drives Drill and adaptive words alongside letters
function pairWeakness() {
  const ps = Object.entries(prefs.pairs).filter(([, P]) => P.n >= 6 && P.ms);
  if (ps.length < 12) return null;
  const mean = ps.reduce((t, [, P]) => t + P.ms, 0) / ps.length, w = {};
  for (const [k, P] of ps) { const v = Math.max(0, P.ms / mean - 1) * 1.5 + P.miss * 4; if (v > .1) w[k] = v; }
  return w;
}
const weakestPairs = (n = 8) => { const w = pairWeakness(); return w ? Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, n).map(e => e[0]) : []; };
// how much harder than average each letter is for this typist`);
rep(`    weak: mode === 'play' && prefs.adaptive && !pendingDaily ? letterWeakness() : null,`, `    weak: mode === 'play' && prefs.adaptive && !pendingDaily ? letterWeakness() : null,
    weakPairs: mode === 'play' && prefs.adaptive && !pendingDaily ? pairWeakness() : null,
    warmT: mode === 'play' && prefs.comfort.warmup && !pendingDaily && (game === 'sector' || game === 'descent') ? 30 : 0,`);
rep(`  const want = G.weak ? (G.game === 'drill' ? 8 : 4) : 3, cands = [];`, `  const hard = G.game === 'drill' || G.warmT > 0, want = G.weak || G.weakPairs ? (hard ? 8 : 4) : 3, cands = [];`);
rep(`  const bias = G.game === 'drill' ? 12 : 3;
  const wts = cands.map(c => { let s = 0; if (G.weak) for (const ch of c.toLowerCase()) s += G.weak[ch] || 0; return (1 + bias * s / c.length) * (CAT.has(c) ? 1 : 1.6); });`,
    `  const bias = hard ? 12 : 3;
  const wts = cands.map(c => {
    const lc = c.toLowerCase(); let s = 0;
    if (G.weak) for (const ch of lc) s += G.weak[ch] || 0;
    if (G.weakPairs) for (let i = 1; i < lc.length; i++) s += (G.weakPairs[lc[i - 1] + lc[i]] || 0) * 1.2;
    return (1 + bias * s / c.length) * (CAT.has(c) ? 1 : 1.6);
  });`);

// ---- warm-up: 30 s of no-damage, no-score practice on weak letters before the run proper
rep(`const calmGame = () => G.game === 'drill' || G.game === 'zen';`, `const calmGame = () => G.game === 'drill' || G.game === 'zen';
// a drill, zen, or the warm-up before a run: nothing can hurt the hull and nothing extra spawns
const quiet = () => calmGame() || G.warmT > 0;
function warmTick(dt) {
  G.warmT -= dt;
  if (G.warmT <= 0) { endWarmup(); return; }
  G.spawnT -= dt;
  if (G.spawnT <= 0 && enemies() < Math.max(2, maxContacts(G.diff) - 1)) { spawnEnemy({ speed: wordSpeed(G.diff) * .75 }); G.spawnT = spawnInterval(G.diff) * 1.1 * rnd(.8, 1.2); }
}
// the warm-up's score and counts are wiped; letters, pairs and recovered words it taught are kept
function endWarmup() {
  G.warmT = 0; G.words = []; G.tracers = []; G.torps = []; G.lock = null; G.fx = G.fx.filter(f => f.k !== 'stamp');
  Object.assign(G, { points: 0, ptsBy: {}, kills: 0, correct: 0, miss: 0, combo: 0, bestCombo: 0, bestWord: null, longest: '', t: 0, keyTimes: [], peakWpm: 0,
    kills5: Array(24).fill(0), k5T: 0, killsRun: [0], kRunT: 0, trace: [0], letters: {}, runBy: {}, flow: 0, inFlow: false, flowTime: 0, spawnT: .8, cleanRun: 0, depth: 0, zone: null });
  G.stats = { hullDmg: 0, hullHits: 0, phaseAbs: 0, ironHits: 0, hardest: null, used: { pulse: 0, torp: 0, nuke: 0, ping: 0 }, earned: { pulse: 0, torp: 0, nuke: 0 }, crates: { got: 0, seen: 0 }, mines: 0, decoys: 0 };
  prefs.life.warmups = (prefs.life.warmups || 0) + 1;
  if (G.game === 'descent') banner('DESCENT', 'warmed up · an endless dive: every 200 m the water changes', C.sonar);
  else banner(\`SECTOR \${pad(G.diff)} · WAVE 1/3\`, \`warmed up · \${DIFF_NAMES[G.diff - 1].toLowerCase()} · three waves, then the leviathan\`, C['pen-2']);
  sfx.engage();
}`);
rep(`if (G.game === 'patrol') patrolTick(dt); else if (G.game === 'drill') drillTick(dt);`, `if (G.warmT > 0) warmTick(dt); else if (G.game === 'patrol') patrolTick(dt); else if (G.game === 'drill') drillTick(dt);`);
rep(`  // a drill never hurts: a word that gets through just breaks the streak
  if (calmGame()) {`, `  // a drill, zen or warm-up never hurts: a word that gets through just breaks the streak
  if (quiet()) {`);
rep(`function addCharge(n) {
  if (calmGame()) return;`, `function addCharge(n) {
  if (quiet()) return;`);
rep(`  if (G.crateT <= 0 && !calmGame() && !G.spawnHold`, `  if (G.crateT <= 0 && !quiet() && !G.spawnHold`);
rep(`  if ((G.level >= 3 || stormy) && !calmGame()) {`, `  if ((G.level >= 3 || stormy) && !quiet()) {`);
rep(`  if ((G.level >= 5 || stormy) && !calmGame()) {`, `  if ((G.level >= 5 || stormy) && !quiet()) {`);
rep(`    if (G.level >= 3 && G.game !== 'drill' && !G.spawnHold && G.words.filter(w => w.kind === 'ally').length < 2) spawnAlly();`,
    `    if (G.level >= 3 && !quiet() && !G.spawnHold && G.words.filter(w => w.kind === 'ally').length < 2) spawnAlly();`);
rep(`      && R() < (G.daily && G.daily.mod === 'relics' ? 4 : 1) / 75 && !G.words.some(w => w.relic)) return spawnRelic(ang, d);`,
    `      && !G.warmT && R() < (G.daily && G.daily.mod === 'relics' ? 4 : 1) / 75 && !G.words.some(w => w.relic)) return spawnRelic(ang, d);`);
rep(`function dive(m) { if (G.game === 'descent') G.depth += m; }`, `function dive(m) { if (G.game === 'descent' && !G.warmT) G.depth += m; }`);
rep(`    if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat && G.arsenal.nuke) G.armHeld = true; return; }`,
    `    if (e.key === 'Enter') { e.preventDefault(); if (G.warmT > 0) { if (!e.repeat) endWarmup(); return; } if (!e.repeat && G.arsenal.nuke) G.armHeld = true; return; }`);
rep(`  if (game === 'descent') { banner('DESCENT', 'an endless dive: every 200 m the water changes', C.sonar); return; }`, `  if (G.warmT > 0) {
    const wl = weakestLetters(4);
    banner('WARM-UP · 30 SECONDS', \`no damage, no score\${wl.length ? ' · leaning on ' + wl.join(' ') : ''} · Enter skips\`, C['pen-3']);
    return;
  }
  if (game === 'descent') { banner('DESCENT', 'an endless dive: every 200 m the water changes', C.sonar); return; }`);
rep(`  if (G.game === 'drill') {
    $('#tHead').textContent = 'Drill';`, `  if (G.warmT > 0) {
    $('#tHead').textContent = 'Warm-up';
    $('#mFloor').innerHTML = 'Enter skips';
    dotArc($('#cvGauge'), G.warmT / 30, String(Math.ceil(G.warmT)), 'SECONDS', C['pen-3']);
  } else if (G.game === 'drill') {
    $('#tHead').textContent = 'Drill';`);
rep(`  const where = G.daily ?`, `  const where = G.warmT > 0 ? \`warm-up · <b>\${Math.ceil(G.warmT)} s</b> · Enter skips\` : G.daily ?`);

// ---- the weekly goal
rep(`// consecutive days with a counted dive,`, `// the weekly goal: a target for this week (Monday to Sunday) in words a minute, accuracy, minutes or runs
const GOALS = { wpm: ['average words a minute', [20, 120, 5]], acc: ['average accuracy %', [85, 100, 1]], minutes: ['minutes at the scope', [10, 300, 10]], runs: ['runs', [3, 50, 1]] };
function weekStart(d = new Date()) { const w = new Date(d); w.setHours(0, 0, 0, 0); w.setDate(w.getDate() - (w.getDay() + 6) % 7); return w; }
const weekKey = (d = new Date()) => dayKey(weekStart(d));
function goalProgress() {
  const from = weekStart().getTime(), runs = prefs.history.filter(h => h.at >= from), g = prefs.goal;
  const timed = runs.filter(h => h.secs >= 30 && h.wpm), avg = (a, k) => a.length ? a.reduce((t, h) => t + h[k], 0) / a.length : 0;
  const value = g.type === 'wpm' ? avg(timed, 'wpm') : g.type === 'acc' ? avg(runs.filter(h => h.acc != null), 'acc') : g.type === 'minutes' ? runs.reduce((t, h) => t + h.secs, 0) / 60 : runs.length;
  const enough = (g.type === 'wpm' || g.type === 'acc') ? runs.length >= 3 : true;
  return { value, target: g.target, met: enough && value >= g.target, runs: runs.length, enough };
}
const goalLine = () => { const p = goalProgress(), g = prefs.goal; return \`goal \${g.type === 'acc' ? p.value.toFixed(1) : Math.round(p.value)}/\${g.target} \${g.type === 'acc' ? '%' : g.type === 'wpm' ? 'wpm' : g.type}\${p.met ? ' ✓' : ''}\`; };
// consecutive days with a counted dive,`);
rep(`  const heardNow = storyUnheard();
  savePrefs();`, `  // the week's goal, met for the first time with this run
  const goalNow = goalProgress(), goalHit = goalNow.met && !prefs.goalsMet[weekKey()];
  if (goalHit) prefs.goalsMet[weekKey()] = true;
  const heardNow = storyUnheard();
  savePrefs();`);
rep(`    + (promoted ? r('var(--pen-2)', 'Promoted', \`<b>\${promoted}</b>\`) : '')`, `    + (promoted ? r('var(--pen-2)', 'Promoted', \`<b>\${promoted}</b>\`) : '')
    + (goalHit ? r('var(--pen-3)', 'Weekly goal met', \`<b>\${goalLine()}</b>\`) : '')`);
rep(`  $('#runsNote').textContent = \`\${RANKS[rankOf(prefs.salvageTotal)][1]} · archive \${(catPct() * 100).toFixed(1)}% · \${prefs.runs} run\${prefs.runs === 1 ? '' : 's'} · \${medals} sector\${medals === 1 ? '' : 's'} cleared\`;`,
    `  $('#runsNote').textContent = \`\${RANKS[rankOf(prefs.salvageTotal)][1]} · archive \${(catPct() * 100).toFixed(1)}% · \${goalLine()} · \${prefs.runs} run\${prefs.runs === 1 ? '' : 's'}\`;`);
rep(`  $('#runsNote').textContent = \`\${RANKS[rankOf(prefs.salvageTotal)][1]} · archive \${(catPct() * 100).toFixed(1)}% · \${prefs.runs} runs · \${medals} sectors cleared\`;`,
    `  $('#runsNote').textContent = \`\${RANKS[rankOf(prefs.salvageTotal)][1]} · archive \${(catPct() * 100).toFixed(1)}% · \${goalLine()} · \${prefs.runs} runs\`;`);
// the Logbook's progress page: the goal, with a picker
rep(`    const dives = Object.entries(prefs.daily), deepest = Math.max(0, ...Object.values(prefs.deepest));`, `    {
      const gp = goalProgress(), g = prefs.goal, [label, [lo, hi, stepv]] = GOALS[g.type];
      html += \`<div class="sech"><span class="lbl">This week's goal</span></div><div class="goalbox">
        <div class="gtypes">\${Object.entries(GOALS).map(([k, [nm]]) => \`<button class="chip \${k === g.type ? 'on' : ''}" data-goal="\${k}">\${nm}</button>\`).join('')}</div>
        <div class="gset"><button class="btn sm" data-gstep="-1">−</button><b>\${g.target}</b><button class="btn sm" data-gstep="1">+</button>
        <span>\${dotBar(Math.min(1, gp.value / g.target), 20, gp.met ? 'var(--pen-3)' : 'var(--pen-2)', 2)} \${g.type === 'acc' ? gp.value.toFixed(1) : Math.round(gp.value)} \${label} this week\${gp.enough ? '' : ' · needs 3 runs'}\${gp.met ? ' · <b style="color:var(--pen-3)">met</b>' : ''}</span></div>
        <p class="savep">\${Object.keys(prefs.goalsMet).length} week\${Object.keys(prefs.goalsMet).length === 1 ? '' : 's'} with the goal met. The week runs Monday to Sunday.</p></div>\`;
    }
    const dives = Object.entries(prefs.daily), deepest = Math.max(0, ...Object.values(prefs.deepest));`);
rep(`  const dn = $('#btnDrillNow'); if (dn) dn.onclick = () => startRun(sel, 'drill');`, `  const dn = $('#btnDrillNow'); if (dn) dn.onclick = () => startRun(sel, 'drill');
  document.querySelectorAll('[data-goal]').forEach(b => b.onclick = () => { const k = b.dataset.goal; prefs.goal = { type: k, target: { wpm: 40, acc: 95, minutes: 60, runs: 10 }[k] }; savePrefs(); renderLog(); sfx.ui(); });
  document.querySelectorAll('[data-gstep]').forEach(b => b.onclick = () => {
    const [, [lo, hi, st]] = GOALS[prefs.goal.type]; prefs.goal.target = clamp(prefs.goal.target + st * +b.dataset.gstep, lo, hi); savePrefs(); renderLog(); sfx.ui();
  });`);
rep(`.catbar{`, `.goalbox .gtypes{display:flex;gap:6px;flex-wrap:wrap}
.goalbox .gset{display:flex;gap:10px;align-items:center;margin-top:10px}
.goalbox .gset b{font-family:var(--mono);font-size:16px;min-width:34px;text-align:center}
.goalbox .gset span{font-family:var(--mono);font-size:10.5px;color:var(--ink-3);display:flex;gap:8px;align-items:center}
.fingers{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;margin-top:4px}
.finger{border:1px solid var(--rule);border-radius:var(--r);padding:7px 6px;text-align:center;font-family:var(--mono)}
.finger b{display:block;font-size:13px;color:var(--ink)}
.finger span{display:block;font-size:8.5px;color:var(--ink-3);margin-top:2px}
.finger i{display:block;font-style:normal;font-size:9px;color:var(--ink-2);margin-top:4px;letter-spacing:.06em}
.catbar{`);

// ---- the Letters page: layout-aware heatmap, slowest pairs, fingers and hands
rep(`    const weak = letterWeakness(), rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];`, `    const weak = letterWeakness(), rows = LAYOUTS[prefs.comfort.layout][1];`);
rep(`    html = \`<div class="kb">\${rows.map((row, ri) => \`<div class="r" style="margin-left:\${ri * 22}px">\${[...row].map(ch => {
      const Lc = prefs.letters[ch],`, `    html = \`<div class="kb">\${rows.map((row, ri) => \`<div class="r" style="margin-left:\${ri * 22}px">\${[...row].map(ch => {
      if (ch === ' ') return '<div class="key na" style="visibility:hidden"></div>';
      const Lc = prefs.letters[ch],`);
rep(`    const w5 = weakestLetters();`, `    // fingers: each key by its column on the chosen layout, touch-typing style
    const FINGERS = ['L pinky', 'L ring', 'L middle', 'L index', 'L index', 'R index', 'R index', 'R middle', 'R ring', 'R pinky'];
    const per = {};
    rows.forEach(row => [...row].forEach((ch, col) => {
      const L = prefs.letters[ch]; if (ch === ' ' || !L || L.n < 3 || !L.ms) return;
      const fk = FINGERS[Math.min(9, col)], e = per[fk] || (per[fk] = { n: 0, ms: 0, miss: 0, keys: '' });
      e.n += L.n; e.ms += L.ms * L.n; e.miss += L.miss * L.n; e.keys += ch;
    }));
    const order = ['L pinky', 'L ring', 'L middle', 'L index', 'R index', 'R middle', 'R ring', 'R pinky'];
    const fms = order.filter(k => per[k]).map(k => per[k].ms / per[k].n), fmean = fms.length ? fms.reduce((a, b) => a + b, 0) / fms.length : 0;
    const hand = h => { const ks = order.filter(k => k[0] === h && per[k]); const n = ks.reduce((t, k) => t + per[k].n, 0); return n ? ks.reduce((t, k) => t + per[k].ms, 0) / n : 0; };
    html += \`<div class="sech"><span class="lbl">Fingers · \${LAYOUTS[prefs.comfort.layout][0]}</span></div><div class="fingers">\${order.map(k => {
      const e = per[k]; if (!e) return \`<div class="finger"><b>–</b><span>\${k}</span></div>\`;
      const ms = e.ms / e.n, col = ms > fmean * 1.15 ? 'var(--pen-1)' : ms > fmean * 1.05 ? 'var(--pen-4)' : ms < fmean * .95 ? 'var(--pen-3)' : 'var(--ink-3)';
      return \`<div class="finger" style="border-color:color-mix(in srgb,\${col} 55%,var(--rule))"><b>\${Math.round(ms)}</b><span>ms · \${(e.miss / e.n * 100).toFixed(0)}% miss</span><span>\${k}</span><i>\${e.keys}</i></div>\`;
    }).join('')}</div>\`;
    const hl = hand('L'), hr = hand('R');
    if (hl && hr) html += r('', 'Hands', \`left \${Math.round(hl)} ms · right \${Math.round(hr)} ms\${Math.abs(hl - hr) > 12 ? \` · the \${hl > hr ? 'left' : 'right'} hand is slower\` : ' · evenly matched'}\`);
    const wp = weakestPairs();
    html += r('', 'Slowest pairs', wp.length ? wp.map(k => \`<kbd>\${k}</kbd> \${Math.round(prefs.pairs[k].ms)}\`).join(' ') + ' <small class="u">ms</small>' : 'type a few runs first');
    const w5 = weakestLetters();`);
rep(`      + r('', 'Adaptive words', prefs.adaptive ? 'on: every mode leans a little towards these letters; Drill leans hard' : 'off: words are picked at random')`,
    `      + r('', 'Adaptive words', prefs.adaptive ? 'on: every mode leans a little towards these letters and pairs; Drill and the warm-up lean hard' : 'off: words are picked at random')`);
// tiles: mark records set with assist
rep(`    if (prefs.game === 'sector' && prefs.hi.sector[d] != null) st += \` <span class="hi">\${fmtPts(prefs.hi.sector[d])}</span>\`;`,
    `    if (prefs.game === 'sector' && prefs.hi.sector[d] != null) st += \` <span class="hi">\${fmtPts(prefs.hi.sector[d])}\${prefs.hiAssist['sector:' + d] ? ' · assisted' : ''}</span>\`;`);
// ---- commendations
rep(`  ['ability25', 'Signature move', 'Use hull abilities 25 times in all.', 60, () => (prefs.life.abilities || 0) >= 25],`, `  ['ability25', 'Signature move', 'Use hull abilities 25 times in all.', 60, () => (prefs.life.abilities || 0) >= 25],
  ['goal1', 'On target', 'Meet a weekly goal.', 100, () => Object.keys(prefs.goalsMet).length >= 1],
  ['goal4', 'Steady practice', 'Meet the weekly goal in four different weeks.', 250, () => Object.keys(prefs.goalsMet).length >= 4],
  ['warm10', 'Limber', 'Warm up before ten runs.', 60, () => (prefs.life.warmups || 0) >= 10],`);
fs.writeFileSync(f, s); console.log('ok');
