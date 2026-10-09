/* Sonar Type: save transfer.
 *
 * Shared by the game (installed app and browser) and the game's page on
 * adityagovilkar.com, which copies this file in, so the two always agree on
 * the format. Everything the game remembers is one object in one storage key;
 * a save file is that object with a small header around it:
 *
 *   { app: 'sonar-type', format: 1, version, exported, from, save: {...} }
 *
 * Importing never throws the old save away: it is kept under a second key and
 * can be switched back to, so a wrong file is one click from undone.
 */
(function () {
  'use strict';
  var STORE = 'sonar-type.v2';
  var KEPT = 'sonar-type.v2.kept';
  var KEPT_AT = 'sonar-type.v2.kept-at';
  var FORMAT = 1;
  var MAX_BYTES = 5e6;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { localStorage.setItem(k, v); }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function parseObj(raw) {
    try { var o = JSON.parse(raw); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch (e) { return null; }
  }

  /** The save in this browser or app, or null if there is none yet. */
  function read() { var raw = get(STORE); return raw ? parseObj(raw) : null; }

  function sum(o) { var s = 0; for (var k in o || {}) s = Math.max(s, +o[k] || 0); return s; }

  /** The handful of numbers a person recognises their own save by. */
  function summary(p) {
    if (!p) return null;
    var hi = p.hi || {}, life = p.life || {}, hist = Array.isArray(p.history) ? p.history : [];
    var medals = p.medals || {}, gold = 0, n = 0;
    for (var k in medals) { n++; if (medals[k] === 'gold') gold++; }
    var best = Math.max(sum(hi.sector), sum(hi.patrol), sum(hi.expedition), sum(hi.drill));
    return {
      runs: p.runs | 0,
      salvage: p.salvage | 0,
      salvageTotal: p.salvageTotal | 0,
      destroyed: life.words | 0,
      secs: life.secs | 0,
      bestScore: best,
      bestWpm: life.bestWpm | 0,
      medals: n,
      gold: gold,
      owned: Object.keys(p.owned || {}).length,
      logged: hist.length,
      lastPlayed: hist.length ? hist[hist.length - 1].at : null,
    };
  }

  function stamp(d) {
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /** Wrap a save for export. `from` says where it came from, for the reader. */
  function pack(save, version, from) {
    return { app: 'sonar-type', format: FORMAT, version: version, exported: new Date().toISOString(), from: from, save: save };
  }

  /** Hand the save to the person as a .json file. */
  function download(file) {
    var blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sonar-type-save-' + stamp(new Date()) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /** Check a file's text. Returns { ok, file } or { ok: false, why } in plain words. */
  function parse(text) {
    var no = function (why) { return { ok: false, why: why }; };
    if (!text || text.length > MAX_BYTES) return no("That file is too large to be a Sonar Type save.");
    var f = parseObj(text);
    if (!f) return no("That file isn't a Sonar Type save: it isn't readable as one.");
    if (f.app !== 'sonar-type' || !f.save || typeof f.save !== 'object' || Array.isArray(f.save)) {
      return no("That file isn't a Sonar Type save.");
    }
    if ((f.format | 0) > FORMAT) {
      return no('That save comes from a newer Sonar Type (v' + f.version + '). Update this copy first.');
    }
    return { ok: true, file: f };
  }

  /** Set by apply/swap, so the game can't write its old in-memory save back over the new one before it reloads. */
  var api = { locked: false };

  /** Replace the save with the file's, keeping the current one aside. The caller reloads. */
  function apply(file) {
    var cur = get(STORE);
    if (cur) { set(KEPT, cur); set(KEPT_AT, new Date().toISOString()); }
    set(STORE, JSON.stringify(file.save));
    api.locked = true;
  }

  /** The save kept aside by the last import, if any. */
  function kept() {
    var raw = get(KEPT);
    if (!raw) return null;
    var p = parseObj(raw);
    return p ? { at: get(KEPT_AT), summary: summary(p) } : null;
  }

  /** Swap the current save and the kept one. Doing it twice puts things back. */
  function swap() {
    var k = get(KEPT);
    if (!k) return false;
    var cur = get(STORE);
    set(STORE, k);
    if (cur) { set(KEPT, cur); set(KEPT_AT, new Date().toISOString()); } else { del(KEPT); del(KEPT_AT); }
    api.locked = true;
    return true;
  }

  api.STORE = STORE;
  api.FORMAT = FORMAT;
  api.read = read;
  api.summary = summary;
  api.pack = pack;
  api.download = download;
  api.parse = parse;
  api.apply = apply;
  api.kept = kept;
  api.swap = swap;
  window.SonarSave = api;
})();
