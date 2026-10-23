// Campaign balance: every mission several times at a few paces and typing speeds; the Gauntlet across difficulties
const { SIM } = require('./lib.cjs');
const sweep = (pace, wpm, err, n) => [null, `prefs.campPace = ${pace}; const out = [];
  for (let i = 0; i < 10; i++) { let c = 0; prefs.campSel = i; for (let k = 0; k < ${n}; k++) { prefs.campaign.done = Object.fromEntries(MISSIONS.slice(0, i).map(m => [m.id, { marks: [0, 0], pts: 1, pace: 1, at: 1, wins: 1 }])); if (sim(1, 'campaign', ${wpm}, {}, ${err}, 600).res.startsWith('cleared')) c++; } out.push(MISSIONS[i].no + ' ' + c + '/${n}'); }
  prefs.campPace = 1; '${['gentle', 'standard', 'hard'][pace]} pace, ${wpm} wpm: ' + out.join('  ')`, 30];
module.exports = [
  [null, SIM, 30],
  sweep(0, 30, .05, 4),
  sweep(1, 40, .04, 4),
  sweep(1, 55, .03, 4),
  sweep(2, 70, .03, 4),
  [null, `for (const k of BOSS_KEYS) prefs.beaten[k] = true; const out = []; for (const d of [2, 4, 6, 8, 10]) { let c = 0, fell = []; for (let k = 0; k < 4; k++) { const r = sim(d, 'gauntlet', 30 + d * 6); if (r.res.startsWith('cleared')) c++; else fell.push(r.res + ' on ' + G.sec.wave + ' at ' + r.t + 's'); } out.push(d + ' (' + (30 + d * 6) + ' wpm) ' + c + '/4' + (fell.length ? ' [' + fell.join(', ') + ']' : '')); } 'gauntlet: ' + out.join('  ')`, 30],
];
