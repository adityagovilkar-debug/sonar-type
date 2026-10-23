// Phase 3, part 3: expedition tiers, commendations and tips for the new mechanics
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- tiers: each one beaten unlocks the next, which adds one more modifier and pays +20%
rep(`const legType = () =>`, `const TIERS = [
  ['Rough seas', 'every leg is one threat level higher'],
  ['Thin hull', 'the voyage starts with a quarter of the hull gone'],
  ['Hungry deep', 'the leviathan has one more layer'],
  ['Scarce stores', 'no harbour on the chart'],
  ['Fast water', 'every contact moves 10% faster'],
];
const tierText = n => TIERS.slice(0, n).map(t => t[0]).join(' · ');
const legType = () =>`);
rep(`  if (game === 'expedition') { G.exp = makeChart(d); openChart(); return; }`, `  if (game === 'expedition') {
    G.tier = Math.min(prefs.expTierSel, prefs.expTier);
    if (G.tier) { G.pressMul *= 1 + .2 * G.tier; if (G.tier >= 2) G.hull = Math.round(G.hullMax * .75); }
    G.exp = makeChart(d); openChart(); return;
  }`);
rep(`    n.level = clamp(d + Math.floor(col / 2) + (L ? L.lv : 1), 1, 12);`, `    n.level = clamp(d + Math.floor(col / 2) + (L ? L.lv : 1) + (G.tier >= 1 ? 1 : 0), 1, 12);`);
rep(`  const mid = cols[pick([1, 2])]; mid[Math.floor(Math.random() * mid.length)].type = 'harbour';`, `  if (G.tier < 4) { const mid = cols[pick([1, 2])]; mid[Math.floor(Math.random() * mid.length)].type = 'harbour'; }`);
rep(`  const n = Math.max(2, (G.game === 'descent' ? 2 + Math.floor(G.diff / 4) : 3 + Math.floor(G.diff / 2)) - (type === 'ironback' ? 1 : 0));`,
    `  const n = Math.max(2, (G.game === 'descent' ? 2 + Math.floor(G.diff / 4) : 3 + Math.floor(G.diff / 2)) - (type === 'ironback' ? 1 : 0) + (G.game === 'expedition' && G.tier >= 3 ? 1 : 0));`);
rep(`  const pace = (G.press.deep ? 1.15 : 1) * (G.mods.stand && G.hull < 25 ? .8 : 1);`, `  const pace = (G.press.deep ? 1.15 : 1) * (G.mods.stand && G.hull < 25 ? .8 : 1) * (G.game === 'expedition' && G.tier >= 5 ? 1.1 : 1);`);
rep(`  $('#chNo').textContent = e.col < 0 ? \`EXPEDITION · DIFFICULTY \${pad(e.d)}\``, `  $('#chNo').textContent = e.col < 0 ? \`EXPEDITION · DIFFICULTY \${pad(e.d)}\${G.tier ? ' · TIER ' + G.tier : ''}\``);
rep(`  if (exp && kind === 'cleared') prefs.expeditions++;`, `  if (exp && kind === 'cleared') prefs.expeditions++;
  const tierUp = exp && kind === 'cleared' && G.tier >= prefs.expTier && prefs.expTier < TIERS.length;
  if (tierUp) prefs.expTier = G.tier + 1;`);
rep(`    + (promoted ? r('var(--pen-2)', 'Promoted', \`<b>\${promoted}</b>\`) : '')`, `    + (promoted ? r('var(--pen-2)', 'Promoted', \`<b>\${promoted}</b>\`) : '')
    + (tierUp ? r('var(--pen-1)', \`Expedition tier \${prefs.expTier} unlocked\`, \`<b>\${TIERS[prefs.expTier - 1][0]}</b> \${TIERS[prefs.expTier - 1][1]}\`) : '')`);
