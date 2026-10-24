// screenshots of the v4.9 hull designs: the Hulls shelf with its design row, and a few designs in play
const { SETUP } = require('./lib.cjs');
const still = `document.head.insertAdjacentHTML('beforeend', '<style>.rise{animation:none!important}</style>');`;
const OWN = `for (const k of Object.keys(HULLSKINS)) if (HULLSKINS[k].cost) prefs.owned['hullskin:' + k] = true; delete prefs.owned['hullskin:teacup'];`;
const kit = o => `{ hull: 'skiff', torp: 'torpedo', pulse: 'pulse', nuke: 'nuke', tracer: 'hull', ${o} }`;
const play = (skin, theme) => `${SETUP(4, 'sector', kit(`hullskin: '${skin}', pet: 'duck'`))} prefs.theme = '${theme}'; applyTheme();
  const a = put('lantern', 60, .55); put('harbour', 200, .7); for (const ch of 'lan') { press(ch); step(2); } step(10); 'ok'`;
module.exports = [
  [null, `${still} ${OWN} prefs.salvage = 640; prefs.campaign.ending = 'keep'; prefs.loadout.hullskin = 'compass'; quitToTitle(); openDock('hulls'); 'ok'`, 400],
  ['h1-shelf', `document.querySelector('#dkBody').scrollTop = 520; 'ok'`, 1000],
  ['h2-shelf-top', `document.querySelector('#dkBody').scrollTop = 0; 'ok'`, 800],
  ['h3-eye', `closeDock(); ${play('eye', 'dark')}`, 300],
  ['h4-wheel', play('wheel', 'light'), 300],
  ['h5-sub', play('sub', 'dark'), 300],
  [null, `prefs.theme = 'dark'; applyTheme(); 'ok'`, 100],
];
