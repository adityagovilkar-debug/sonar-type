// Phase 2, part 1: six new kinds of contact (krill, mimic, diver, warden, fading, ally) and the daily dive's seeded RNG
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- trait table: five new traits (allies are spawned separately)
rep(`  ['mine', 4, .03, .006], ['decoy', 4, .03, .006], ['reversed', 6, .03, .008], ['cased', 8, .04, .012],`,
    `  ['mine', 4, .03, .006], ['decoy', 4, .03, .006], ['reversed', 6, .03, .008], ['cased', 8, .04, .012],
  ['krill', 4, .03, .006], ['mimic', 5, .03, .008], ['diver', 5, .03, .008], ['warden', 6, .025, .006], ['fading', 7, .03, .008],`);
rep(`reversed: 'REVERSED ←', cased: 'EXACT' };`, `reversed: 'REVERSED ←', cased: 'EXACT', krill: 'KRILL', mimic: 'MIMIC', diver: 'DIVER', warden: 'WARDEN', fading: 'FADING' };`);
rep(`const TRAIT_WORK = { armour: 1, splitter: .9, silent: .35, mine: 0, decoy: .4, reversed: .5, cased: .35 };`,
    `const TRAIT_WORK = { armour: 1, splitter: .9, silent: .35, mine: 0, decoy: .4, reversed: .5, cased: .35, krill: .9, mimic: .3, diver: .35, warden: .4, fading: .3 };`);
rep(`const TRAIT_PTS = { reversed: 1.5, cased: 1.4, silent: 1.3, splitter: 1.1 };`, `const TRAIT_PTS = { reversed: 1.5, cased: 1.4, silent: 1.3, splitter: 1.1, mimic: 1.3, diver: 1.3, warden: 1.2, fading: 1.4 };`);
// daily-dive modifiers lean the trait roll; Twilight water adds silent contacts
rep(`function rollTrait(lv) {
  if (G.game === 'drill') return null;`, `function rollTrait(lv) {
  if (G.game === 'drill') return null;
  const mod = G.daily && G.daily.mod;
  if (mod === 'mirror' && lv >= 3 && R() < .2) return 'reversed';
  if (mod === 'krill' && R() < .12) return 'krill';
  if (zoneOf().silent && R() < .15) return 'silent';`);
rep(`function rollTrait(lv) {`, `// the daily dive draws its words, bearings and traits from a generator seeded by the date
function mulberry(seed) {
  return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const R = () => G.rng ? G.rng() : Math.random();
function rollTrait(lv) {`);
rep(`  for (const [name, p] of traitOdds(lv)) { r -= p; if (r < 0) return name; }`, `  for (const [name, p] of traitOdds(lv)) { r -= p; if (r < 0) return name; }`);
rep(`function rollTrait(lv) {
  if (G.game === 'drill') return null;
  const mod = G.daily && G.daily.mod;
  if (mod === 'mirror' && lv >= 3 && R() < .2) return 'reversed';
  if (mod === 'krill' && R() < .12) return 'krill';
  if (zoneOf().silent && R() < .15) return 'silent';
  let r = Math.random();`, `function rollTrait(lv) {
  if (G.game === 'drill') return null;
  const mod = G.daily && G.daily.mod;
  if (mod === 'mirror' && lv >= 3 && R() < .2) return 'reversed';
  if (mod === 'krill' && R() < .12) return 'krill';
  if (zoneOf().silent && R() < .15) return 'silent';
  let r = R();`);
// seeded picks
rep(`  let ang = Math.random() * TAU, best = -1;
  for (let k = 0; k < 16; k++) {
    const cand = Math.random() * TAU;`, `  let ang = R() * TAU, best = -1;
  for (let k = 0; k < 16; k++) {
    const cand = R() * TAU;`);
rep(`  for (let k = 0; k < 40 && cands.length < want; k++) { const c = pick(pool); if (ok(c) && !cands.includes(c)) cands.push(c); }`,
    `  for (let k = 0; k < 40 && cands.length < want; k++) { const c = pool[Math.floor(R() * pool.length)]; if (ok(c) && !cands.includes(c)) cands.push(c); }`);
