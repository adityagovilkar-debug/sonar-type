// Phase 3, part 1: hull abilities (key 1), hull mastery (levels, perks, trims)
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- the data
rep(`const phaseDelay = () => G.mods.forge ? 4 : 8;`, `// each hull's active ability, on the 1 key; mastery level 5 makes it stronger
const ABILITIES = {
  skiff:   { name: 'Breath', cd: 16, blurb: 'Time slows to a crawl for a moment (1.5 s).', up: 'Breath recharges a quarter faster.' },
  bastion: { name: 'Brace', cd: 20, blurb: 'The next hit within 6 s is stopped completely.', up: 'Brace stops two hits.' },
  wraith:  { name: 'Phase out', cd: 28, blurb: 'For 2.5 s nothing that reaches the hull can hurt it (a leviathan still can).', up: 'Phase out lasts 3.5 s.' },
  lancer:  { name: 'Overdrive', cd: 24, blurb: 'For 5 s tracers land instantly and typed words score ×1.5.', up: 'Overdrive lasts 7 s.' },
  choir:   { name: 'Chorus', cd: 20, blurb: 'A ping of its own that also slows every contact to half speed for 3 s.', up: 'Chorus slows contacts to 30%.' },
};
// mastery: words destroyed with a hull. Level 2 and 4 add trim colours, 3 a perk, 5 a stronger ability
const MASTERY = [0, 150, 450, 1000, 1800];
const PERKS = {
  skiff: 'Lucky: the first miss of every wave is forgiven.',
  bastion: 'Riveted: one iron plate regrows with every wave.',
  wraith: 'Quick phase: the phase shield recharges sooner and faster.',
  lancer: 'Loaded: starts every run with an extra torpedo.',
  choir: 'Long ears: a ping shows everything for 6 s instead of 4.',
};
const masteryXp = h => (prefs.mastery[h] || 0);
const masteryLv = h => { let l = 1; while (l < MASTERY.length && masteryXp(h) >= MASTERY[l]) l++; return l; };
const hullLv = () => G.mode === 'play' ? masteryLv(G.hullType) : 1;
const perk = h => G.hullType === h && hullLv() >= 3;
const trimOf = h => { const l = masteryLv(h); return l >= 4 ? C['pen-4'] : l >= 2 ? C['pen-2'] : null; };
const abilityCd = () => ABILITIES[G.hullType].cd * (G.hullType === 'skiff' && hullLv() >= 5 ? .75 : 1);
function useAbility() {
  if (G.abilCd > 0 || calmGame() || G.mode !== 'play') return;
  const k = G.hullType, up = hullLv() >= 5, a = ABILITIES[k];
  G.abilCd = abilityCd(); G.stats.abilities = (G.stats.abilities || 0) + 1;
  if (k === 'skiff') { G.breathT = 1.5; for (let i = 0; i < 2; i++) G.fx.push({ k: 'dring', x: S.cx, y: S.cy, r0: S.R, r1: 40, n: 110, col: C['ink-2'], life: .6, max: .6, delay: i * .12 }); sfx.breath(); }
  else if (k === 'bastion') { G.brace = up ? 2 : 1; G.braceT = 6; G.fx.push({ k: 'dring', x: S.cx, y: S.cy, r0: 30, r1: 70, n: 48, col: C['ink-2'], life: .5, max: .5 }); sfx.forge(); }
  else if (k === 'wraith') { G.phaseOutT = up ? 3.5 : 2.5; G.fx.push({ k: 'dring', x: S.cx, y: S.cy, r0: 20, r1: 90, n: 72, col: C['pen-3'], life: .7, max: .7 }); sfx.pop(); }
  else if (k === 'lancer') { G.overT = up ? 7 : 5; G.fx.push({ k: 'dring', x: S.cx, y: S.cy, r0: 20, r1: S.R * .6, n: 72, col: C['pen-2'], life: .5, max: .5 }); sfx.ready(); }
  else if (k === 'choir') { G.chorusT = 3; G.chorusSlow = up ? .3 : .5; usePing(true); }
  coreStamp(a.name.toUpperCase(), C['pen-2'], 1.2);
  G.last = a.name.toLowerCase();
}
const phaseDelay = () => (G.mods.forge ? 4 : 8) * (perk('wraith') ? .6 : 1);`);
rep(`  if (ph.on && ph.charge < PHASE_MAX && G.t - ph.lastHit > phaseDelay()) ph.charge = Math.min(PHASE_MAX, ph.charge + (G.mods.forge ? 10 : 5) * dt);`,
    `  if (ph.on && ph.charge < PHASE_MAX && G.t - ph.lastHit > phaseDelay()) ph.charge = Math.min(PHASE_MAX, ph.charge + (G.mods.forge ? 10 : 5) * (perk('wraith') ? 1.4 : 1) * dt);
  // hull abilities and their timers
  G.abilCd = Math.max(0, (G.abilCd || 0) - dt); G.breathT = Math.max(0, (G.breathT || 0) - dt); G.phaseOutT = Math.max(0, (G.phaseOutT || 0) - dt);
  G.overT = Math.max(0, (G.overT || 0) - dt); G.chorusT = Math.max(0, (G.chorusT || 0) - dt);
  if (G.braceT > 0) { G.braceT -= dt; if (G.braceT <= 0) G.brace = 0; }`);
