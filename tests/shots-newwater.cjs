// screenshots of the Phase 2 screens
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
module.exports = [
  [null, `${still} prefs.daily = {}; for (let i = 1; i < 9; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (i !== 4) prefs.daily[dayKey(d)] = { pts: 9000 + i * 700, medal: 'silver' }; } savePrefs(); quitToTitle(); setGame('daily'); 'ok'`, 400],
  ['n1-daily-title', `'daily'`, 500],
  ['n2-contacts', `setGame('sector'); ${SETUP(7, 'sector')}
    const wd = put('keeper', -40, .58, { trait: 'warden' }); put('planet', -30, .66); put('stone', -52, .5);
    const a = spawnAlly(); a.rx = S.R * .55; a.ry = S.R * .3; a.vx = -20; a.vy = 0; a.entered = true;
    spawnEnemy({ trait: 'krill', ang: 2.4, dist: S.R * .7 }); G.words.filter(w => w.trait === 'krill').forEach(w => w.speed = 0);
    put('shifting', 95, .62, { trait: 'mimic' }).mimT = 9; put('ghostly', 200, .42, { trait: 'fading' });
    const dv = put('plunge', 160, .75, { trait: 'diver' }); dv.diveT = 99; step(20); 'ok'`, 300],
  ['n3-descent-midnight', `${SETUP(4, 'descent')} G.depth = 455; G.zone = 2; G.level = 6; for (let i = 0; i < 4; i++) spawnEnemy({ speed: 0, dist: S.R * (.4 + i * .12) }); for (let i = 0; i < 240; i++) update(1 / 60); 'ok'`, 300],
  ['n4-zen', `${SETUP(3, 'zen')} G.t = 312; for (let i = 0; i < 3; i++) put(['calm', 'still', 'water'][i], i * 120, .5 + i * .1); step(20); pause(); 'ok'`, 400],
  ['n5-bestiary', `resume(); openLog('bestiary'); document.querySelector('#ovLog .panel').scrollTop = 900; 'ok'`, 600],
];