rep(`  let r = Math.random() * wts.reduce((a, b) => a + b, 0), i = 0;
  while (r > wts[i] && i < cands.length - 1) { r -= wts[i]; i++; }
  return cands[i];`, `  let r = R() * wts.reduce((a, b) => a + b, 0), i = 0;
  while (r > wts[i] && i < cands.length - 1) { r -= wts[i]; i++; }
  return cands[i];`);
rep(`  const wts = LEVEL_WEIGHTS[Math.min(G.level, 12) - 1];
  let r = Math.random(), tier = 0, acc = 0;`, `  const wts = LEVEL_WEIGHTS[Math.min(G.level, 12) - 1];
  let r = R(), tier = 0, acc = 0;`);
// relics: four times as common on a Relic-tide day
rep(`      && Math.random() < 1 / 75 && !G.words.some(w => w.relic)) return spawnRelic(ang, d);`,
    `      && R() < (G.daily && G.daily.mod === 'relics' ? 4 : 1) / 75 && !G.words.some(w => w.relic)) return spawnRelic(ang, d);`);

// ---- spawning krill swarms, and the per-trait set-up of the others
rep(`  const trait = o.trait !== undefined ? o.trait : rollTrait(G.level);
  let text = o.text || (o.tier != null ? pickFromTier(o.tier) : pickWord());`, `  const trait = o.trait !== undefined ? o.trait : rollTrait(G.level);
  if (trait === 'krill' && !o.text) return spawnKrill(ang, d);
  let text = o.text || (o.tier != null ? pickFromTier(o.tier) : pickWord());`);
rep(`  if (trait === 'mine') extra.speed *= .55;`, `  if (trait === 'mine') extra.speed *= .55;
  if (trait === 'warden') extra.speed *= .8;
  if (trait === 'mimic') extra.mimT = 1.2;
  if (trait === 'diver') Object.assign(extra, { diveT: rnd(1.5, 2.5), under: false });`);
rep(`// supply crates drift ACROSS the scope`, `// krill: a tight cloud of single letters, each harmless alone but chipping the hull if it gets through
function spawnKrill(ang, d) {
  const taken = new Set(G.words.filter(w => w.fired < w.text.length).map(w => w.text[w.fired].toLowerCase()));
  const letters = [...'abcdefghijklmnopqrstuvwxyz'].filter(ch => !taken.has(ch)).sort(() => R() - .5);
  const n = Math.min(letters.length, 5 + Math.floor(G.level / 3)), sp = wordSpeed(G.level) * 1.25;
  let first = null;
  for (let i = 0; i < n; i++) {
    const a = ang + (R() - .5) * .36, dd = d + R() * 70;
    const w = mk('enemy', letters[i], Math.cos(a) * dd, Math.sin(a) * dd, { speed: sp * rnd(.9, 1.1), trait: 'krill' });
    G.words.push(w); note('krill', 'seen'); first = first || w;
  }
  tip('krill');
  return first;
}
// allies: friendly subs crossing the scope. Typing one out is friendly fire; letting it pass pays a bonus
function spawnAlly() {
  const a = Math.random() * TAU, d0 = edgeDist(a) + 70, sx = Math.cos(a) * d0, sy = Math.sin(a) * d0;
  const side = Math.random() < .5 ? 1 : -1, off = S.R * rnd(.25, .55);
  const px = -Math.sin(a) * side * off, py = Math.cos(a) * side * off, n = Math.hypot(px - sx, py - sy), sp = 48;
  const w = mk('ally', pickFromTier(Math.random() < .5 ? 1 : 2), sx, sy, { vx: (px - sx) / n * sp, vy: (py - sy) / n * sp, entered: false });
  G.words.push(w); note('ally', 'seen'); tip('ally');
  return w;
}
function friendlyFire(w) {
  const p = pos(w), dmg = Math.max(6, Math.round(wordDamage(w) * .8));
  remove(w);
  G.hull -= dmg; G.stats.hullDmg += dmg; G.stats.hullHits++; G.combo = 0; G.cleanRun = 0; G.hurt = 1; G.stats.friendly = (G.stats.friendly || 0) + 1;
  burstLetters(w, C['pen-1'], 80); cracks(3);
  G.fx.push({ k: 'dring', x: p.x, y: p.y, r0: 6, r1: 90, n: 40, col: C['pen-1'], life: .7, max: .7 });
  G.fx.push({ k: 'stamp', x: p.x, y: p.y - 26, text: \`FRIENDLY FIRE  -\${dmg} HULL\`, col: C['pen-1'], life: 1.6, max: 1.6, big: true });
  flashUnit('uCore', 'bad', 700); bump(8); sfx.breach();
  G.last = \`friendly fire: \${w.text}\`;
  if (G.hull <= 0) sink('hull');
}
// a mimic keeps changing into another word of the same length until its first letter is typed
const BY_LEN = {};
for (const w of POOLS.flat()) (BY_LEN[w.length] = BY_LEN[w.length] || []).push(w);
function morph(w) {
  const pool = BY_LEN[w.text.length] || [];
  const taken = new Set(G.words.filter(o => o !== w && o.fired < o.text.length).map(o => o.text[o.fired].toLowerCase()));
  for (let k = 0; k < 20; k++) {
    const c = pick(pool);
    if (c && c !== w.text && !taken.has(c[0])) { w.text = c; w.hitT = .2; return; }
  }
}
const WARDEN_R = 120;
// supply crates drift ACROSS the scope`);

