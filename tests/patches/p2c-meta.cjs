// Phase 2, part 3: commendations, bestiary, tips and the contact key for the new contacts and modes
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

rep(`  ['runs100', 'A hundred runs', 'Finish a hundred runs.', 150, () => prefs.runs >= 100],`, `  ['runs100', 'A hundred runs', 'Finish a hundred runs.', 150, () => prefs.runs >= 100],
  ['daily1', 'Dawn dive', 'Log your first daily dive.', 50, () => Object.keys(prefs.daily).length >= 1],
  ['daily7', 'Seven tides', 'Log a daily dive seven days in a row.', 250, () => dailyStreak() >= 7],
  ['depth500', 'Midnight', 'Reach 500 m in Descent.', 120, () => Math.max(0, ...Object.values(prefs.deepest)) >= 500],
  ['depth1000', 'Hadal', 'Reach 1,000 m in Descent.', 300, () => Math.max(0, ...Object.values(prefs.deepest)) >= 1000],
  ['convoy', 'Convoy', 'Let 5 allies pass in one run.', 80, r => (r.by.ally || 0) >= 5],
  ['krill', 'Krill fisher', 'Destroy 30 krill in one run.', 80, r => (r.by.krill || 0) >= 30],
  ['gatebreaker', 'Gatebreaker', 'Destroy 5 wardens in one run.', 80, r => (r.by.warden || 0) >= 5],
  ['still_water', 'Still water', 'Spend half an hour in Zen in all.', 80, () => (prefs.life.zen || 0) >= 1800],`);
rep(`  ['relic', 'Relic', 'Something the Archive kept apart from the rest.'],`, `  ['relic', 'Relic', 'Something the Archive kept apart from the rest.'],
  ['ally', 'Ally', 'A friendly sub crossing the shelf. Let it pass and it pays for the courtesy.'],
  ['krill', 'Krill', 'A cloud of single letters. Harmless alone, not in numbers.'],
  ['mimic', 'Mimic', 'It keeps changing its mind about which word it is, until you commit.'],
  ['diver', 'Diver', 'Goes under for a breath of quiet and comes up closer.'],
  ['warden', 'Warden', 'Holds a ring of words safe from the scope until it falls.'],
  ['fading', 'Fading', 'Its letters give out as it closes in. Read it early.'],`);
rep(`const beastKey = w => w.kind === 'boss' ? (w.btype || 'leviathan') : w.kind === 'crate' ? 'crate' :`, `const beastKey = w => w.kind === 'boss' ? (w.btype || 'leviathan') : w.kind === 'crate' ? 'crate' : w.kind === 'ally' ? 'ally' :`);
rep(`  shot: ['ox', { shot: true }], crate: ['supplies', { kind: 'crate', ctype: 'repair' }], relic: ['fathom', { relic: true }],`,
    `  shot: ['ox', { shot: true }], crate: ['supplies', { kind: 'crate', ctype: 'repair' }], relic: ['fathom', { relic: true }],
  ally: ['convoy', { kind: 'ally' }], krill: ['q', { trait: 'krill' }], mimic: ['shifting', { trait: 'mimic' }], diver: ['plunge', { trait: 'diver' }],
  warden: ['keeper', { trait: 'warden' }], fading: ['ghostly', { trait: 'fading' }],`);
rep(`  ['fathom', { relic: true }, 'Relic',`, `  ['convoy', { kind: 'ally' }, 'Ally', 'Blue, with an ALLY flag: a friendly sub crossing. Typing it out is friendly fire. Let it pass for a bonus.'],
  ['q', { trait: 'krill' }, 'Krill', 'Single letters in a cloud. Each one that gets through chips the hull a little.'],
  ['shifting', { trait: 'mimic' }, 'Mimic', 'A shimmering frame: it keeps turning into other words until you type its first letter.'],
  ['plunge', { trait: 'diver' }, 'Diver', 'Goes under now and then (bubbles show where) and comes up closer. Untouchable while under.'],
  ['keeper', { trait: 'warden' }, 'Warden', 'Teal ring: words inside it are padlocked until the warden is destroyed.'],
  ['ghostly', { trait: 'fading' }, 'Fading', 'Its letters fade away as it closes in. Read it early, or ping to see it again.'],
  ['fathom', { relic: true }, 'Relic',`);
rep(`  shot:   ['SHOT',`, `  ally:   ['ALLY', 'A friendly sub with a blue ALLY flag is crossing. Do not type it out: that is friendly fire. Let it pass for a bonus. Backspace drops a lock on it.'],
  krill:  ['KRILL', 'A cloud of single letters. Each is one keystroke; each that gets through chips the hull a little.'],
  mimic:  ['MIMIC', 'The shimmering word keeps changing. Type its first letter and it is stuck as that word.'],
  diver:  ['DIVER', 'It goes under now and then (watch the bubbles), moves faster down there, and comes up closer. You cannot type it while it is under.'],
  warden: ['WARDEN', 'The teal ring padlocks every word inside it. Destroy the warden first.'],
  fading: ['FADING', 'Its letters fade as it gets closer. Read it early, or ping (/) to see it again.'],
  shot:   ['SHOT',`);
// the pause screen's contact key is longer now: let it scroll
rep(`.keyrow{`, `#keyList{max-height:58vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--rule-strong) transparent;padding-right:4px}
.keyrow{`);
// Logbook progress: the daily streak and the deepest dive
rep(`    if (H.length < 2) html += \`<p style="color:var(--ink-3);font-size:12px;margin:18px 0 6px">`, `    const dives = Object.entries(prefs.daily), deepest = Math.max(0, ...Object.values(prefs.deepest));
    if (dives.length || deepest) html += \`<div class="sech"><span class="lbl">Daily dives and Descent</span></div>\`
      + r('var(--pen-2)', 'Daily dives logged', \`\${dives.length} · streak \${dailyStreak()} · best \${dives.length ? fmtPts(Math.max(...dives.map(([, d]) => d.pts))) : '–'}\`)
      + r('var(--pen-3)', 'Deepest dive', deepest ? \`\${deepest} m\` : '–');
    if (H.length < 2) html += \`<p style="color:var(--ink-3);font-size:12px;margin:18px 0 6px">`);
fs.writeFileSync(f, s); console.log('ok');
