// Phase 1 (the Archive): catalogue, relics, bestiary, commendations, rank, story and Logbook pages
const { check, SIM } = require('./lib.cjs');
module.exports = [
  check('catalogue', `const c0 = CAT.size; const ws = POOLS[2].filter(w => !CAT.has(w)), a = put(ws[0], 0, .6), b = put(ws[1], 90, .6); type(a); type(b); const t1 = CAT.size - c0;
    G.arsenal.torp = 1; const c1 = put(ws[2], 200, .5); useTorp(c1); step(200);
    return 'typed 2 -> +' + t1 + ', torpedoed -> +' + (CAT.size - c0 - t1) + ', newWords ' + G.newWords + ' (expect +2, +0, 2)';`),
  check('relic typed', `const w = spawnRelic(0.5, S.R * .6); w.speed = 0; const word = w.text; type(w);
    return word + ': recovered ' + !!prefs.relics[word] + ', in run ' + G.runRelics.join(',') + ', points ' + G.points + ', bestiary ' + JSON.stringify(prefs.bestiary.relic) + ', card queued ' + (tipQ[0] && tipQ[0][0]);`),
  check('relic lost', `const w = spawnRelic(0.5, S.R * .2); w.speed = 200; const h = G.hull; step(120); return 'live ' + live(w) + ', hull ' + G.hull + '/' + h + ', recovered ' + !!prefs.relics[w.text] + ' (expect false, same, false)';`),
  check('relic torpedoed', `prefs.relics = {}; const w = spawnRelic(0.5, S.R * .5); w.speed = 0; G.arsenal.torp = 1; useTorp(w); step(200); return 'recovered ' + Object.keys(prefs.relics).length + ', destroyed stamp ' + G.fx.filter(f => f.k === 'stamp' && /DESTROYED/.test(f.text)).length + ' (expect 0, 1)';`),
  check('relic rate', `G.level = 5; let n = 0; for (let i = 0; i < 3000; i++) { const w = spawnEnemy(); if (w.relic) n++; remove(w); } return 'relics in 3000 spawns: ' + n + ' (expect about 40)';`),
  check('no relic in drill', `G.level = 5; let n = 0; for (let i = 0; i < 2000; i++) { const w = spawnEnemy({ speed: 30 }); if (w.relic) n++; remove(w); } return 'relics from drill-style spawns: ' + n + ' (expect 0)';`, 5, 'drill'),
  check('bestiary', `prefs.bestiary = {}; put('anchor', 0, .6); put('harbour', 90, .6, { trait: 'armour' }); spawnCrate('repair'); spawnBoss('archer'); fireShot(G.boss);
    return JSON.stringify(Object.fromEntries(Object.entries(prefs.bestiary).map(([k, v]) => [k, v.seen])));`),
  check('commendations + rank', `prefs.honours = {}; const s0 = prefs.salvage; G.bestCombo = 30; G.points = 12000; G.correct = 300; G.t = 120; gameOver('hull');
    return 'earned ' + Object.keys(prefs.honours).join(',') + ' | salvage +' + (prefs.salvage - s0) + ' | debrief blocks ' + document.querySelectorAll('#dArchive .tx.gold').length + ' | rank ' + RANKS[rankOf(prefs.salvageTotal)][1];`),
  check('no double award', `const n0 = Object.keys(prefs.honours).length, s0 = prefs.salvage; G.bestCombo = 30; G.points = 12000; G.correct = 300; G.t = 120; gameOver('hull');
    return 'new commendations on a repeat ' + (Object.keys(prefs.honours).length - n0) + ' (expect 0 or only fresh ones)';`),
  check('catalogue saved', `const k = [...BANK][123]; CAT.add(k); CATSTATE.dirty = true; savePrefs(); const raw = JSON.parse(localStorage.getItem(STORE));
    return 'saved string has it ' + raw.cat.split(' ').includes(k) + ', words saved ' + raw.cat.split(' ').length;`),
  check('story + cosmetics', `for (const w of [...BANK].slice(0, Math.ceil(BANK.size * .26))) CAT.add(w); for (const k of Object.keys(RELICS).slice(0, 10)) prefs.relics[k] = Date.now();
    return 'pct ' + (catPct() * 100).toFixed(1) + ', story ' + ['c10', 'r10', 'c50'].map(id => id + ':' + STORY.find(e => e.id === id).req()).join(' ') + ', gilt ' + owns('scope', 'gilt') + ', quill ' + owns('tracer', 'quill') + ' (expect true true false, true, true)';`),
  check('logbook pages', `const out = []; for (const [k] of LOG_TABS) { openLog(k); out.push(k + ':' + $('#lgBody').textContent.length); closeLog(); } return out.join(' ');`),
  [null, SIM, 30],
  [null, `const r = sim(5, 'sector', 60); JSON.stringify(r)`, 30],
  [null, `const r = sim(4, 'expedition', 55); JSON.stringify(r)`, 30],
  [null, `const r = sim(3, 'patrol', 45, {}, .03, 240); JSON.stringify(r)`, 30],
];