// ---- typing rules: wardens shield, divers submerge, allies are typed only as a last resort
rep(`function wants(w, ch) { const n = w.text[w.fired]; return w.cased ? ch === n : ch.toLowerCase() === n.toLowerCase(); }`,
    `function wants(w, ch) {
  if (w.under || w.shielded) return false;
  const n = w.text[w.fired]; return w.cased ? ch === n : ch.toLowerCase() === n.toLowerCase();
}`);
rep(`  else for (const w of G.words) if (w.fired < w.text.length && wants(w, ch) && (!target || w.dist < target.dist)) target = w;
  if (target) { G.lock = target; fire(target); } else miss();`, `  else {
    // an ally is only ever picked when nothing else wants that letter
    for (const w of G.words) if (w.kind !== 'ally' && w.fired < w.text.length && wants(w, ch) && (!target || w.dist < target.dist)) target = w;
    if (!target) for (const w of G.words) if (w.kind === 'ally' && w.fired < w.text.length && wants(w, ch)) target = w;
    if (target && target.kind === 'ally') G.fx.push({ k: 'stamp', x: pos(target).x, y: pos(target).y + 26, text: 'ALLY · BACKSPACE TO STOP', col: C['pen-1'], life: 1.4, max: 1.4 });
  }
  if (target) { G.lock = target; fire(target); } else miss();`);
rep(`      const cur = G.lock, threat = w => w.kind !== 'crate' && w.trait !== 'decoy' && sight(w) !== 'hidden';`,
    `      const cur = G.lock, threat = w => w.kind !== 'crate' && w.kind !== 'ally' && w.trait !== 'decoy' && sight(w) !== 'hidden';`);
rep(`const threats = () => G.words.filter(w => w.kind !== 'crate' && w.trait !== 'decoy');`, `const threats = () => G.words.filter(w => w.kind !== 'crate' && w.kind !== 'ally' && w.trait !== 'decoy' && !w.under);`);
rep(`function complete(w, how) {
  if (w.kind === 'crate') return collect(w);`, `function complete(w, how) {
  if (w.kind === 'crate') return collect(w);
  if (w.kind === 'ally') return friendlyFire(w);`);
