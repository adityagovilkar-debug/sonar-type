// Shared pieces for step files: a quiet test run with everything unlocked, and a simulated typist.
const SETUP = (d = 5, game = 'patrol', kit = '{}', press = '{}') => `
  prefs.medals = Object.fromEntries([1,2,3,4,5,6,7,8,9,10].map(k => [k, 'gold']));
  for (const k of Object.keys(HULLS)) prefs.owned['hull:' + k] = true;
  for (const s of Object.keys(GEAR)) for (const k of Object.keys(GEAR[s])) prefs.owned[s + ':' + k] = true;
  for (const k of Object.keys(CARDS)) prefs.owned['card:' + k] = true;
  prefs.loadout = Object.assign({ hull: 'skiff', torp: 'torpedo', pulse: 'pulse', nuke: 'nuke', tracer: 'hull' }, ${kit});
  prefs.pressure = ${press};
  startRun(${d}, '${game}'); G.words = []; G.spawnT = 999; G.crateT = 999; G.thermoT = 999; G.stormT = 999;
  prefs.seen = Object.fromEntries(Object.keys(TIPS).map(k => [k, 1])); tipQ.length = 0;
  const put = (text, deg, f, o = {}) => spawnEnemy(Object.assign({ text, trait: null, ang: deg * Math.PI / 180, dist: S.R * f, speed: 0 }, o));
  const step = n => { for (let i = 0; i < n; i++) update(1 / 60); };
  const type = w => { for (const ch of w.text.slice(w.fired)) { press(ch); step(6); } step(40); };`;
// one check: runs body (a function body returning a string) after SETUP
const check = (name, body, d, game, kit, press) =>
  [null, `${SETUP(d, game, kit, press)} let out; try { out = (() => { ${body} })(); } catch (e) { out = 'ERROR ' + e.stack; } '${name}: ' + out`, 30];
// a simulated typist that plays whole runs, picking cards and chart routes at random
const SIM = `window.sim = (d, game, wpmT, kit = {}, err = .03, maxT = 900) => {
  prefs.medals = Object.fromEntries([1,2,3,4,5,6,7,8,9,10].map(k => [k, 'gold']));
  for (const k of Object.keys(HULLS)) prefs.owned['hull:' + k] = true;
  for (const s of Object.keys(GEAR)) for (const k of Object.keys(GEAR[s])) prefs.owned[s + ':' + k] = true;
  for (const k of Object.keys(CARDS)) prefs.owned['card:' + k] = true;
  prefs.loadout = Object.assign({ hull: 'skiff', torp: 'torpedo', pulse: 'pulse', nuke: 'nuke', tracer: 'hull' }, kit.loadout || {});
  prefs.pressure = kit.press || {};
  startRun(d, game); prefs.seen = Object.fromEntries(Object.keys(TIPS).map(k => [k, 1])); tipQ.length = 0;
  const cps = wpmT / 12, dt = 1 / 30; let bt = .5, fresh = null, guard = 0;
  while (screen !== 'over' && G.t < maxT && guard++ < 200000) {
    if (screen === 'pick') { inputGuard = 0; takeCard(Math.floor(Math.random() * G.offer.length)); continue; }
    if (screen === 'chart') { inputGuard = 0; const o = reachable(); chooseNode(Math.floor(Math.random() * o.length)); continue; }
    if (screen !== 'play') break;
    const th = threats();
    if (G.arsenal.torp) { const big = th.find(w => w.dist < S.R * .42 && w.text.length - w.fired >= 6 && !w.relic); if (big) useTorp(big); }
    if (G.arsenal.pulse && G.slowT <= 0 && G.freezeT <= 0 && th.filter(w => w.dist < S.R * .55).length >= 4) usePulse();
    if (G.arsenal.nuke && th.filter(w => w.dist < S.R * .6).length >= 6) detonate();
    if (!G.pingCd && th.some(w => sight(w) !== 'clear' && w.dist < S.R * .7)) usePing();
    bt -= dt;
    while (bt <= 0) {
      bt += rnd(.7, 1.3) / cps;
      let t = G.lock && G.lock.fired < G.lock.text.length && live(G.lock) ? G.lock : null;
      if (!t) {
        for (const w of th) if (w.fired < w.text.length && sight(w) !== 'hidden' && (!t || w.dist < t.dist)) t = w;
        const crate = G.words.find(w => w.kind === 'crate' && w.entered && w.fired < w.text.length);
        if (crate && (!t || t.dist > S.R * .55)) t = crate;
        if (t && fresh !== t) { fresh = t; bt += .25; break; }
      }
      if (!t) break;
      if (Math.random() < err) { press('qjzxv'[Math.floor(Math.random() * 5)]); continue; }
      press(t.text[t.fired]);
    }
    update(dt);
  }
  return { d, game, wpmT, res: screen === 'over' ? G.result.kind + (G.result.medal ? ':' + G.result.medal : '') : 'timeout@' + screen, t: Math.round(G.t),
    kills: G.kills, pts: G.points, newWords: G.newWords, relics: G.runRelics.length, honours: Object.keys(prefs.honours).length };
};
'sim ready'`;
module.exports = { SETUP, check, SIM };
