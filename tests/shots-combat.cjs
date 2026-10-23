// screenshots of the Phase 3 pieces
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
module.exports = [
  [null, `${still} prefs.mastery = { lancer: 1200, skiff: 300 }; prefs.ghosts = { 'sector:5': { pts: 9000, trace: [0, 400, 1100, 1900, 2600, 3500, 4300, 5200, 6100, 7000, 8000, 9000] } }; prefs.expTier = 3; savePrefs(); 'ok'`, 100],
  ['c1-flow-ghost', `${SETUP(5, 'sector', "{ hull: 'lancer' }")}
    G.ghost = prefs.ghosts['sector:5']; G.trace = [0, 300, 900, 1700, 2500]; G.points = 3100; G.t = 23;
    G.flow = 1; G.inFlow = true; G.overT = 3.2; G.abilCd = 12;
    for (const [t, a, f] of [['harbour', -40, .6], ['signal', 60, .5], ['lantern', 150, .72], ['quiet', 230, .45]]) put(t, a, f);
    G.cards = ['pierce', 'forge', 'bounty']; G.cardAt = {}; step(20); hudT = 0; hud(1); 'ok'`, 400],
  ['c2-tier-title', `quitToTitle(); setGame('expedition'); 'ok'`, 500],
  ['c3-dock-hulls', `openDock('hulls'); 'ok'`, 700],
];