rep(`const hitDamage = w => wordDamage(w) * (w.trait === 'mine' ? 2 : 1);`, `const hitDamage = w => w.trait === 'krill' ? Math.max(2, Math.round(3 * dmgScale())) : wordDamage(w) * (w.trait === 'mine' ? 2 : 1);`);
// weapons never touch allies
rep(`      if (!live(w) || w.kind === 'crate' || w.dist > G.nuke.r || w.dist > G.nuke.maxR) continue;`, `      if (!live(w) || w.kind === 'crate' || w.kind === 'ally' || w.dist > G.nuke.r || w.dist > G.nuke.maxR) continue;`);
rep(`    if (o.kind === 'crate' || !live(o)) continue;
    const q = pos(o);
    if (Math.hypot(q.x - p.x, q.y - p.y) > mineR()) continue;`, `    if (o.kind === 'crate' || o.kind === 'ally' || !live(o)) continue;
    const q = pos(o);
    if (Math.hypot(q.x - p.x, q.y - p.y) > mineR()) continue;`);

// ---- sight: submerged divers and dark water
rep(`function sight(w) {
  if (pinging() || w.dist < S.R * (G.mods.sweep ? .45 : .3)) return 'clear';`, `function sight(w) {
  if (w.under) return 'hidden';
  if (pinging() || w.dist < S.R * (G.mods.sweep ? .45 : .3)) return 'clear';`);
rep(`  if (w.silent) return w.echo > .02 ? 'echo' : 'hidden';
  return 'clear';
}`, `  if (w.silent || (darkWater() && w.kind !== 'crate' && w.kind !== 'ally')) return w.echo > .02 ? 'echo' : 'hidden';
  return 'clear';
}`);

// ---- the update loop: allies drift across, mimics morph, divers dive, wardens shield, dark water leaves echoes
rep(`    } else if (w.kind === 'crate') {
      const mg = G.mods.magnet ? .6 : 1;
      w.rx += w.vx * dt * slow * mg; w.ry += w.vy * dt * slow * mg;
      const inside = Math.abs(w.rx) < S.w / 2 - 20 && Math.abs(w.ry) < S.h / 2 - 20;
      if (inside) w.entered = true;
      else if (w.entered && (Math.abs(w.rx) > S.w / 2 + 90 || Math.abs(w.ry) > S.h / 2 + 90)) { remove(w); G.last = \`supply lost: \${w.ctype}\`; continue; }`,
`    } else if (w.kind === 'crate' || w.kind === 'ally') {
      const mg = G.mods.magnet && w.kind === 'crate' ? .6 : 1;
      w.rx += w.vx * dt * slow * mg; w.ry += w.vy * dt * slow * mg;
      const inside = Math.abs(w.rx) < S.w / 2 - 20 && Math.abs(w.ry) < S.h / 2 - 20;
      if (inside) w.entered = true;
      else if (w.entered && (Math.abs(w.rx) > S.w / 2 + 90 || Math.abs(w.ry) > S.h / 2 + 90)) {
        remove(w);
        if (w.kind === 'ally') allyEscorted(w); else G.last = \`supply lost: \${w.ctype}\`;
        continue;
      }`);
rep(`      const bm = w.kind === 'boss' ? bossMove(w, dt) : G.songT > 0 ? 1.5 : 1;`, `      const bm = (w.kind === 'boss' ? bossMove(w, dt) : G.songT > 0 ? 1.5 : 1) * (w.under ? 1.7 : 1);`);
rep(`    w.hitT = Math.max(0, w.hitT - dt); w.missT = Math.max(0, w.missT - dt);
    if (w.silent) w.echo`, `    w.hitT = Math.max(0, w.hitT - dt); w.missT = Math.max(0, w.missT - dt);
    if (w.trait === 'mimic' && w.fired === 0 && w.dist < S.R * 1.02) { w.mimT -= dt; if (w.mimT <= 0) { w.mimT = 1.2; morph(w); } }
    if (w.trait === 'diver') diverTick(w, dt);
    if (w.silent || darkWater()) w.echo`);
rep(`      if (w.silent) { w.echo = 1; w.ex = w.rx; w.ey = w.ry; }
      if (!inStorm(w)) {`, `      if (w.silent || darkWater()) { w.echo = 1; w.ex = w.rx; w.ey = w.ry; }
      if (!inStorm(w) && !w.under) {`);
