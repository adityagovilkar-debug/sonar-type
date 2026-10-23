// Phase 2, part 4: short mode chips with a description line; krill without labels, spread wider
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };
rep(`          <button class="chip" data-game="sector">Sector · 3 waves + leviathan</button>
          <button class="chip" data-game="descent">Descent · endless</button>
          <button class="chip" data-game="expedition">Expedition · sea chart</button>
          <button class="chip" data-game="daily">Daily dive</button>
          <button class="chip" data-game="drill">Drill · 90 s practice</button>
          <button class="chip" data-game="zen">Zen</button>`, `          <button class="chip" data-game="sector">Sector</button>
          <button class="chip" data-game="descent">Descent</button>
          <button class="chip" data-game="expedition">Expedition</button>
          <button class="chip" data-game="daily">Daily dive</button>
          <button class="chip" data-game="drill">Drill</button>
          <button class="chip" data-game="zen">Zen</button>
          <span class="modenote" id="modeNote"></span>`);
rep(`.modebar .lbl{margin-right:4px}`, `.modebar .lbl{margin-right:4px}
.modenote{font-size:11px;color:var(--ink-3);margin-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}`);
rep(`function buildTiles() {
  document.querySelectorAll('[data-game]').forEach(b => b.classList.toggle('on', b.dataset.game === prefs.game));`, `const MODE_NOTES = {
  sector: 'three waves, then a leviathan',
  descent: 'an endless dive: every 200 m the water changes',
  expedition: 'four legs on a sea chart, then a lair',
  daily: 'one seeded dive a day, with a twist',
  drill: '90 seconds of practice on your weakest letters',
  zen: 'no hull, no weapons, no hurry',
};
function buildTiles() {
  document.querySelectorAll('[data-game]').forEach(b => b.classList.toggle('on', b.dataset.game === prefs.game));
  $('#modeNote').textContent = MODE_NOTES[prefs.game] || '';`);
rep(`    const a = ang + (R() - .5) * .36, dd = d + R() * 70;`, `    const a = ang + (R() - .5) * .6, dd = d + R() * 120;`);
rep(`  else if (w.shot) { meta = \`SHOT  \${hitDamage(w)} DMG\`; mcol = C['pen-1']; }`, `  else if (krill) { meta = ''; mcol = C['ink-3']; }
  else if (w.shot) { meta = \`SHOT  \${hitDamage(w)} DMG\`; mcol = C['pen-1']; }`);
fs.writeFileSync(f, s); console.log('ok');
