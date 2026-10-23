// Phase 3 (Combat depth): hull abilities, mastery perks, flow, parry, ghost, expedition tiers
const { check, SIM } = require('./lib.cjs');
const hull = h => `{ hull: '${h}' }`;
module.exports = [
  check('skiff breath', `const w = put('anchor', 0, .8, { speed: 60 }); const d0 = w.dist; useAbility(); const cd = G.abilCd; step(30); const moved = d0 - w.dist; useAbility();
    return 'moved ' + moved.toFixed(1) + 'px in .5 s at 60 px/s (expect ~7.5), cooldown ' + cd + ', second use blocked ' + (G.abilCd < cd);`, 5, 'sector', hull('skiff')),
  check('bastion brace', `useAbility(); const h0 = G.hull; G.iron = G.iron.map(() => false); put('harbour', 0, .1, { speed: 300 }); step(40); const h1 = G.hull; put('harbour', 90, .1, { speed: 300 }); step(40);
    return 'first hit hull ' + h1 + '/' + h0 + ' (braced), second hit hull ' + G.hull + ' (expect lower)';`, 5, 'sector', hull('bastion')),
  check('wraith phase out', `G.phase.on = false; useAbility(); const h0 = G.hull; put('harbour', 0, .1, { speed: 300 }); step(40); return 'hull ' + G.hull + '/' + h0 + ' (expect unchanged)';`, 5, 'sector', hull('wraith')),
  check('lancer overdrive', `const a = put('harbour', 0, .6); type(a); const p1 = G.points; useAbility(); const b = put('harbour', 90, .6); press('h'); const dur = G.tracers[0].dur; step(6); for (const ch of b.text.slice(1)) { press(ch); step(6); } step(40);
    return 'tracer dur ' + dur.toFixed(3) + ' (expect tiny), points plain ' + p1 + ' vs overdrive ' + (G.points - p1);`, 5, 'sector', hull('lancer')),
  check('choir chorus', `G.pingCd = 10; useAbility(); return 'pingT ' + G.pingT + ', normal ping cooldown kept ' + G.pingCd.toFixed(0) + ', chorusT ' + G.chorusT + ', slow ' + G.chorusSlow;`, 5, 'sector', hull('choir')),
  check('no ability in zen', `useAbility(); return 'abilCd ' + G.abilCd + ' (expect 0)';`, 3, 'zen'),
  check('mastery perks', `prefs.mastery = { skiff: 500, lancer: 1900 }; const lv = masteryLv('skiff') + '/' + masteryLv('lancer'); startRun(5, 'sector'); const luck = G.luck;
    const m0 = G.combo = 5; press('q'); const kept = G.combo; prefs.loadout.hull = 'lancer'; startRun(5, 'sector');
    return 'levels ' + lv + ', skiff luck ' + luck + ', streak kept on first miss ' + (kept === 5) + ', lancer torpedoes ' + G.arsenal.torp + ' (expect 2), lancer overdrive ' + (useAbility(), G.overT) + ' (expect 7)';`),
  check('mastery xp', `prefs.mastery = {}; const a = put('harbour', 0, .6); type(a); G.correct = 50; G.t = 40; gameOver('hull'); return 'skiff xp ' + prefs.mastery.skiff + ', debrief row ' + /mastery/.test($('#dArchive').textContent);`),
  check('flow', `let entered = false; for (let i = 0; i < 12; i++) { const w = put(POOLS[2][40 + i], i * 30, .6); for (const ch of w.text) { press(ch); step(1); } step(40); entered = entered || G.inFlow; }
    const flowPts = G.ptsBy.flow || 0; press('q'); return 'entered ' + entered + ', flow points ' + flowPts + ', after a miss inFlow ' + G.inFlow + ' flow ' + G.flow;`),
  check('parry', `G.sec.stage = 'boss'; spawnBoss('archer'); const b = G.boss; b.speed = 0; b.rx *= .6; b.ry *= .6; const t0 = b.text; fireShot(b); const s = G.words.find(w => w.shot); s.speed = 0;
    for (const ch of s.text) { press(ch); step(2); } for (let i = 0; i < 40; i++) update(1 / 60);
    return 'parries ' + (G.stats.parries || 0) + ', boss ' + t0 + ' -> ' + b.text + ', stunned ' + (b.stunT > 0) + ', bonus ' + (G.ptsBy.bonus || 0);`),
  check('ghost', `prefs.ghosts = { 'sector:5': { pts: 4000, trace: [0, 500, 1200, 2000, 3000, 4000] } }; startRun(5, 'sector'); G.points = 900; G.t = 7; hudT = 0; hud(1);
    const shown = $('#mBest').textContent; G.points = 6000; G.correct = 100; G.t = 40; prefs.honours = {}; gameOver('hull');
    return 'hud ' + shown + ' (expect about +-) | ghost now ' + prefs.ghosts['sector:5'].pts + ', Past self ' + !!prefs.honours.ghost_beat;`),
  check('tiers', `prefs.expTier = 3; prefs.expTierSel = 3; startRun(4, 'expedition'); const e = G.exp, lv = e.cols[0][0].level, harb = e.cols.flat().some(n => n.type === 'harbour');
    return 'tier ' + G.tier + ', pressMul ' + G.pressMul.toFixed(2) + ', hull ' + G.hull + '/' + G.hullMax + ', first-leg level ' + lv + ' (base would be ' + clamp(4 + (LEGS[e.cols[0][0].type] ? LEGS[e.cols[0][0].type].lv : 1), 1, 12) + '), harbour ' + harb;`),
  check('tier 4 no harbour', `prefs.expTier = 5; prefs.expTierSel = 4; startRun(4, 'expedition'); return 'harbour on chart ' + G.exp.cols.flat().some(n => n.type === 'harbour') + ' (expect false)';`),
  check('tier unlock', `prefs.expTier = 1; prefs.expTierSel = 1; startRun(4, 'expedition'); G.points = 1000; G.correct = 50; G.t = 60; gameOver('cleared'); return 'expTier now ' + prefs.expTier + ' (expect 2), row ' + /tier 2 unlocked/i.test($('#dArchive').textContent);`),
  check('title tiers + dock', `setGame('expedition'); const t = $('#pressBar').textContent.replace(/\\s+/g, ' '); setGame('sector'); openDock('hulls'); const d = $('#dkBody').textContent.includes('Mastery'); closeDock(); return 'tier bar: ' + t.slice(0, 120) + ' | dock shows mastery ' + d;`),
  check('logbook', `const out = []; for (const [k] of LOG_TABS) { openLog(k); out.push(k + ':' + $('#lgBody').textContent.length); closeLog(); } return out.join(' ');`),
  [null, SIM, 30],
  [null, `JSON.stringify(sim(5, 'sector', 60, { loadout: { hull: 'lancer' } }))`, 30],
  [null, `JSON.stringify(sim(4, 'expedition', 55, { loadout: { hull: 'bastion' } }))`, 30],
  [null, `JSON.stringify(sim(4, 'descent', 50, { loadout: { hull: 'choir' } }, .03, 400))`, 30],
];