rep(`  for (const tr of G.tracers) {
    if (live(tr.w) && tr.layerNo === tr.w.layerNo) {`, `  shieldTick();
  for (const tr of G.tracers) {
    if (live(tr.w) && tr.layerNo === tr.w.layerNo) {`);
rep(`function friendlyFire(w) {`, `function allyEscorted(w) {
  if (G.mode !== 'play') return;
  const pts = addPoints(60 + 15 * G.level, 'bonus');
  note('ally', 'kills'); G.stats.escorts = (G.stats.escorts || 0) + 1;
  coreStamp(\`ALLY ESCORTED · +\${pts}\`, C['pen-2'], 1.4);
  G.last = \`ally escorted: \${w.text}\`;
}
// divers surface for a few seconds, then go under (hidden, untypeable, faster) and come up somewhere closer
function diverTick(w, dt) {
  if (w.fired > 0 && !w.under) return;
  w.diveT -= dt;
  if (w.under) {
    if (Math.random() < dt * 6) bubbles(pos(w).x, pos(w).y, 1, 10);
    if (w.diveT <= 0) { w.under = false; w.diveT = rnd(2.4, 3.2); const p = pos(w); ripple(p.x, p.y, 5, 300, .7); G.fx.push({ k: 'ring', x: p.x, y: p.y, r0: 4, r1: 30, col: C['pen-3'], life: .5, max: .5 }); }
  } else if (w.diveT <= 0 && w.dist < S.R * .9 && w.dist > S.R * .35) {
    w.under = true; w.diveT = rnd(1.4, 2); if (G.lock === w) G.lock = null;
    const p = pos(w); bubbles(p.x, p.y, 8, 14); sfx.dive(panAt(p.x));
  }
}
// a warden's ring shields every other untouched word inside it from typing until the warden is destroyed
function shieldTick() {
  const wardens = G.words.filter(w => w.trait === 'warden');
  for (const w of G.words) {
    w.shielded = w.kind !== 'boss' && w.kind !== 'crate' && w.kind !== 'ally' && w.fired === 0
      && wardens.some(o => o !== w && Math.hypot(o.rx - w.rx, o.ry - w.ry) < WARDEN_R);
  }
}
function friendlyFire(w) {`);

// ---- spawning allies (from threat level 3, never in a drill)
rep(`  // speed: pulse halves it, freeze holds it at a fifth,`, `  G.allyT = (G.allyT ?? rnd(15, 25)) - dt;
  if (G.allyT <= 0) {
    G.allyT = G.daily && G.daily.mod === 'convoy' ? rnd(9, 14) : rnd(28, 45);
    if (G.level >= 3 && G.game !== 'drill' && !G.spawnHold && G.words.filter(w => w.kind === 'ally').length < 2) spawnAlly();
  }
  // speed: pulse halves it, freeze holds it at a fifth,`);

// ---- drawing: allies, krill, mimics, divers, wardens, fading words
rep(`  const accent = crate ? (w.ctype === 'nuke' ? C['pen-1'] : C['pen-4']) : w.relic ? C['pen-4']`, `  const ally = w.kind === 'ally', krill = w.trait === 'krill';
  const accent = crate ? (w.ctype === 'nuke' ? C['pen-1'] : C['pen-4']) : ally ? C['pen-2'] : w.relic ? C['pen-4']`);
rep(`    c.strokeStyle = w.relic ? C['pen-4'] : w.shot ? C['pen-1']`, `    c.strokeStyle = ally ? C['pen-2'] : w.trait === 'warden' ? C['pen-3'] : w.relic ? C['pen-4'] : w.shot ? C['pen-1']`);
rep(`    c.lineWidth = boss ? 2 : w.relic ? 1.8 : rev || w.shot ? 1.6 : 1; c.strokeRect(x, y, chipW, chipH);`,
    `    c.lineWidth = boss ? 2 : w.relic || ally || w.trait === 'warden' ? 1.8 : rev || w.shot ? 1.6 : 1; c.strokeRect(x, y, chipW, chipH);`);
