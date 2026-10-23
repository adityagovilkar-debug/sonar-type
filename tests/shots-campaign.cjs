// screenshots of the Phase 5 screens: the campaign panel, a mission under way, the finale's choice, the debrief, the Gauntlet
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
const done = n => `prefs.campaign = { done: Object.fromEntries(MISSIONS.slice(0, ${n}).map((m, k) => [m.id, { marks: [k % 2 === 0, k % 3 === 0], pts: 9000 + k * 1300, pace: 1, at: 1, wins: 1 }])), endings: {}, ending: null };`;
const H = `const step = n => { for (let i = 0; i < n; i++) update(1 / 60); }; const type = w => { for (const ch of w.text.slice(w.fired)) { press(ch); step(6); } step(40); };`;
module.exports = [
  [null, `${still} ${done(4)} prefs.campSel = 4; prefs.game = 'campaign'; quitToTitle(); 'ok'`, 400],
  ['c1-campaign', `buildTiles(); 'ok'`, 500],
  ['c2-mission', `${SETUP(5, 'sector')} prefs.campSel = 4; startRun(1, 'campaign'); G.words = []; G.spawnT = 999; for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    for (let i = 0; i < 9; i++) { const w = put(pickFromTier(0), i * 30, .6); type(w); G.spawnT = 999; }
    put('lighthouse', -50, .7); put('quarry', 70, .55, { trait: 'reversed', rev: true, text: 'yrrauq' }); put('anchor', 200, .45); G.stormT = 0; step(20); 'ok'`, 400],
  ['c3-archive', `${SETUP(5, 'sector')} ${done(9)} prefs.campSel = 9; startRun(1, 'campaign'); G.words = []; G.spawnT = 999; for (let i = 0; i < 60 * 3; i++) update(1 / 60);
    G.kills = 25; let n = 0; while (screen === 'play' && n++ < 600) update(1 / 60); inputGuard = 0; if (screen === 'pick') takeCard(0); n = 0; while (!G.boss && n++ < 600) update(1 / 60);
    G.boss.speed = 0; G.words = [G.boss]; type(G.boss); type(G.boss); G.boss.rx *= .6; G.boss.ry *= .6; step(30); 'ok'`, 400],
  ['c4-choice', `${H} let k = 0; while (G.boss && k++ < 40) { G.boss.speed = 0; G.words = [G.boss]; type(G.boss); } let n = 0; while (G.mis.stage === 'hush' && n++ < 600) update(1 / 60); step(40); 'ok'`, 400],
  ['c5-debrief', `${H} type(G.words.find(w => w.choice === 'keep')); let n = 0; while (screen === 'play' && n++ < 600) update(1 / 60); document.querySelector('#ovOver .panel').scrollTop = 0; 'ok'`, 700],
  ['c6-gauntlet', `quitToTitle(); for (const k of BOSS_KEYS) prefs.beaten[k] = true; prefs.gauntMedals = { 2: 'gold', 3: 'silver' }; prefs.hi.gauntlet = { 2: 14200, 3: 21950 }; setGame('gauntlet'); 'ok'`, 500],
  ['c7-gauntlet-play', `${SETUP(4, 'gauntlet')} for (let i = 0; i < 60 * 6; i++) update(1 / 60); G.boss.speed = 0; type(G.boss); step(60); 'ok'`, 400],
];