rep(`  const slow = G.freezeT > 0 ? .2 : G.slowT > 0 ? .45 : 1, alert = G.alertT > 0 ? 1.3 : 1;`,
    `  const slow = G.breathT > 0 ? .25 : G.freezeT > 0 ? .2 : G.chorusT > 0 ? G.chorusSlow || .5 : G.slowT > 0 ? .45 : 1, alert = G.alertT > 0 ? 1.3 : 1;`);
// abilities: a ping of the Choir's own does not touch the normal ping's cooldown; Long ears lengthens every ping
rep(`function usePing() {`, `function usePing(chorus) {`);
rep(`  G.pingCd = pingCooldown(); G.pingT = PING_SHOW;`, `  if (!chorus) G.pingCd = pingCooldown();
  G.pingT = perk('choir') ? 6 : PING_SHOW;`);
rep(`function usePing(chorus) {
  if (G.pingCd > 0) return;`, `function usePing(chorus) {
  if (G.pingCd > 0 && !chorus) return;`);
// Overdrive: instant tracers and ×1.5 for typed words
rep(`dur: (.12 + w.dist / 2800) * (straight ? .6 : 1), ch: w.text[idx] });`, `dur: (.12 + w.dist / 2800) * (straight ? .6 : 1) * (G.overT > 0 ? .12 : 1), ch: w.text[idx] });`);
rep(`  const b = wordBase(w) * mul * (G.pingT > 0 && G.kit.pingBonus ? 1 + G.kit.pingBonus : 1),`, `  const b = wordBase(w) * mul * (G.pingT > 0 && G.kit.pingBonus ? 1 + G.kit.pingBonus : 1) * (G.overT > 0 ? 1.5 : 1),`);
// Brace and Phase out at the hull
rep(`  let dmg = hitDamage(w), by = 'hull';
  if (G.iron[pi]) {`, `  let dmg = hitDamage(w), by = 'hull';
  if (G.phaseOutT > 0) {
    // phased out: it passes straight through
    burstLetters(w, C['pen-3']); G.fx.push({ k: 'stamp', x: p.x, y: p.y - 22, text: 'PHASED', col: C['pen-3'], life: .9, max: .9 }); sfx.chime(panAt(p.x));
    G.last = \`\${shown(w)} passed through\`; return;
  }
  if (G.brace > 0) {
    G.brace--; dmg = 0; by = 'brace';
    G.fx.push({ k: 'dring', x: S.cx, y: S.cy, r0: 40, r1: 90, n: 48, col: C['ink-2'], life: .5, max: .5 }); sfx.clang(panAt(p.x)); bump(5);
  } else if (G.iron[pi]) {`);
rep(`    G.last = \`\${shown(w)} stopped by \${by === 'iron' ? 'iron' : 'phase'}\`;`, `    G.last = \`\${shown(w)} stopped by \${by === 'iron' ? 'iron' : by === 'brace' ? 'the brace' : 'phase'}\`;`);
// perks: Lucky (Skiff), Riveted (Bastion), Loaded (Lancer)
rep(`  if (G.mods.keeper && G.forgive > 0) {
    G.forgive--;`, `  if ((G.mods.keeper && G.forgive > 0) || G.luck > 0) {
    if (G.luck > 0) G.luck--; else G.forgive--;`);