rep(`  $('#dSub').textContent = \`\${daily ? 'daily dive ' + daily.key : G.game} · difficulty`, `  $('#dSub').textContent = \`\${daily ? 'daily dive ' + daily.key : G.game}\${G.tier ? ' tier ' + G.tier : ''} · difficulty`);
// the title: a tier picker under the pressure switches, for expeditions
rep(`  const mul = pressMulNow();
  $('#pressBar').innerHTML = \`<span class="lbl" style="margin-right:4px">Pressure</span>\``, `  const mul = pressMulNow();
  const tiers = prefs.game === 'expedition' ? \`<span class="lbl" style="margin:0 4px 0 14px">Tier</span>\` + Array.from({ length: prefs.expTier + 1 }, (_, n) =>
    \`<button class="chip \${Math.min(prefs.expTierSel, prefs.expTier) === n ? 'on' : ''}" data-tier="\${n}" title="\${n ? tierText(n) + ' · score and salvage ×' + (1 + .2 * n).toFixed(1) : 'the standard voyage'}">\${n || 'Standard'}</button>\`).join('')
    + (prefs.expTier < TIERS.length ? \`<span class="mult" style="color:var(--ink-3)">complete tier \${prefs.expTier || 'standard'} to unlock \${prefs.expTier + 1}</span>\` : '') : '';
  $('#pressBar').innerHTML = \`<span class="lbl" style="margin-right:4px">Pressure</span>\``);
rep(`  document.querySelectorAll('[data-press]').forEach(b => b.onclick = () => {`, `  if (tiers) $('#pressBar').insertAdjacentHTML('beforeend', tiers);
  document.querySelectorAll('[data-tier]').forEach(b => b.onclick = () => { prefs.expTierSel = +b.dataset.tier; savePrefs(); buildPress(); ensureAudio(); sfx.ui(); });
  document.querySelectorAll('[data-press]').forEach(b => b.onclick = () => {`);
// ---- commendations
rep(`  ['still_water', 'Still water', 'Spend half an hour in Zen in all.', 80, () => (prefs.life.zen || 0) >= 1800],`, `  ['still_water', 'Still water', 'Spend half an hour in Zen in all.', 80, () => (prefs.life.zen || 0) >= 1800],
  ['flow1', 'In the flow', 'Reach a flow state.', 60, r => r.flows >= 1],
  ['flow60', 'Deep flow', 'Stay in flow for a minute in one run.', 150, r => r.flowTime >= 60],
  ['parry5', 'Riposte', 'Parry 5 shots back into a leviathan in one run.', 120, r => r.parries >= 5],
  ['ghost_beat', 'Past self', 'Beat your own ghost.', 80, r => r.ghostBeat],
  ['mastery3', 'Familiar hands', 'Reach mastery level 3 with a hull.', 100, () => Object.keys(HULLS).some(h => masteryLv(h) >= 3)],
  ['mastery5', 'Master of the hull', 'Reach mastery level 5 with a hull.', 300, () => Object.keys(HULLS).some(h => masteryLv(h) >= 5)],
  ['tier3', 'Deep charts', 'Complete an expedition at tier 3.', 250, r => r.cleared && r.game === 'expedition' && r.tier >= 3],
  ['tier5', 'Uncharted', 'Complete an expedition at tier 5.', 500, r => r.cleared && r.game === 'expedition' && r.tier >= 5],
  ['ability25', 'Signature move', 'Use hull abilities 25 times in all.', 60, () => (prefs.life.abilities || 0) >= 25],`);
rep(`    retargets: G.stats.retargets || 0, pressN: Object.keys(G.press).length, cards: G.cards.length });`,
    `    retargets: G.stats.retargets || 0, pressN: Object.keys(G.press).length, cards: G.cards.length,
    flows: G.stats.flows || 0, flowTime: G.flowTime, parries: G.stats.parries || 0, ghostBeat, tier: G.tier });`);
// ---- tips
rep(`  shot:   ['SHOT',`, `  flow:   ['FLOW', 'Fast, clean words filled the flow meter: everything scores ×1.25 until you miss, take a hit, or slow down.'],
  parry:  ['PARRIED', 'Typing a shot out within a second of it being fired sends it back into the leviathan: three letters off and a short stun.'],
  shot:   ['SHOT',`);
fs.writeFileSync(f, s); console.log('ok');
