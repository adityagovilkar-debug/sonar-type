// Phase 2 (New water): the six new contacts, Descent, the Daily dive, Zen
const { check, SIM } = require('./lib.cjs');
module.exports = [
  check('krill', `G.level = 6; const first = spawnEnemy({ trait: 'krill', ang: 1, dist: S.R * .7 }); const k = G.words.filter(w => w.trait === 'krill');
    return k.length + ' krill, letters ' + k.map(w => w.text).join('') + ', distinct ' + (new Set(k.map(w => w.text)).size === k.length) + ', damage each ' + hitDamage(first);`),
  check('mimic', `const w = put('anchor', 0, .6, { trait: 'mimic' }); w.mimT = 1.2; const t0 = w.text; step(80); const t1 = w.text; press(w.text[0]); const t2 = w.text; step(160);
    return t0 + ' -> ' + t1 + ' (changed ' + (t0 !== t1) + ') -> after first letter stays ' + (w.text === t2) + ', same length ' + (t1.length === t0.length);`),
  check('diver', `const w = put('planet', 0, .7, { trait: 'diver' }); w.diveT = rnd(1.5, 2.5); w.diveT = .01; step(2); const under = w.under, s1 = sight(w);
    const m0 = G.miss; press('p'); const missed = G.miss > m0; step(140);
    return 'under ' + under + ' sight ' + s1 + ' typing it misses ' + missed + ' -> surfaced ' + !w.under + ' sight ' + sight(w);`),
  check('warden', `const wd = put('keeper', 0, .6, { trait: 'warden' }), inside = put('planet', 10, .62), outside = put('orange', 180, .6); step(2);
    const m0 = G.miss; press('p'); const blocked = G.miss > m0; G.lock = null; const sh1 = inside.shielded + '/' + outside.shielded;
    for (const ch of wd.text) { press(ch); step(6); } step(60);
    return 'shielded inside/outside ' + sh1 + ', typing inside blocked ' + blocked + ', warden gone ' + !live(wd) + ', inside free now ' + !inside.shielded;`),
  check('ally', `const a = spawnAlly(); a.rx = -S.R * .5; a.ry = 0; a.vx = 0; a.vy = 0; a.entered = true; const h0 = G.hull;
    const inThreats = threats().includes(a); for (const ch of a.text) { press(ch); step(6); } step(40);
    const ff = h0 - G.hull; const b = spawnAlly(); b.entered = true; b.rx = S.w; b.ry = 0; const p0 = G.points; step(2);
    return 'ally in threats ' + inThreats + ', friendly fire cost ' + ff + ' hull, escort paid ' + (G.points - p0) + ', escorts ' + (G.stats.escorts || 0);`),
  check('ally vs other words', `const a = spawnAlly(); a.rx = -S.R * .4; a.ry = 0; a.vx = a.vy = 0; const o = put(a.text[0] + 'xyzzy', 90, .8); press(a.text[0]);
    return 'lock went to ' + (G.lock === o ? 'the enemy' : G.lock === a ? 'the ally' : 'nothing') + ' (expect the enemy)';`),
  check('nuke spares allies', `const a = spawnAlly(); a.rx = S.R * .3; a.ry = 0; a.vx = a.vy = 0; put('anchor', 0, .5); G.arsenal.nuke = 1; detonate(); step(120); return 'ally alive ' + live(a) + ', enemies left ' + enemies();`),
  check('descent zones', `const z0 = zoneIndex(), lv0 = G.level; G.depth = 210; update(1 / 60); const s1 = screen, z1 = zoneIndex(); if (screen === 'pick') { inputGuard = 0; takeCard(0); }
    G.depth = 610; update(1 / 60); if (screen === 'pick') { inputGuard = 0; takeCard(0); } for (let i = 0; i < 10; i++) update(1 / 60); const thermo = !!G.thermo;
    G.depth = 820; update(1 / 60); if (screen === 'pick') { inputGuard = 0; takeCard(0); } for (let i = 0; i < 120; i++) update(1 / 60);
    return 'zone ' + z0 + '->' + z1 + ' (screen ' + s1 + '), level ' + lv0 + '->' + G.level + ', abyss thermo ' + thermo + ', hadal boss ' + (G.boss && G.boss.btype) + ', layers ' + (G.boss && G.boss.layerTotal);`, 3, 'descent'),
  check('hadal leviathan', `G.depth = 820; G.zone = 4; G.nextBossAt = 0; for (let i = 0; i < 30; i++) update(1 / 60); return 'boss ' + (G.boss && G.boss.btype) + ', layers ' + (G.boss && G.boss.layerTotal) + ', still running ' + G.sim;`, 3, 'descent'),
  check('descent depth', `const a = put('planet', 0, .6); type(a); return 'depth after one 6-letter word ' + G.depth + ' (expect 9)';`, 3, 'descent'),
  check('dark water', `G.depth = 420; update(1 / 60); if (screen === 'pick') { inputGuard = 0; takeCard(0); } const w = put('planet', 0, .8); return 'zone ' + ZONES[zoneIndex()].name + ', far contact sight ' + sight(w) + ' (expect hidden until swept)';`, 3, 'descent'),
  check('daily config', `const a = dailyConfig('2026-10-23'), b = dailyConfig('2026-10-23'), c = dailyConfig('2026-10-24');
    return 'same day same ' + (JSON.stringify(a) === JSON.stringify(b)) + ', next day differs ' + (JSON.stringify(a) !== JSON.stringify(c)) + ' | today: ' + JSON.stringify(dailyConfig());`),
  check('daily run', `prefs.daily = {}; startRun(sel, 'daily'); const cfg = G.daily, g = G.game, d = G.diff, pm = G.pressMul; G.points = 5000; G.correct = 100; G.t = 60; gameOver('hull');
    const logged = !!prefs.daily[cfg.key]; startRun(sel, 'daily'); G.points = 9000; gameOver('hull');
    return 'game ' + g + ', diff ' + d + ' (=' + cfg.diff + '), mod ' + cfg.mod + ', boss ' + cfg.boss + ', pressMul ' + pm + ', logged ' + logged + ', second attempt kept first score ' + (prefs.daily[cfg.key].pts === 5000) + ', title ' + $('#dTitle').textContent;`),
  check('daily same words', `const words = s => { G.rng = mulberry(s); G.words = []; G.recent = []; const out = []; for (let i = 0; i < 8; i++) { const w = spawnEnemy(); out.push(w.text); remove(w); } return out.join(','); };
    const a = words(42), b = words(42); return 'same seed same words ' + (a === b) + ' (' + a.slice(0, 40) + '...)';`),
  check('zen', `const h0 = G.hull; put('ox', 0, .2, { speed: 300 }); step(60); const hull = G.hull; pause(); const btn = !$('#btnEndZen').hidden; G.points = 4000; G.t = 300; gameOver('zen');
    return 'hull ' + hull + '/' + h0 + ', end button shown ' + btn + ', screen ' + screen + ', title ' + $('#dTitle').textContent + ', zen secs ' + prefs.life.zen + ', salvage line ' + $('#dSalvage').textContent.match(/\\+\\d+/);`, 3, 'zen'),
  check('new commendations', `prefs.honours = {}; prefs.deepest = { 3: 640 }; prefs.daily = { [dayKey()]: { pts: 1 } }; G.runBy = { krill: 31, warden: 5, ally: 5 }; G.t = 70; G.correct = 100; gameOver('hull');
    return ['daily1', 'depth500', 'krill', 'gatebreaker', 'convoy'].map(k => k + ':' + !!prefs.honours[k]).join(' ');`),
  check('title tiles', `const out = []; for (const g of GAMES) { setGame(g); out.push(g + ':' + $('#tiles').textContent.replace(/\\s+/g, ' ').trim().slice(0, 50)); } setGame('sector'); return out.join(' | ');`),
  check('logbook', `const out = []; for (const [k] of LOG_TABS) { openLog(k); out.push(k + ':' + $('#lgBody').textContent.length); closeLog(); } return out.join(' ');`),
  [null, SIM, 30],
  [null, `JSON.stringify(sim(4, 'descent', 50, {}, .03, 400))`, 30],
  [null, `JSON.stringify(sim(6, 'descent', 75, {}, .03, 500))`, 30],
  [null, `JSON.stringify(sim(1, 'daily', 55))`, 30],
  [null, `JSON.stringify(sim(5, 'sector', 60))`, 30],
  [null, `JSON.stringify(sim(4, 'expedition', 55))`, 30],
  [null, `JSON.stringify(sim(3, 'zen', 40, {}, .03, 120))`, 30],
];
