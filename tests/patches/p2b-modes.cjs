// Phase 2, part 2: Descent (depth zones), Daily dive (seeded, one counted attempt a day) and Zen (no fail)
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- save fields
rep(`prefs.hi = Object.assign({ patrol: {}, sector: {}, expedition: {}, drill: {} }, prefs.hi);`,
    `prefs.hi = Object.assign({ patrol: {}, sector: {}, expedition: {}, drill: {}, descent: {}, zen: {} }, prefs.hi);
// v4.4: deepest dive per difficulty, the daily dives (one counted attempt a day), Descent replaces Patrol on the title
prefs.deepest = Object.assign({}, prefs.deepest);
prefs.daily = Object.assign({}, prefs.daily);
if (prefs.game === 'patrol') prefs.game = 'descent';`);

// ---- the modes' rules
rep(`/* ------------------------------------------------------------ directors */`, `/* ------------------------------------------------------------ Descent, Daily dive, Zen */
// Descent: an endless dive. Every 200 m is a new zone with its own rule; each zone brings an upgrade card
const ZONES = [
  { name: 'Sunlit', blurb: 'bright water: everything shows' },
  { name: 'Twilight', blurb: 'the light fails, and more contacts run silent', silent: true },
  { name: 'Midnight', blurb: 'no light at all: contacts show only as the sweep passes', dark: true },
  { name: 'Abyss', blurb: 'a thermocline that never lifts, and noise storms', abyss: true },
  { name: 'Hadal', blurb: 'leviathans drift past like ordinary contacts', hadal: true },
];
const zoneIndex = () => G.game === 'descent' ? Math.min(ZONES.length - 1, Math.floor((G.depth || 0) / 200)) : -1;
const zoneOf = () => G.game === 'descent' ? ZONES[zoneIndex()] : {};
const darkWater = () => !!zoneOf().dark || !!(G.daily && G.daily.mod === 'dark');
const descentLevel = () => clamp(G.diff + zoneIndex() + (G.depth >= 1000 ? 1 + Math.floor((G.depth - 1000) / 250) : 0), 1, 12);
function descentTick(dt) {
  const z = zoneIndex();
  if (z !== G.zone) enterZone(z);
  G.level = Math.max(G.level, descentLevel());
  G.spawnT -= dt;
  if (G.spawnT <= 0 && !G.spawnHold && enemies() < maxContacts(G.level)) { spawnEnemy(); G.spawnT = spawnInterval(G.level) * workLoad(G.level) * rnd(.75, 1.25); }
  if (zoneOf().abyss) { if (!G.thermo) startThermo(); G.thermoT = 99; }
  // Hadal: a leviathan every 150 m, one at a time
  if (zoneOf().hadal && !G.boss && G.depth >= G.nextBossAt) { spawnBoss(pick(BOSS_KEYS)); G.nextBossAt = G.depth + 150; }
  if (G.boss) {
    bossAct(G.boss, dt);
    if (G.boss) { G.boss.callT -= dt; if (G.boss.callT <= 0) { G.boss.callT = rnd(6, 9); (G.boss.btype === 'siren' ? sfx.sirenCall : sfx.bossCall)(panAt(pos(G.boss).x)); } }
  }
}
function enterZone(z) {
  const first = G.zone == null; G.zone = z;
  if (first) return;
  const Z = ZONES[z];
  banner(\`\${Z.name.toUpperCase()} ZONE · \${Math.floor(G.depth)} M\`, Z.blurb, C.sonar); sfx.wave();
  repair(20);
  if (!Z.abyss) G.thermo = null;
  if (Z.hadal) G.nextBossAt = G.depth + 30;
  if (G.mode === 'play') { G.pickQ++; newWaveMods(); }
}
function dive(m) { if (G.game === 'descent') G.depth += m; }
// Zen: no hull to lose, no weapons, calm water; it ends when you end it (Esc, then E)
function zenTick(dt) {
  G.spawnT -= dt;
  if (G.spawnT <= 0 && enemies() < Math.max(2, maxContacts(G.level) - 1)) { spawnEnemy({ speed: wordSpeed(G.level) * .7 }); G.spawnT = spawnInterval(G.level) * workLoad(G.level) * 1.35 * rnd(.8, 1.2); }
}
const calmGame = () => G.game === 'drill' || G.game === 'zen';
// the Daily dive: one seeded sector a day, with a modifier and a set leviathan; only the first attempt counts
const DAILY_MODS = {
  storm: ['Storm front', 'noise storms and thermoclines all run'],
  relics: ['Relic tide', 'relics surface four times as often'],
  mirror: ['Mirror day', 'reversed words are everywhere'],
  krill: ['Krill bloom', 'swarms of single letters'],
  dark: ['Midnight', 'contacts show only as the sweep passes'],
  convoy: ['Convoy', 'allied subs cross all run: let them pass'],
  deep: ['Deep water', 'everything 15% faster, score ×1.2'],
};
const dayKey = (d = new Date()) => \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`;
function dailyConfig(key = dayKey()) {
  let h = 2166136261;
  for (const ch of 'pelagia' + key) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rng = mulberry(h >>> 0), mods = Object.keys(DAILY_MODS);
  return { key, seed: h >>> 0, diff: 3 + Math.floor(rng() * 4), mod: mods[Math.floor(rng() * mods.length)], boss: BOSS_KEYS[Math.floor(rng() * BOSS_KEYS.length)] };
}
// consecutive days with a counted dive, ending today (or yesterday, if today's is still to come)
function dailyStreak() {
  const d = new Date(); if (!prefs.daily[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0; while (prefs.daily[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
let pendingDaily = null;

/* ------------------------------------------------------------ directors */`);
rep(`if (G.game === 'patrol') patrolTick(dt); else if (G.game === 'drill') drillTick(dt); else sectorTick(dt);`,
    `if (G.game === 'patrol') patrolTick(dt); else if (G.game === 'drill') drillTick(dt); else if (G.game === 'descent') descentTick(dt); else if (G.game === 'zen') zenTick(dt); else sectorTick(dt);`);
rep(`    combo: 0, ripples: [], hurt: 0, letters: {}, bestCombo: 0, drillT: 90, newWords: 0, runBy: {}, runRelics: [], maxBlast: 0,
    weak: mode === 'play' && prefs.adaptive ? letterWeakness() : null,`, `    combo: 0, ripples: [], hurt: 0, letters: {}, bestCombo: 0, drillT: 90, newWords: 0, runBy: {}, runRelics: [], maxBlast: 0,
    depth: 0, zone: null, nextBossAt: 0, allyT: null, daily: pendingDaily, rng: null,
    weak: mode === 'play' && prefs.adaptive && !pendingDaily ? letterWeakness() : null,`);
// pressure never applies to a daily dive (its own modifier does), a drill or zen
rep(`  const press = mode === 'play' ? Object.keys(PRESSURE).filter(k => prefs.pressure[k] && PRESSURE[k].ok()) : [];`,
    `  const press = G.daily ? (G.daily.mod === 'deep' ? ['deep'] : []) : mode === 'play' && !calmGame() ? Object.keys(PRESSURE).filter(k => prefs.pressure[k] && PRESSURE[k].ok()) : [];`);
rep(`const bossOf = () => G.game === 'expedition' ? G.exp.boss : SECTOR_BOSS[G.diff - 1];`, `const bossOf = () => G.daily ? G.daily.boss : G.game === 'expedition' ? G.exp.boss : SECTOR_BOSS[G.diff - 1];`);
// no damage, charge, crates or weather in a drill or zen; storms all run on a storm day and in the Abyss
rep(`  if (G.game === 'drill') {
    burstLetters(w, C['pen-1']); G.combo = 0;`, `  if (calmGame()) {
    burstLetters(w, C['pen-1']); G.combo = 0;`);
rep(`function addCharge(n) {
  if (G.game === 'drill') return;`, `function addCharge(n) {
  if (calmGame()) return;`);
rep(`  if (G.crateT <= 0 && G.game !== 'drill' && !G.spawnHold &&`, `  if (G.crateT <= 0 && !calmGame() && !G.spawnHold &&`);
rep(`  const stormy = legType() === 'storm';
  if ((G.level >= 3 || stormy) && G.game !== 'drill') {`, `  const stormy = legType() === 'storm' || !!(G.daily && G.daily.mod === 'storm') || !!zoneOf().abyss;
  if ((G.level >= 3 || stormy) && !calmGame()) {`);
rep(`  if ((G.level >= 5 || stormy) && G.game !== 'drill') {`, `  if ((G.level >= 5 || stormy) && !calmGame()) {`);
// Descent offers its card the moment a zone changes; riveter works there too
rep(`  if (G.pickQ && G.game === 'patrol' && G.mode === 'play' && screen === 'play') { openPick(); return; }`,
    `  if (G.pickQ && (G.game === 'patrol' || G.game === 'descent') && G.mode === 'play' && screen === 'play') { openPick(); return; }`);
rep(`  if (G.game === 'patrol') {
    const lv = rampLevel(); if (lv > G.level) levelUp(lv);
    if (G.mods.riveter && G.kills % 15 === 0) regrowPlate();
  }`, `  if (G.game === 'patrol') { const lv = rampLevel(); if (lv > G.level) levelUp(lv); }
  if ((G.game === 'patrol' || G.game === 'descent') && G.mods.riveter && G.kills % 15 === 0) regrowPlate();
  dive(3 + shown(whole).length);`);
rep(`  G.maxBlast = Math.max(G.maxBlast, G.kills - killsBefore);`, `  G.maxBlast = Math.max(G.maxBlast, G.kills - killsBefore); dive(6);`);
rep(`  if (how === 'type') recover(shown(w));`, `  if (how === 'type') recover(shown(w));
  dive(25);`);
// leviathans in Descent: fewer layers, and destroying one doesn't end the run
rep(`  const lv = G.game === 'expedition' ? G.level : sectorLevel(3);`, `  const lv = G.game === 'sector' ? sectorLevel(3) : G.level;`);
rep(`  const n = Math.max(2, 3 + Math.floor(G.diff / 2) - (type === 'ironback' ? 1 : 0));`, `  const n = Math.max(2, (G.game === 'descent' ? 2 + Math.floor(G.diff / 4) : 3 + Math.floor(G.diff / 2)) - (type === 'ironback' ? 1 : 0));`);
rep(`  for (const e of G.words.filter(o => o.kind === 'enemy')) { burstLetters(e, C['pen-3']); complete(e, 'nuke'); }
  G.flash = .6; bump(16); sfx.win();`, `  for (const e of G.words.filter(o => o.kind === 'enemy')) { burstLetters(e, C['pen-3']); complete(e, 'nuke'); }
  G.flash = .6; bump(16); sfx.win();
  if (G.game === 'descent') {
    const b = addPoints(300 * bonusScale(), 'bonus');
    banner(\`\${(BOSSES[w.btype] || BOSSES.leviathan).name.toUpperCase()} DESTROYED\`, \`\${Math.floor(G.depth)} m down · +\${fmtPts(b)} pts\`, C['pen-3']);
    return;
  }`);

// ---- starting a run
rep(`function startRun(d, game) {
  ensureAudio(); sfx.engage(); legacyGrant = 0;
  sel = d; prefs.diff = d; savePrefs();
  newGame(d, 'play', game);`, `function startRun(d, game) {
  ensureAudio(); sfx.engage(); legacyGrant = 0;
  // a daily dive is a seeded sector at the day's own difficulty; the tile you had selected stays selected
  const daily = game === 'daily' ? dailyConfig() : null;
  if (daily) d = daily.diff; else { sel = d; prefs.diff = d; }
  savePrefs();
  pendingDaily = daily; newGame(d, 'play', daily ? 'sector' : game); pendingDaily = null;
  if (daily) G.rng = mulberry(daily.seed);`);
rep(`  if (game === 'sector') banner(\`SECTOR \${pad(d)} · WAVE 1/3\``, `  if (daily) {
    const m = DAILY_MODS[daily.mod], counted = !prefs.daily[daily.key];
    banner(\`DAILY DIVE · \${m[0].toUpperCase()}\`, \`\${m[1]} · the \${BOSSES[daily.boss].name} waits · \${counted ? 'this attempt counts' : 'practice: today\\u2019s dive is already logged'}\`, C['pen-2']);
    return;
  }
  if (game === 'descent') { banner('DESCENT', 'an endless dive: every 200 m the water changes', C.sonar); return; }
  if (game === 'zen') { banner('ZEN', 'no hull to lose and no weapons: just the words · Esc, then E to end', C['pen-3']); return; }
  if (game === 'sector') banner(\`SECTOR \${pad(d)} · WAVE 1/3\``);

// ---- the title: mode chips, tiles for the new modes
rep(`          <button class="chip" data-game="patrol">Patrol · endless</button>`, `          <button class="chip" data-game="descent">Descent · endless</button>`);
rep(`          <button class="chip" data-game="drill">Drill · 90 s practice</button>`, `          <button class="chip" data-game="daily">Daily dive</button>
          <button class="chip" data-game="drill">Drill · 90 s practice</button>
          <button class="chip" data-game="zen">Zen</button>`);
rep(`const GAMES = ['sector', 'patrol', 'expedition', 'drill'];`, `const GAMES = ['sector', 'descent', 'expedition', 'daily', 'drill', 'zen'];`);
rep(`setGame(GAMES[(GAMES.indexOf(prefs.game) + (e.shiftKey ? 3 : 1)) % 4]);`, `setGame(GAMES[(GAMES.indexOf(prefs.game) + (e.shiftKey ? GAMES.length - 1 : 1)) % GAMES.length]);`);
rep(`function buildTiles() {
  document.querySelectorAll('[data-game]').forEach(b => b.classList.toggle('on', b.dataset.game === prefs.game));`, `function buildTiles() {
  document.querySelectorAll('[data-game]').forEach(b => b.classList.toggle('on', b.dataset.game === prefs.game));
  if (prefs.game === 'daily') { buildDailyPanel(); buildKitLine(); buildPress(); buildStoryLine(); return; }`);
rep(`    else if (prefs.game === 'drill') {`, `    else if (prefs.game === 'descent') {
      st = prefs.deepest[d] ? \`deepest <b>\${prefs.deepest[d]} m</b>\` : 'not yet dived';
      if (prefs.hi.descent[d] != null) st += \` <span class="hi">\${fmtPts(prefs.hi.descent[d])}</span>\`;
    }
    else if (prefs.game === 'zen') {
      const runs = prefs.history.filter(h => h.game === 'zen' && h.diff === d);
      st = runs.length ? \`\${fmtDur(runs.reduce((t, h) => t + h.secs, 0))} <span class="hi">best \${Math.max(0, ...runs.map(h => h.wpm || 0))} wpm</span>\` : 'calm water';
    }
    else if (prefs.game === 'drill') {`);
rep(`// the title's story line:`, `// the Daily dive's panel, in place of the ten difficulty tiles
function buildDailyPanel() {
  const cfg = dailyConfig(), m = DAILY_MODS[cfg.mod], done = prefs.daily[cfg.key], streak = dailyStreak();
  const days = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = dayKey(d), r = prefs.daily[k]; days.push(\`<i class="\${r ? 'on' : ''} \${i === 0 ? 'today' : ''}" title="\${k}\${r ? ' · ' + fmtPts(r.pts) : ''}"></i>\`); }
  $('#tiles').innerHTML = \`<button class="unit tile daily rise" id="dailyGo" style="grid-column:1/-1">
    <div class="top"><span class="no">DAILY DIVE · \${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      <span class="st">\${done ? \`\${done.medal ? medalSvg(done.medal) : ''}<b>\${fmtPts(done.pts)}</b> logged today\` : 'one counted attempt today'}</span></div>
    <div class="nm">\${m[0]} <span>\${m[1]}</span></div>
    <div class="dmeta"><span>sector <b>\${pad(cfg.diff)}</b> \${DIFF_NAMES[cfg.diff - 1]}</span><span>the <b>\${BOSSES[cfg.boss].name}</b> waits at the end</span><span>streak <b>\${streak}</b> day\${streak === 1 ? '' : 's'}</span></div>
    <div class="days">\${days.join('')}<span>last 14 days</span></div>
    <div class="dgo">\${done ? 'Dive again as practice' : 'Dive'} <kbd>⏎</kbd></div></button>\`;
  $('#dailyGo').onclick = () => startRun(sel, 'daily');
  const medals = Object.keys(prefs.medals).length;
  $('#runsNote').textContent = \`\${RANKS[rankOf(prefs.salvageTotal)][1]} · archive \${(catPct() * 100).toFixed(1)}% · \${prefs.runs} runs · \${medals} sectors cleared\`;
}
// the title's story line:`);

// ---- HUD and crumb
rep(`  } else if (G.game !== 'patrol') {
    const s = G.sec, exp =`, `  } else if (G.game === 'descent') {
    const z = zoneIndex(), Z = ZONES[Math.max(0, z)];
    $('#tHead').textContent = G.boss ? (BOSSES[G.boss.btype] || BOSSES.leviathan).name : 'Descent';
    $('#mFloor').innerHTML = \`\${Z.name} · threat <b>\${pad(G.level)}</b>\`;
    dotArc($('#cvGauge'), (G.depth % 200) / 200, String(Math.floor(G.depth)), 'METRES', C.sonar);
  } else if (G.game === 'zen') {
    $('#tHead').textContent = 'Zen';
    $('#mFloor').innerHTML = \`difficulty <b>\${pad(G.diff)}</b>\`;
    dotArc($('#cvGauge'), (G.t % 60) / 60, fmtClock(G.t), 'SESSION', C['pen-3']);
  } else if (G.game !== 'patrol') {
    const s = G.sec, exp =`);
rep(`  const where = G.game === 'drill' ?`, `  const dz = G.game === 'descent' ? ZONES[Math.max(0, zoneIndex())].name : '';
  const where = G.daily ? \`daily dive · \${DAILY_MODS[G.daily.mod][0]} · sector <b>\${pad(G.diff)}</b> · wave <b>\${G.sec.wave}/3</b>\`
    : G.game === 'descent' ? \`descent · difficulty <b>\${pad(G.diff)}</b> · <b>\${Math.floor(G.depth)} m</b> \${dz}\`
    : G.game === 'zen' ? \`zen · difficulty <b>\${pad(G.diff)}</b> · <b>\${fmtClock(G.t)}</b>\`
    : G.game === 'drill' ?`);

// ---- the scope gets darker the deeper you go, and names the zone
rep(`  // Blackout: the outer 40% of the scope is shrouded unless a ping is showing`, `  if (G.game === 'descent') {
    const z = zoneIndex();
    if (z > 0) { c.globalAlpha = (dark ? .1 : .05) * z; c.fillStyle = dark ? '#000' : C.ink; c.beginPath(); c.arc(cx, cy, R + 2, 0, TAU); c.fill(); }
    c.globalAlpha = .85; c.fillStyle = C.sonar; c.font = S.fontSm; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText(\`\${ZONES[z].name.toUpperCase()} ZONE · \${Math.floor(G.depth)} M\`, cx, cy - R + 18);
  }
  // Blackout: the outer 40% of the scope is shrouded unless a ping is showing`);

// ---- pause: Zen ends from here
rep(`          <button class="btn" id="btnQuit">Quit to title <kbd>Q</kbd></button>`, `          <button class="btn" id="btnQuit">Quit to title <kbd>Q</kbd></button>
          <button class="btn" id="btnEndZen" hidden>End session and see the debrief <kbd>E</kbd></button>`);
rep(`function pause() { if (screen === 'play') { G.armHeld = false; setScreen('paused'); syncToggles(); requestAnimationFrame(drawKey); } }`,
    `function pause() { if (screen === 'play') { G.armHeld = false; setScreen('paused'); syncToggles(); $('#btnEndZen').hidden = G.game !== 'zen'; requestAnimationFrame(drawKey); } }`);
rep(`    else if (k === 'q') quitToTitle();
    else if (k === 's') toggleShake();`, `    else if (k === 'q') quitToTitle();
    else if (k === 'e' && G.game === 'zen') gameOver('zen');
    else if (k === 's') toggleShake();`);
rep(`$('#btnDock').onclick = () => openDock();`, `$('#btnDock').onclick = () => openDock();
$('#btnEndZen').onclick = () => { if (G.game === 'zen' && screen === 'paused') gameOver('zen'); };`);

// ---- game over: records for the new modes
rep(`  const hi = prefs.hi[G.game], prevBest = hi[G.diff], exp = G.game === 'expedition' ? G.exp : null;`,
    `  const daily = G.daily, firstToday = !!daily && !prefs.daily[daily.key];
  const hi = daily ? {} : prefs.hi[G.game], prevBest = daily ? (prefs.daily[daily.key] || {}).pts : hi[G.diff], exp = G.game === 'expedition' ? G.exp : null;`);
rep(`  const prevMedal = exp ? ends[exp.boss] : prefs.medals[G.diff];
  let isNew = false;
  if (G.points > 0 && (prevBest == null || G.points > prevBest)) { hi[G.diff] = G.points; isNew = true; }
  if (medal && (!prevMedal || rank[medal] > rank[prevMedal])) { if (exp) ends[exp.boss] = medal; else prefs.medals[G.diff] = medal; isNew = true; }`,
`  const prevMedal = daily ? null : exp ? ends[exp.boss] : prefs.medals[G.diff];
  let isNew = false;
  if (daily) {
    // the day's first attempt is the one that counts; later ones are practice
    if (firstToday) { prefs.daily[daily.key] = { pts: G.points, medal, kind, acc: Math.round(acc * 10) / 10, mod: daily.mod, boss: daily.boss, diff: G.diff }; isNew = true; }
  } else {
    if (G.points > 0 && (prevBest == null || G.points > prevBest)) { hi[G.diff] = G.points; isNew = true; }
    if (medal && (!prevMedal || rank[medal] > rank[prevMedal])) { if (exp) ends[exp.boss] = medal; else prefs.medals[G.diff] = medal; isNew = true; }
  }
  if (G.game === 'descent' && G.mode === 'play') prefs.deepest[G.diff] = Math.max(prefs.deepest[G.diff] || 0, Math.floor(G.depth));`);
rep(`  const drill = G.game === 'drill';
  const salv = drill ? 0 : Math.max(0, Math.round(G.points / 100 * (G.mods.salvager ? 1.5 : 1))`, `  const drill = G.game === 'drill', zen = G.game === 'zen';
  const salv = drill ? 0 : Math.max(0, Math.round(G.points / (zen ? 200 : 100) * (G.mods.salvager ? 1.5 : 1))`);
rep(`  prefs.history.push({ at: Date.now(), game: G.game, diff: G.diff,`, `  if (zen) prefs.life.zen = (prefs.life.zen || 0) + Math.round(G.t);
  prefs.history.push({ at: Date.now(), game: daily ? 'daily' : G.game, diff: G.diff, depth: G.game === 'descent' ? Math.floor(G.depth) : undefined,`);
rep(`  no.textContent = drill ? \`DRILL · 90 SECONDS\${G.stats.leaks ? \` · \${G.stats.leaks} LEAKED\` : ''}\` : kind === 'cleared' ?`,
    `  no.textContent = drill ? \`DRILL · 90 SECONDS\${G.stats.leaks ? \` · \${G.stats.leaks} LEAKED\` : ''}\`
    : zen ? \`ZEN · \${fmtClock(G.t)}\`
    : G.game === 'descent' ? (kind === 'rammed' ? \`SIGNAL LOST · THE \${bossName} REACHED THE CORE AT \${Math.floor(G.depth)} M\` : \`SIGNAL LOST · HULL BREACHED AT \${Math.floor(G.depth)} M · \${ZONES[Math.max(0, zoneIndex())].name.toUpperCase()} ZONE\`)
    : daily && kind === 'cleared' ? \`DAILY DIVE CLEARED · \${DAILY_MODS[daily.mod][0].toUpperCase()} · \${bossName} DESTROYED\`
    : kind === 'cleared' ?`);
rep(`  $('#dTitle').textContent = drill ? 'Drill complete' :`, `  $('#dTitle').textContent = drill ? 'Drill complete' : zen ? 'Session complete' : daily ? (firstToday ? 'Daily dive' : 'Daily dive · practice') : G.game === 'descent' ? 'Dive over' :`);
rep(`  $('#dSub').textContent = \`\${G.game} · difficulty`, `  $('#dSub').textContent = \`\${daily ? 'daily dive ' + daily.key : G.game} · difficulty`);
rep(`  $('#dKillsS').textContent = G.game === 'sector'`, `  $('#dKillsS').textContent = G.game === 'descent' ? \`reached \${Math.floor(G.depth)} m\${prefs.deepest[G.diff] > Math.floor(G.depth) ? \` · deepest \${prefs.deepest[G.diff]}\` : ' · deepest yet'}\`
    : zen ? \`\${G.stats.leaks || 0} got through\`
    : G.game === 'sector'`);
// play again: a daily dive replays as the daily
rep(`    if (e.key === 'Enter') startRun(G.diff, G.game);`, `    if (e.key === 'Enter') startRun(G.diff, G.daily ? 'daily' : G.game);`);
rep(`$('#btnAgain').onclick = () => startRun(G.diff, G.game);`, `$('#btnAgain').onclick = () => startRun(G.diff, G.daily ? 'daily' : G.game);`);

// ---- styles for the daily panel
rep(`.catbar{`, `.tile.daily{gap:10px;padding:16px 18px}
.tile.daily .nm{font-size:20px}
.tile.daily .nm span{font-size:12px;font-weight:400;color:var(--ink-3);margin-left:8px}
.dmeta{display:flex;gap:22px;font-size:11.5px;color:var(--ink-3)}
.dmeta b{color:var(--ink);font-weight:600}
.days{display:flex;gap:5px;align-items:center}
.days i{width:12px;height:12px;border-radius:50%;border:1px solid var(--rule-strong)}
.days i.on{background:var(--pen-2);border-color:var(--pen-2)}
.days i.today{outline:1px solid var(--ink-3);outline-offset:2px}
.days span{font-family:var(--mono);font-size:9.5px;color:var(--ink-3);margin-left:8px}
.dgo{align-self:flex-end;font-family:var(--mono);font-size:11px;color:var(--pen-2);display:flex;gap:8px;align-items:center}
.catbar{`);
fs.writeFileSync(f, s); console.log('ok');