rep(`function newWaveMods() {`, `function newWaveMods() {
  if (perk('skiff')) G.luck = 1;
  if (perk('bastion')) regrowPlate();`);
rep(`  if (h.torp && !G.press.bare) G.arsenal.torp = h.torp;`, `  if (h.torp && !G.press.bare) G.arsenal.torp = h.torp;
  G.abilCd = 0; G.breathT = G.phaseOutT = G.overT = G.chorusT = G.braceT = 0; G.brace = 0;
  G.luck = mode === 'play' && hk === 'skiff' && masteryLv('skiff') >= 3 ? 1 : 0;
  if (mode === 'play' && hk === 'lancer' && masteryLv('lancer') >= 3 && !G.press.bare) G.arsenal.torp = Math.min(3, G.arsenal.torp + 1);`);
// mastery XP is banked at the end of a run
rep(`  if (zen) prefs.life.zen = (prefs.life.zen || 0) + Math.round(G.t);`, `  if (zen) prefs.life.zen = (prefs.life.zen || 0) + Math.round(G.t);
  const mLvBefore = masteryLv(G.hullType);
  prefs.mastery[G.hullType] = masteryXp(G.hullType) + G.kills;
  const mLvNow = masteryLv(G.hullType);
  prefs.life.abilities = (prefs.life.abilities || 0) + (G.stats.abilities || 0);`);
rep(`    + (promoted ? r('var(--pen-2)', 'Promoted', \`<b>\${promoted}</b>\`) : '')`, `    + (promoted ? r('var(--pen-2)', 'Promoted', \`<b>\${promoted}</b>\`) : '')
    + r('var(--pen-2)', \`\${HULLS[G.hullType].name} mastery\`, \`+\${G.kills} <small class="u">\${mLvNow > mLvBefore ? \`<b style="color:var(--pen-2)">level \${mLvNow}!</b> \${mLvNow === 3 ? 'perk unlocked' : mLvNow === 5 ? 'ability upgraded' : 'new trim'}\` : \`level \${mLvNow}\${mLvNow < 5 ? \` · \${MASTERY[mLvNow] - masteryXp(G.hullType)} to the next\` : ''}\`}</small>\`)`);
rep(`prefs.catRecent = Array.isArray(prefs.catRecent) ? prefs.catRecent : [];`, `prefs.catRecent = Array.isArray(prefs.catRecent) ? prefs.catRecent : [];
// v4.5: hull mastery (words destroyed with each hull), the best run's score trace per mode and level, expedition tiers
prefs.mastery = Object.assign({}, prefs.mastery);
prefs.ghosts = Object.assign({}, prefs.ghosts);
prefs.expTier = prefs.expTier | 0; prefs.expTierSel = prefs.expTierSel | 0;`);
// keys and the HUD row
rep(`    if (e.key === '/') { e.preventDefault(); if (!e.repeat) usePing(); return; }`, `    if (e.key === '/') { e.preventDefault(); if (!e.repeat) usePing(); return; }
    if (e.key === '1') { e.preventDefault(); if (!e.repeat) useAbility(); return; }`);
rep(`      <div class="wrow" id="wNuke" style="--pen:var(--pen-1)"><span class="wn">Nuke</span><kbd>hold ⏎</kbd><span class="wc"></span></div>`,
    `      <div class="wrow" id="wNuke" style="--pen:var(--pen-1)"><span class="wn">Nuke</span><kbd>hold ⏎</kbd><span class="wc"></span></div>
      <div class="wrow" id="wAbil" style="--pen:var(--pen-2)"><span class="wn">Ability</span><kbd>1</kbd><span class="wc"></span></div>`);
