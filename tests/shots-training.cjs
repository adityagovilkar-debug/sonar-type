// screenshots of the Phase 4 screens
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
const fake = `prefs.letters = {}; for (const ch of 'abcdefghijklmnopqrstuvwxyz') prefs.letters[ch] = { n: 60, ms: 130 + Math.round(Math.random() * 70), miss: Math.random() * .05 };
  Object.assign(prefs.letters, { q: { n: 20, ms: 360, miss: .2 }, z: { n: 18, ms: 320, miss: .1 }, p: { n: 40, ms: 260, miss: .06 }, b: { n: 40, ms: 250, miss: .08 } });
  prefs.pairs = {}; for (const a of 'thaeionsr') for (const b of 'eatohnrsi') prefs.pairs[a + b] = { n: 20, ms: 120 + Math.round(Math.random() * 60), miss: .01 };
  Object.assign(prefs.pairs, { qu: { n: 12, ms: 420, miss: .2 }, ze: { n: 9, ms: 380, miss: .1 }, pb: { n: 7, ms: 350, miss: .05 } });
  prefs.history = []; for (let i = 0; i < 5; i++) prefs.history.push({ at: Date.now() - i * 3600e3, game: 'sector', diff: 4, pts: 9000, wpm: 38 + i, acc: 95, kills: 50, secs: 160 });
  prefs.goal = { type: 'wpm', target: 45 }; savePrefs();`;
module.exports = [
  [null, `${still} ${fake} quitToTitle(); 'ok'`, 300],
  ['t1-settings', `openSettings(); 'ok'`, 500],
  ['t2-letters', `setScreen('title'); openLog('letters'); document.querySelector('#ovLog .panel').scrollTop = 260; 'ok'`, 600],
  ['t3-goal', `closeLog(); openLog('progress'); 'ok'`, 600],
  ['t4-warmup', `closeLog(); prefs.comfort.warmup = true; startRun(4, 'sector'); prefs.seen = Object.fromEntries(Object.keys(TIPS).map(k => [k, 1])); tipQ.length = 0; for (let i = 0; i < 60 * 9; i++) update(1 / 60); prefs.comfort.warmup = false; 'ok'`, 300],
  ['t5-comfort-play', `prefs.comfort.text = 1.15; prefs.comfort.easy = true; prefs.comfort.palette = 'cb'; applyTheme(); ${SETUP(6, 'sector')}
    put('harbour', -40, .6); put('signal', 60, .5, { trait: 'reversed', rev: true, text: 'langis' }); put('lantern', 150, .72, { trait: 'mine' }); put('quiet', 230, .4); spawnRelic(2.6, S.R * .7).speed = 0; step(20); 'ok'`, 400],
];
