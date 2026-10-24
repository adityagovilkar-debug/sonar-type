// screenshots of the v4.8 looks: the Dry Dock shelves with the showroom, and the looks in play
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
const OWN_ALL = `for (const [kind, cat] of [['tracer', TRACERS], ['scope', SCOPES], ['killfx', KILLFX], ...Object.entries(LOOKS)]) for (const k of Object.keys(cat)) if (cat[k].cost) prefs.owned[kind + ':' + k] = true;`;
const kit = o => `{ hull: 'skiff', torp: 'torpedo', pulse: 'pulse', nuke: 'nuke', ${o} }`;
module.exports = [
  [null, `${still} prefs.salvage = 900; quitToTitle(); 'ok'`, 300],
  ['l1-projectiles', `${OWN_ALL} delete prefs.owned['tracer:bee']; delete prefs.owned['torpskin:narwhal']; Object.assign(prefs.loadout, { tracer: 'plane', torpskin: 'duck', pet: 'crab', sweep: 'lighthouse', killfx: 'confetti' }); applyKit('demo'); openDock('tracers'); 'ok'`, 900],
  ['l2-scope', `openDock('scope'); document.querySelector('#dkBody').scrollTop = 0; 'ok'`, 900],
  ['l3-crew', `openDock('crew'); 'ok'`, 1200],
  ['l4-play', `closeDock(); ${SETUP(5, 'sector', kit("tracer: 'bee', pet: 'duck', sweep: 'lighthouse', scope: 'sakura', killfx: 'hearts'"))} readColors();
    put('lighthouse', -40, .7); put('anchor', 60, .55); put('quarry', 160, .5); const w = put('submarine', 230, .75);
    for (const ch of 'subm') { press(ch); step(2); } const w2 = put('ox', 300, .45); type(w2); for (const ch of 'arine') { press(ch); step(1); } step(4); 'ok'`, 400],
  ['l5-boomerang', `${SETUP(5, 'sector', kit("tracer: 'boomerang', pet: 'octopus', sweep: 'afterimage', scope: 'mint', killfx: 'fireworks', torpskin: 'shark'"))} readColors();
    const a = put('lighthouse', 30, .8); const b = put('xylophone', 140, .7); for (const ch of 'lightho') { press(ch); step(1); }
    const c2 = put('ox', 250, .5); type(c2); step(-1); G.arsenal.torp = 2; useTorp(b); step(14); petReact('cheer'); step(5); 'ok'`, 400],
  ['l6-paper', `${SETUP(4, 'sector', kit("tracer: 'letter', pet: 'cat', sweep: 'clock', scope: 'sepia', killfx: 'school', torpskin: 'narwhal'"))} prefs.theme = 'light'; applyTheme();
    const a = put('anchor', 20, .7); const b = put('harbour', 200, .65); for (const ch of 'anch') { press(ch); step(2); } const c2 = put('ox', 120, .5); type(c2); step(-1); G.arsenal.torp = 1; useTorp(b); step(12); 'ok'`, 400],
  [null, `prefs.theme = 'dark'; applyTheme(); 'ok'`, 100],
];
