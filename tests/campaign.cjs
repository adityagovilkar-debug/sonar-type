// Phase 5 (Campaign): missions, objectives, failure rules, marks and stars, the finale's choice, the Gauntlet
const { check, SIM } = require('./lib.cjs');
// start mission i (0-based) on a quiet scope; everything before it counts as done
const MIS = i => `prefs.campaign = { done: {}, endings: {}, ending: null };
  for (let k = 0; k < ${i}; k++) prefs.campaign.done[MISSIONS[k].id] = { marks: [false, false], pts: 1, pace: 1, at: 1, wins: 1 };
  prefs.campSel = ${i}; prefs.campPace = 1; startRun(1, 'campaign'); G.words = []; G.spawnT = 999; G.crateT = 999; G.thermoT = 999; G.stormT = 999;
  const quietRun = () => { G.spawnT = 999; };
  const killBoss = () => { let n = 0; while (G.boss && live(G.boss) && n++ < 40) { G.boss.speed = 0; G.words = G.words.filter(o => o === G.boss || o.choice); type(G.boss); } };`;
module.exports = [
  check('panel + locks', `prefs.campaign = { done: {}, endings: {}, ending: null }; prefs.campSel = 0; quitToTitle(); setGame('campaign');
    const rows = document.querySelectorAll('.crow').length, locked = document.querySelectorAll('.crow.lk').length, brief = $('#campGo .nm').textContent;
    campSelect(3); const sealed = $('#campGo .nm').textContent; startRun(1, 'campaign'); const blocked = screen;
    prefs.campaign.done.m1 = { marks: [true, false], pts: 900, pace: 1, at: 1, wins: 1 }; campSelect(1); const open2 = $('#campGo .nm').textContent, stars = document.querySelectorAll('.crow .stars i.on').length;
    setGame('sector');
    return 'rows ' + rows + ', locked ' + locked + ', brief ' + brief + ', m4 shows ' + sealed + ', launching it leaves screen ' + blocked + ' | after m1: m2 ' + open2 + ', lit stars ' + stars;`),
  check('pace', `const out = []; for (const p of [0, 1, 2]) { prefs.campPace = p; prefs.campSel = 4; prefs.campaign.done = Object.fromEntries(MISSIONS.slice(0, 4).map(m => [m.id, { marks: [0, 0], pts: 1, pace: 1, at: 1, wins: 1 }])); startRun(1, 'campaign'); out.push(G.diff + '/' + G.mis.lv + ' press ' + Object.keys(G.press).length); }
    prefs.campPace = 1; return 'mission 05 (lv 4) at gentle/standard/hard: ' + out.join(', ');`, 5, 'sector', '{}', '{ deep: true }'),
  check('m1 kills -> cleared', `${MIS(0)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); const st0 = G.mis.stage;
    for (let i = 0; i < 25; i++) { const w = put(pickFromTier(0), i * 14, .7); type(w); }
    const st1 = G.mis.stage; for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    const rec = prefs.campaign.done.m1;
    return 'stage ' + st0 + ' -> ' + st1 + ', screen ' + screen + ', record ' + JSON.stringify(rec && { marks: rec.marks, wins: rec.wins }) + ', stars ' + campStars(0) + ', log k01 ' + !!STORY.find(e => e.id === 'k01').req() + ', dNo ' + $('#dNo').textContent + ', again ' + $('#btnAgain').textContent;`),
  check('m2 convoy + friendly fire fail', `${MIS(1)} const a0 = G.allyT; for (let i = 0; i < 60 * 6; i++) update(1 / 60); const allies = G.words.filter(w => w.kind === 'ally').length;
    quietRun(); for (let k = 0; k < 2; k++) { const al = spawnAlly(); for (const ch of al.text) press(ch); for (let i = 0; i < 40; i++) update(1 / 60); }
    return 'first ally at ' + a0 + ' s, allies after 6 s ' + allies + ', friendly ' + G.stats.friendly + ', screen ' + screen + ', result ' + G.result.kind + ', dNo ' + $('#dNo').textContent;`),
  check('m2 escort wins', `${MIS(1)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); quietRun(); G.stats.escorts = 4; const al = spawnAlly(); al.vx *= 8; al.vy *= 8; let n = 0;
    while (screen === 'play' && n++ < 60 * 20) update(1 / 60);
    return 'escorts ' + G.stats.escorts + ', screen ' + screen + ', result ' + (G.result && G.result.kind) + ', no-ff mark ' + prefs.campaign.done.m2.marks[0];`),
  check('m3 survive in the dark', `${MIS(2)} const dark = darkWater(); G.hull = 1e6; G.hullMax = 1e6; let n = 0; while (screen === 'play' && n++ < 60 * 140) update(1 / 60);
    return 'dark ' + dark + ', time ' + Math.round(G.mis.time) + ', kills (spawned and leaked) ' + G.kills + ', screen ' + screen + ', result ' + G.result.kind;`),
  check('m4 relics: lost three -> fail', `${MIS(3)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); let rel = 0; for (let i = 0; i < 400; i++) { if (spawnEnemy().relic) rel++; G.words = []; }
    for (let k = 0; k < 3; k++) { const r = spawnRelic(0, S.R * .2); r.speed = 300; for (let i = 0; i < 60; i++) { if (screen !== 'play') break; update(1 / 60); } }
    return 'relics in 400 spawns ' + rel + ', lost ' + G.stats.relicsLost + ', screen ' + screen + ', result ' + G.result.kind + ', why ' + G.mis.failWhy;`),
  check('m4 relics: recover three', `${MIS(3)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); quietRun();
    for (let k = 0; k < 3; k++) { const r = spawnRelic(k * 2, S.R * .7); r.speed = 0; type(r); }
    for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    return 'relics ' + G.runRelics.length + ', screen ' + screen + ', result ' + G.result.kind + ', marks ' + JSON.stringify(prefs.campaign.done.m4.marks);`),
  check('m5 objective -> pick -> archer', `${MIS(4)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); const storm = (() => { G.stormT = 0; update(1 / 60); return !!G.storm; })(); quietRun();
    for (let i = 0; i < 30; i++) { const w = put(pickFromTier(0), i * 12, .7); type(w); quietRun(); }
    const st = G.mis.stage; let n = 0; while (screen === 'play' && n++ < 600) update(1 / 60); const pickTxt = $('#pkNo').textContent; inputGuard = 0; takeCard(0);
    n = 0; while (!G.boss && n++ < 600) update(1 / 60);
    const b = G.boss && G.boss.btype; killBoss(); for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    return 'storm ' + storm + ', stage ' + st + ', pick "' + pickTxt + '", boss ' + b + ', screen ' + screen + ', result ' + (G.result && G.result.kind) + ', log k05 ' + !!prefs.campaign.done.m5;`),
  check('m9 depth', `${MIS(8)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); quietRun(); const d0 = darkWater();
    let lv; for (let i = 0; i < 80 && screen === 'play' && G.mis.stage === 'run'; i++) { const w = put(pickFromTier(2), i * 9, .7); type(w); quietRun(); if (G.depth > 200 && lv == null) lv = G.level + ' dark ' + darkWater(); }
    for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    return 'dark at start ' + d0 + ', past 200 m level ' + lv + ', depth ' + Math.floor(G.depth) + ', screen ' + screen + ', result ' + (G.result && G.result.kind);`),
  check('finale: archive voices + choice', `${MIS(9)} for (let i = 0; i < 60 * 3; i++) update(1 / 60); quietRun();
    G.kills = 30; update(1 / 60); let n = 0; while (screen === 'play' && n++ < 600) update(1 / 60); inputGuard = 0; if (screen === 'pick') takeCard(0);
    n = 0; while (!G.boss && n++ < 600) update(1 / 60);
    const voices = []; let k = 0;
    while (G.boss && k++ < 40) { G.boss.speed = 0; G.words = G.words.filter(o => o === G.boss); voices.push(G.boss.btype + (G.boss.rev ? '(rev)' : '') + (G.boss.armour ? '(plated)' : '') + (G.boss.quiet ? '(quiet)' : '') + ':' + shown(G.boss)); type(G.boss); }
    const st = G.mis.stage; n = 0; while (G.mis.stage === 'hush' && n++ < 600) update(1 / 60);
    const ch = G.words.filter(w => w.choice).map(w => w.choice + '@' + Math.round(w.dist)).join(' '), stage2 = G.mis.stage;
    for (let i = 0; i < 60 * 5; i++) update(1 / 60);
    const still = G.words.filter(w => w.choice).map(w => Math.round(w.dist)).join(' ');
    type(G.words.find(w => w.choice === 'rest')); n = 0; while (screen === 'play' && n++ < 600) update(1 / 60);
    return 'voices ' + [...new Set(voices)].join(' > ') + ' | after: ' + st + ' -> ' + stage2 + ', answers ' + ch + ' (after 5 s ' + still + ') | screen ' + screen + ', ending ' + prefs.campaign.ending + ', title ' + $('#dTitle').textContent + ', story e_rest ' + /You typed rest/.test($('#dStory').textContent) + ', Stillwater owned ' + owns('scope', 'still') + ', Lamplight ' + owns('scope', 'lamp') + ', beaten untouched ' + JSON.stringify(prefs.beaten);`),
  check('gauntlet', `prefs.beaten = {}; quitToTitle(); setGame('gauntlet'); const lockedTile = document.querySelector('.tile .st').textContent; startRun(3, 'gauntlet'); const blocked = screen;
    for (const k of BOSS_KEYS) prefs.beaten[k] = true; const medals0 = JSON.stringify(prefs.medals);
    startRun(3, 'gauntlet'); G.words = []; const order = []; let n = 0;
    while (screen !== 'over' && n++ < 20000) {
      if (screen === 'pick') { inputGuard = 0; takeCard(0); continue; }
      if (G.boss) { order.push(G.boss.btype); G.boss.speed = 0; G.words = G.words.filter(o => o === G.boss); let k = 0; while (G.boss && k++ < 40) type(G.boss); continue; }
      G.spawnT = 999; update(1 / 60);
    }
    setGame('sector');
    return 'locked tile "' + lockedTile + '", launch while locked -> ' + blocked + ' | order ' + order.join(' > ') + ', result ' + G.result.kind + ':' + G.result.medal + ', gauntMedals ' + JSON.stringify(prefs.gauntMedals) + ', sector medals unchanged ' + (JSON.stringify(prefs.medals) === medals0) + ', hi ' + prefs.hi.gauntlet[3] + ', dNo ' + $('#dNo').textContent;`),
  check('commendations + logbook', `prefs.campaign.endings = { keep: 1, rest: 1 }; prefs.campaign.ending = 'keep'; const got = awardCommendations({ by: {}, game: 'gauntlet', cleared: true, diff: 8 }).map(h => h.id);
    const out = []; for (const [k] of LOG_TABS) { openLog(k); out.push(k + ':' + $('#lgBody').textContent.length); closeLog(); }
    return 'earned ' + got.join(',') + ' | ' + COMMENDATIONS.length + ' commendations | ' + out.join(' ');`),
  [null, SIM, 30],
  [null, `prefs.campaign = { done: {}, endings: {}, ending: null }; const out = []; for (let i = 0; i < 10; i++) { prefs.campSel = i; const r = sim(1, 'campaign', 50, {}, .03, 600); out.push(MISSIONS[i].no + ':' + r.res + '@' + r.t + 's'); if (!prefs.campaign.done[MISSIONS[i].id]) prefs.campaign.done[MISSIONS[i].id] = { marks: [false, false], pts: 1, pace: 1, at: 1, wins: 1 }; } 'standard pace, 50 wpm: ' + out.join(' ') + ' | ending ' + prefs.campaign.ending + ' stars ' + campTotal()`, 30],
  [null, `prefs.campPace = 0; const out = []; for (let i = 0; i < 10; i++) { prefs.campSel = i; const r = sim(1, 'campaign', 32, {}, .05, 600); out.push(MISSIONS[i].no + ':' + r.res + '@' + r.t + 's'); } prefs.campPace = 1; 'gentle pace, 32 wpm: ' + out.join(' ')`, 30],
  [null, `prefs.campPace = 2; const out = []; for (let i = 0; i < 10; i++) { prefs.campSel = i; const r = sim(1, 'campaign', 70, {}, .03, 600); out.push(MISSIONS[i].no + ':' + r.res + '@' + r.t + 's'); } prefs.campPace = 1; 'hard pace, 70 wpm: ' + out.join(' ')`, 30],
  [null, `const out = []; for (const d of [3, 6, 9]) { const r = sim(d, 'gauntlet', 40 + d * 5); out.push(d + ':' + r.res + '@' + r.t + 's ' + r.pts); } 'gauntlet: ' + out.join(' | ')`, 30],
];
