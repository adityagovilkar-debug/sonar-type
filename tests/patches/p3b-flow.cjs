// Phase 3, part 2: flow state, parrying shots, the ghost of your best run
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- run fields
rep(`    depth: 0, zone: null, nextBossAt: 0, allyT: null, daily: pendingDaily, rng: null,`, `    depth: 0, zone: null, nextBossAt: 0, allyT: null, daily: pendingDaily, rng: null,
    flow: 0, inFlow: false, flowTime: 0, lastKillT: 0, trace: [0], tier: 0,
    ghost: mode === 'play' && !pendingDaily ? prefs.ghosts[game + ':' + diff] || null : null,`);

// ---- flow: fast, clean words fill it; a miss, a hit or a lull drains it
rep(`function cleanWord() {`, `// flow: fast clean words fill the meter; full, it scores ×1.25 until a miss, a hull hit, or a lull empties it
function flowGain(w) {
  const sp = speedFactor(w);
  G.flow = Math.min(1, G.flow + (sp >= 1.3 ? .14 : sp >= 1 ? .08 : .03)); G.lastKillT = G.t;
  if (G.flow >= 1 && !G.inFlow) {
    G.inFlow = true; G.stats.flows = (G.stats.flows || 0) + 1;
    coreStamp('FLOW', C['pen-2'], 1.4); ripple(S.cx, S.cy, 8, 520, 1.2); sfx.flow(); tip('flow');
  }
}
function breakFlow() {
  if (G.inFlow) G.fx.push({ k: 'stamp', x: S.cx, y: S.cy - 92, text: 'FLOW BROKEN', col: C['ink-3'], life: 1, max: 1 });
  G.flow = 0; G.inFlow = false;
}
function cleanWord() {`);
rep(`  if (clean) { earnCharge(1); repair(1.5); cleanWord(); }`, `  if (clean) { earnCharge(1); repair(1.5); cleanWord(); flowGain(w); }`);
rep(`  const pts = addPoints(r[0], 'words') + addPoints(r[1] - r[0], 'speed') + addPoints(r[2] - r[1], 'range') + addPoints(r[3] - r[2], 'streak');`,
    `  let pts = addPoints(r[0], 'words') + addPoints(r[1] - r[0], 'speed') + addPoints(r[2] - r[1], 'range') + addPoints(r[3] - r[2], 'streak');
  if (G.inFlow) { pts += addPoints(r[3] * .25, 'flow'); tags.push('FLOW ×1.25'); }`);
rep(`    if (G.lock) { G.lock.missT = .28; G.lock.missed = true; }
    if (!G.mods.steady) G.charge = Math.max(0, G.charge - MISS_COST);`, `    if (G.lock) { G.lock.missT = .28; G.lock.missed = true; }
    breakFlow();
    if (!G.mods.steady) G.charge = Math.max(0, G.charge - MISS_COST);`);
rep(`    G.hull -= dmg; G.stats.hullDmg += dmg; G.stats.hullHits++;
    G.combo = 0; G.hurt = 1;`, `    G.hull -= dmg; G.stats.hullDmg += dmg; G.stats.hullHits++; breakFlow();
    G.combo = 0; G.hurt = 1;`);
rep(`  G.k5T += dt; if (G.k5T >= 5) { G.k5T = 0; G.kills5.push(0); G.kills5.shift(); }`, `  G.k5T += dt; if (G.k5T >= 5) { G.k5T = 0; G.kills5.push(0); G.kills5.shift(); G.trace.push(G.points); }
  if (G.t - G.lastKillT > 2.5) { G.flow = Math.max(0, G.flow - dt * .06); if (G.inFlow && G.flow < .35) breakFlow(); }
  if (G.inFlow) G.flowTime += dt;`);
// the scope lights up in the pen of the flow while it lasts, and the music lifts
rep(`    c.globalAlpha = .18 + i * .16; c.fillStyle = C.sonar; c.beginPath();`, `    c.globalAlpha = .18 + i * .16; c.fillStyle = G.inFlow ? C['pen-2'] : C.sonar; c.beginPath();`);
rep(`  const busy = .3 + (G.level / 12) * .45 + (G.boss ? .2 : 0);`, `  const busy = .3 + (G.level / 12) * .45 + (G.boss ? .2 : 0) + (G.inFlow ? .25 : 0);`);
rep(`  // Blackout: the outer 40% of the scope is shrouded unless a ping is showing`, `  if (G.inFlow) dottedCircle(c, cx, cy, R + 3, 5, 1.4, C['pen-2'], .45 + .25 * Math.sin(performance.now() / 180));
  // Blackout: the outer 40% of the scope is shrouded unless a ping is showing`);
rep(`  $('#capKills').innerHTML = \`<b>\${G.kills}</b> destroyed\`;`, `  $('#capKills').innerHTML = \`<b>\${G.kills}</b> destroyed · \${G.inFlow ? '<b style="color:var(--pen-2)">FLOW</b>' : 'flow'} \${dotBar(G.flow, 8, 'var(--pen-2)', 1.6)}\`;`);
rep(`  dive:    p =>`, `  flow:    () => [440, 554, 659, 880, 1109].forEach((f, i) => tone('triangle', f, f, .9, .04, i * .05, { wet: .8, attack: .03 })),
  parry:   p => { tone('square', 1800, 900, .12, .05, 0, { pan: p, filter: 'bandpass', ff: 2200, q: 3 }); tone('triangle', 660, 1320, .25, .06, .04, { pan: p, wet: .6 }); },
  dive:    p =>`);

