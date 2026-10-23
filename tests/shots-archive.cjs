// screenshots of the Phase 1 screens, with some fake progress so the pages have something to show
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
const fake = `const words = [...BANK]; for (let i = 0; i < words.length; i += 7) CAT.add(words[i]); CATSTATE.dirty = true;
  prefs.catRecent = words.filter((w, i) => i % 7 === 0).slice(0, 30);
  for (const k of Object.keys(RELICS).slice(0, 13)) prefs.relics[k] = Date.now() - Math.random() * 9e8;
  for (const [k] of BESTIARY.slice(0, 12)) prefs.bestiary[k] = { seen: 20 + Math.round(Math.random() * 300), kills: 15 + Math.round(Math.random() * 200), first: Date.now() - 8e8 };
  for (const [id] of COMMENDATIONS.slice(0, 15)) prefs.honours[id] = Date.now() - Math.random() * 9e8;
  prefs.salvageTotal = 4200; savePrefs();`;
module.exports = [
  [null, `${still} ${fake} quitToTitle(); 'ok'`, 400],
  ['a1-title', `'title'`, 500],
  ['a2-archive', `openLog('archive'); 'ok'`, 600],
  ['a3-archive-relics', `document.querySelector('#ovLog .panel').scrollTop = 900; 'ok'`, 400],
  ['a4-bestiary', `document.querySelector('#ovLog .panel').scrollTop = 0; logTab = 'bestiary'; renderLog(); 'ok'`, 600],
  ['a5-honours', `logTab = 'honours'; renderLog(); 'ok'`, 500],
  ['a6-relic', `closeLog(); ${SETUP(5, 'sector')} const r = spawnRelic(-0.9, S.R * .62); r.speed = 0; put('harbour', 40, .5); put('signal', 160, .7); step(30); window.__r = r; window.__type = type; 'ok'`, 300],
  ['a7-debrief', `__type(__r); G.bestCombo = 55; G.points = 52000; G.correct = 900; G.t = 200; G.stats.hullDmg = 0; prefs.honours = {}; gameOver('cleared'); 'ok'`, 700],
];
