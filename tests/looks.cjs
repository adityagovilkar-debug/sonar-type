// v4.8 (Dry Dock cosmetics): tracer flight paths, torpedo skins, kill effects, sweeps, Prism, companions, sound packs, the Dock
const { check, SIM } = require('./lib.cjs');
const OWN_ALL = `for (const [kind, cat] of [['tracer', TRACERS], ['scope', SCOPES], ['killfx', KILLFX], ...Object.entries(LOOKS)]) for (const k of Object.keys(cat)) if (cat[k].cost) prefs.owned[kind + ':' + k] = true;`;
module.exports = [
  check('paths end on target', `const out = [];
    for (const st of Object.keys(TRACER_PATHS)) { let bad = 0, maxOff = 0;
      for (let n = 0; n < 40; n++) { const tr = { sx: 100 + n, sy: 300, tx: 500 - n * 3, ty: 80 + n * 4, kick: n % 2 ? .25 : -.25, idx: n };
        for (let i = 0; i <= 60; i++) { const q = trPos(tr, i / 60, st); if (!isFinite(q.x) || !isFinite(q.y)) bad++; }
        const e = trPos(tr, 1, st); maxOff = Math.max(maxOff, Math.hypot(e.x - tr.tx, e.y - tr.ty)); }
      out.push(st + (bad ? ' NaN×' + bad : '') + ' end ' + maxOff.toFixed(2)); }
    return out.join(', ');`),
  check('tracers in flight', `${OWN_ALL} const out = []; for (const st of Object.keys(TRACERS)) { prefs.loadout.tracer = st; applyKit('play'); G.words = []; const w = put('lighthouse', 40, .7); let err = '';
      try { for (const ch of 'light') { press(ch); step(3); render(); } step(30); render(); } catch (e) { err = e.message; } out.push(st + (err ? ' ERR ' + err : ':' + w.landed)); }
    prefs.loadout.tracer = 'hull'; applyKit('play'); return out.join(' ');`),
  check('kill effects', `${OWN_ALL} const out = []; for (const k of Object.keys(KILLFX)) { prefs.loadout.killfx = k; applyKit('play'); G.words = []; G.fx = []; const w = put('marine', 200, .6); let err = '';
      try { type(w); const kinds = [...new Set(G.fx.map(f => f.k))].join('/'); step(20); render(); out.push(k + ':' + kinds.length); } catch (e) { out.push(k + ' ERR ' + e.message); } }
    prefs.loadout.killfx = 'burst'; applyKit('play'); return out.join(' ');`),
  check('torpedo skins', `${OWN_ALL} const out = []; for (const k of Object.keys(TORPSKINS)) { prefs.loadout.torpskin = k; G.words = []; G.torps = []; const w = put('submarine', 120, .8); G.arsenal.torp = 1; let err = '';
      try { useTorp(w); for (let i = 0; i < 20; i++) { update(1 / 60); render(); } } catch (e) { err = e.message; } out.push(k + (err ? ' ERR ' + err : ' ok') + ' look=' + look('torpskin')); }
    prefs.loadout.torpskin = 'classic'; return out.join(', ');`),
  check('sweeps + prism', `${OWN_ALL} const out = []; for (const k of Object.keys(SWEEPS)) { prefs.loadout.sweep = k; let err = ''; try { for (let i = 0; i < 5; i++) { update(1 / 60); render(); } } catch (e) { err = e.message; } out.push(k + (err ? ' ERR ' + err : ' ok')); }
    prefs.loadout.sweep = 'classic'; prefs.loadout.scope = 'prism'; render(); const c1 = C.sonar; const t0 = performance.now(); while (performance.now() - t0 < 120) {} render(); const c2 = C.sonar;
    prefs.loadout.scope = 'teal'; readColors(); render();
    return out.join(', ') + ' | prism ' + c1 + ' -> ' + c2 + ', back to teal ' + C.sonar;`),
  check('companions', `${OWN_ALL} const out = []; for (const k of Object.keys(PETS)) { prefs.loadout.pet = k; let err = '';
      try { for (const m of ['idle', 'happy', 'cheer', 'hurt', 'oops']) { petReact(m); for (let i = 0; i < 4; i++) { update(1 / 60); render(); } } } catch (e) { err = e.message; } out.push(k + (err ? ' ERR ' + err : ' ok')); }
    G.words = []; const w = put('anchor', 0, .3, { speed: 400 }); prefs.loadout.pet = 'puffer'; PET.mood = 'idle'; for (let i = 0; i < 30; i++) update(1 / 60); const hurt = PET.mood + ' puff ' + PET.puff.toFixed(2);
    const w2 = put('ox', 90, .6); type(w2); const happy = PET.mood; prefs.loadout.pet = 'none';
    return out.join(', ') + ' | hit: ' + hurt + ', kill: ' + happy;`),
  check('sound packs', `${OWN_ALL} const out = []; ensureAudio(); for (const k of Object.keys(SOUNDPACKS)) { prefs.loadout.sound = k; let err = ''; try { sfx.fire(0, 440); sfx.ding(0); soundDemo(k); } catch (e) { err = e.message; } out.push(k + (err ? ' ERR ' + err : ' ok')); }
    prefs.loadout.sound = 'sonar'; return 'audio ' + (actx ? actx.state : 'none') + ' | ' + out.join(', ');`),
  check('dry dock', `quitToTitle(); prefs.owned = {}; prefs.salvage = 5000; prefs.loadout = { hull: 'skiff', torp: 'torpedo', pulse: 'pulse', nuke: 'nuke', tracer: 'hull' }; openDock('crew');
    const tabs = document.querySelectorAll('#dkTabs [data-tab]').length, rows = document.querySelectorAll('#dkBody .slotrow').length, items = document.querySelectorAll('#dkBody .item').length, show = !$('#dkShow').hidden;
    document.querySelector('#dkBody .item[data-key="cat"] [data-buy]').click(); const cat = owns('pet', 'cat') + ' fitted ' + look('pet') + ' salvage ' + prefs.salvage;
    openDock('tracers'); const proj = document.querySelectorAll('#dkBody .item').length; openDock('scope'); const scopeRows = document.querySelectorAll('#dkBody .slotrow').length;
    openDock('hulls'); const showHulls = !$('#dkShow').hidden;
    const sale = shopList().filter(i => LOOKS[i.kind]).length;
    ${OWN_ALL} openDock('crew'); surpriseMe(); const lo = prefs.loadout, legal = [['tracer', lo.tracer], ['scope', lo.scope], ['killfx', lo.killfx], ...Object.keys(LOOKS).map(k => [k, lo[k]])].every(([k, v]) => v === 'hull' || owns(k, v));
    const st = awardCommendations({ by: {} }).map(h => h.id).filter(id => id === 'stylist' || id === 'wardrobe');
    closeDock();
    return 'tabs ' + tabs + ', crew rows ' + rows + ' items ' + items + ', showroom ' + show + ' (hulls tab ' + showHulls + ') | bought cat ' + cat + ' | projectiles items ' + proj + ', scope rows ' + scopeRows + ' | new looks for sale ' + sale + ' | surprise all owned ' + legal + ' | honours ' + st.join(',') + ' bought ' + looksBought() + '/' + looksForSale();`),
  [null, SIM, 30],
  [null, `${OWN_ALL} JSON.stringify(sim(5, 'sector', 60, { loadout: { tracer: 'bee', killfx: 'fireworks', torpskin: 'duck', sweep: 'lighthouse', pet: 'octopus', sound: 'squeak', scope: 'prism' } }))`, 30],
  [null, `JSON.stringify(sim(4, 'descent', 50, { loadout: { tracer: 'orbit', killfx: 'school', torpskin: 'narwhal', sweep: 'clock', pet: 'cat', sound: 'typewriter', scope: 'sakura' } }, .03, 200))`, 30],
];