// ---- parry: typing out a fresh shot fires it back into the leviathan
rep(`  const extra = { speed: o.speed ?? wordSpeed(G.level), trait, shot: !!o.shot };`, `  const extra = { speed: o.speed ?? wordSpeed(G.level), trait, shot: !!o.shot, born: G.t };`);
rep(`  if (how === 'type' && G.mods.pierce) pierceFrom(p, w);`, `  if (how === 'type' && G.mods.pierce) pierceFrom(p, w);
  if (how === 'type' && w.shot && G.boss && live(G.boss) && G.t - w.born <= 1.1) parry(p);`);
rep(`function regrowPlate() {`, `function parry(p) {
  const b = G.boss, q = letterPos(b, b.text.length - 1);
  G.stats.parries = (G.stats.parries || 0) + 1;
  const pts = addPoints(120 * bonusScale(), 'bonus');
  G.tracers.push({ w: b, parry: true, idx: b.text.length - 1, layerNo: b.layerNo, sx: p.x, sy: p.y, tx: q.x, ty: q.y, kick: .12, t: 0, dur: .3, ch: b.text[b.text.length - 1] });
  G.fx.push({ k: 'stamp', x: p.x, y: p.y + 26, text: \`PARRIED +\${pts}\`, col: C['pen-2'], life: 1.2, max: 1.2, big: true });
  sfx.parry(panAt(p.x)); tip('parry');
}
function regrowPlate() {`);
rep(`  if (tr.pierce) { stripTail(w, 1, C['pen-2'], 'torp'); ripple(tr.tx, tr.ty, 3, 300, .5); sfx.hit(panAt(tr.tx)); return; }`,
    `  if (tr.pierce) { stripTail(w, 1, C['pen-2'], 'torp'); ripple(tr.tx, tr.ty, 3, 300, .5); sfx.hit(panAt(tr.tx)); return; }
  if (tr.parry) { w.stunT = .9; stripTail(w, 3, C['pen-2'], 'torp'); ripple(tr.tx, tr.ty, 9, 400, .9); bump(6); sfx.torpHit(panAt(tr.tx)); return; }`);

// ---- the ghost of your best run: its score curve beside yours, and the gap between you
rep(`  dotCols($('#cvKills'), G.kills5, C['pen-2']);`, `  if (G.ghost) {
    const ga = ghostAt(), d = Math.round(G.points - ga);
    $('#mBest').innerHTML = \`ghost <b style="color:\${d >= 0 ? 'var(--pen-2)' : 'var(--pen-1)'}">\${d >= 0 ? '+' : '−'}\${fmtPts(Math.abs(d))}</b>\`;
    drawGhost($('#cvKills'));
  } else dotCols($('#cvKills'), G.kills5, C['pen-2']);`);
rep(`function flashUnit(id, cls, ms) {`, `// where the ghost (your best run at this mode and level) was at this moment
function ghostAt(t = G.t) {
  const tr = G.ghost.trace, i = t / 5, a = Math.floor(i);
  if (a >= tr.length - 1) return tr[tr.length - 1];
  return tr[a] + (tr[a + 1] - tr[a]) * (i - a);
}
function drawGhost(el) {
  const { c, w, h } = fitCanvas(el); if (!w) return;
  const g = G.ghost.trace, mine = [...G.trace, G.points], T = Math.max(g.length - 1, G.t / 5, 1), top = Math.max(1, ...g, G.points);
  const X = i => 2 + i / T * (w - 4), Y = v => h - 2 - v / top * (h - 4);
  c.globalAlpha = .9; c.fillStyle = C['ink-3']; c.beginPath();
  g.forEach((v, i) => dotPath(c, X(i), Y(v), .9)); c.fill();
  c.strokeStyle = C['pen-2']; c.lineWidth = 1.6; c.globalAlpha = 1; c.beginPath();
  mine.forEach((v, i) => { const x = i === mine.length - 1 ? X(G.t / 5) : X(i); i ? c.lineTo(x, Y(v)) : c.moveTo(x, Y(v)); }); c.stroke();
  c.fillStyle = C['pen-2']; c.beginPath(); dotPath(c, X(G.t / 5), Y(G.points), 2.2); c.fill();
}
function flashUnit(id, cls, ms) {`);
rep(`  if (G.game === 'descent' && G.mode === 'play') prefs.deepest[G.diff]`, `  // a new best becomes the ghost for the next run at this mode and level
  const ghostBeat = !!G.ghost && G.points > G.ghost.pts;
  if (!daily && G.mode === 'play' && G.points > 0 && (!prefs.ghosts[G.game + ':' + G.diff] || G.points > prefs.ghosts[G.game + ':' + G.diff].pts))
    prefs.ghosts[G.game + ':' + G.diff] = { pts: G.points, trace: [...G.trace, G.points].slice(0, 240), at: Date.now() };
  if (G.game === 'descent' && G.mode === 'play') prefs.deepest[G.diff]`);
fs.writeFileSync(f, s); console.log('ok');