rep(`  if (w.relic) {
    // a relic: gold frame,`, `  if (ally) {
    // an ally: a blue "ALLY" flag on its left; never fire on it
    c.globalAlpha = mul; c.fillStyle = C['pen-2']; c.fillRect(x - 34, p.y - 7, 28, 14);
    c.fillStyle = C.paper; c.font = \`700 8.5px \${MONO}\`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ALLY', x - 20, p.y + .5);
  }
  if (w.trait === 'warden' && !legend) {
    // the warden's shield ring
    dottedCircle(c, p.x, p.y, WARDEN_R, 6, 1, C['pen-3'], .5 * mul);
  }
  if (w.trait === 'warden') {
    c.globalAlpha = mul; c.strokeStyle = C['pen-3']; c.lineWidth = 1; c.strokeRect(x - 3.5, y - 3.5, chipW + 7, chipH + 7);
  }
  if (w.shielded && !legend) {
    // shielded: a teal padlock, and the letters dimmed until the warden falls
    const lx = x + chipW + 7, ly = p.y;
    c.globalAlpha = mul; c.strokeStyle = C['pen-3']; c.lineWidth = 1.3;
    c.beginPath(); c.arc(lx + 4, ly - 2, 3, Math.PI, 0); c.stroke(); c.fillStyle = C['pen-3']; c.fillRect(lx, ly - 2, 8, 6.5);
  }
  if (w.trait === 'mimic' && w.fired === 0) {
    // a mimic shimmers while it is still changing
    c.globalAlpha = mul * (.4 + .4 * Math.sin(performance.now() / 70)); c.strokeStyle = C['pen-5']; c.lineWidth = 1; c.setLineDash([3, 3]);
    c.strokeRect(x - 3, y - 3, chipW + 6, chipH + 6); c.setLineDash([]); c.globalAlpha = mul;
  }
  if (w.relic) {
    // a relic: gold frame,`);
rep(`    if (i < w.fired) c.fillStyle = C['ink-3'];
    else if (next && (isLock || rev))`, `    // fading words lose their untyped letters as they close in (a ping shows them again); shielded ones are dimmed
    c.globalAlpha = mul * (i >= w.fired && w.trait === 'fading' && !legend && !pinging() ? clamp((w.dist / S.R - .32) / .26, 0, 1) : 1) * (w.shielded ? .45 : 1);
    if (i < w.fired) c.fillStyle = C['ink-3'];
    else if (next && (isLock || rev))`);
rep(`    else c.fillStyle = crate ? accent : decoy ? C['ink-2'] : C.ink;`, `    else c.fillStyle = crate || ally ? accent : decoy ? C['ink-2'] : C.ink;`);
rep(`  else if (w.relic) { meta = 'RELIC · TYPE IT BY HAND · NO DAMAGE'; mcol = C['pen-4']; }`, `  else if (w.relic) { meta = 'RELIC · TYPE IT BY HAND · NO DAMAGE'; mcol = C['pen-4']; }
  else if (ally) { meta = 'ALLY · DO NOT FIRE · LET IT PASS'; mcol = C['pen-2']; }
  else if (w.shielded) { meta = 'SHIELDED · DESTROY THE WARDEN FIRST'; mcol = C['pen-3']; }`);
rep(`  growl:   p =>`, `  dive:    p => { tone('sine', 300, 90, .5, .08, 0, { pan: p, wet: .6 }); noise(.4, .08, 800, 0, 'lowpass', { pan: p, f1: 200, wet: .5 }); },
  growl:   p =>`);
rep(`    if (w.kind !== 'crate') {
      const stop = (G.iron[plateAt(angOf(w))]`, `    if (w.kind !== 'crate' && w.kind !== 'ally') {
      const stop = (G.iron[plateAt(angOf(w))]`);
fs.writeFileSync(f, s); console.log('ok');