rep(`  row('#wNuke', G.arsenal.nuke, 1, off || (G.arm > 0 ? \`arming \${Math.round(G.arm * 100)}%\` : ''));`, `  row('#wNuke', G.arsenal.nuke, 1, off || (G.arm > 0 ? \`arming \${Math.round(G.arm * 100)}%\` : ''));
  {
    const el = $('#wAbil'), a = ABILITIES[G.hullType], live = G.breathT || G.phaseOutT || G.overT || G.chorusT || (G.brace > 0 ? G.braceT : 0);
    el.querySelector('.wn').textContent = a.name;
    el.classList.toggle('ready', !G.abilCd && !calmGame()); el.classList.toggle('active', !!live);
    el.querySelector('.wc').textContent = calmGame() ? 'off' : live ? \`\${live.toFixed(1)} s\` : G.abilCd ? \`\${Math.ceil(G.abilCd)} s\` : 'ready';
  }`);
rep(`const hint = screen === 'play' ? '<kbd>/</kbd> ping <kbd>Space</kbd> pulse <kbd>Tab</kbd> torpedo <kbd>hold ⏎</kbd> nuke <kbd>⌫</kbd> drop lock <kbd>Esc</kbd> pause'`,
    `const hint = screen === 'play' ? '<kbd>/</kbd> ping <kbd>Space</kbd> pulse <kbd>Tab</kbd> torpedo <kbd>hold ⏎</kbd> nuke <kbd>1</kbd> ability <kbd>⌫</kbd> drop lock <kbd>Esc</kbd> pause'`);
// trims on the hull
rep(`  drawHull(c, cx, cy, G.hullType, 1, { low, aim: G.aimS });`, `  drawHull(c, cx, cy, G.hullType, 1, { low, aim: G.aimS, trim: G.mode === 'play' ? trimOf(G.hullType) : null });
  if (G.phaseOutT > 0 || G.brace > 0) {
    // phased out: a shimmer around the hull; braced: a heavy ring
    c.globalAlpha = G.phaseOutT > 0 ? .5 + .3 * Math.sin(performance.now() / 60) : .8; c.strokeStyle = G.phaseOutT > 0 ? C['pen-3'] : C['ink-2'];
    c.lineWidth = G.phaseOutT > 0 ? 1.5 : 3; c.beginPath(); c.arc(cx, cy, G.phaseOutT > 0 ? 30 : 52, 0, TAU); c.stroke(); c.globalAlpha = 1;
  }`);
rep(`  c.restore();
}
// where card modules sit around the hull, in the order they were taken`, `  c.restore();
  if (o.trim) { c.save(); c.globalAlpha = .9; c.strokeStyle = o.trim; c.lineWidth = 1.3; c.beginPath(); c.arc(x, y, 21 * s, 0, TAU); c.stroke(); c.restore(); }
}
// where card modules sit around the hull, in the order they were taken`);
// the Dry Dock's hull cards: ability, perk and mastery
rep(`  const blurb = base.blurb || (base.from ? \`The \${HULLS[base.from].name}’s own tracer.\` : \`Earned: \${base.req}.\`);`,
    `  let blurb = base.blurb || (base.from ? \`The \${HULLS[base.from].name}’s own tracer.\` : \`Earned: \${base.req}.\`);
  if (it.kind === 'hull') {
    const lv = masteryLv(it.key), ab = ABILITIES[it.key];
    blurb += \`<span class="mast"><b>\${ab.name}</b> (key 1): \${ab.blurb}</span><span class="mast">Mastery <b>\${lv}</b>/5 \${dotBar((lv - 1) / 4, 4, 'var(--pen-2)', 2)} \${lv < 5 ? \`\${MASTERY[lv] - masteryXp(it.key)} words to level \${lv + 1}\` : 'mastered'}\${lv >= 3 ? \` · \${PERKS[it.key]}\` : ''}</span>\`;
  }`);
rep(`.item.on{border-color:var(--pen-2)}`, `.item.on{border-color:var(--pen-2)}
.item .mast{display:block;margin-top:5px;font-size:10px;color:var(--ink-3)}
.item .mast b{color:var(--ink-2)}`);
rep(`  dive:    p =>`, `  breath:  () => { tone('sine', 420, 140, 1.4, .08, 0, { wet: .9, attack: .1 }); noise(1.2, .05, 900, 0, 'lowpass', { f1: 200, wet: .7 }); },
  dive:    p =>`);
fs.writeFileSync(f, s); console.log('ok');
