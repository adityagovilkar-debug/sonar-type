// Phase 4, part 1: comfort settings (assist speed, text size, colour-blind palette, easy-read words, warm-up,
// keyboard layout) and a Settings screen reachable from the title (O) as well as the pause menu
const fs = require('fs'), f = __dirname + '/../../game/index.html';
let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) { console.log('COUNT', n, 'for', a.slice(0, 100)); process.exit(1); } s = s.replace(a, b); };

// ---- save fields
rep(`prefs.expTier = prefs.expTier | 0; prefs.expTierSel = prefs.expTierSel | 0;`, `prefs.expTier = prefs.expTier | 0; prefs.expTierSel = prefs.expTierSel | 0;
// v4.6: comfort settings, letter pairs, the weekly goal
prefs.comfort = Object.assign({ assist: 1, text: 1, palette: 'standard', easy: false, warmup: false, layout: 'qwerty' }, prefs.comfort);
prefs.pairs = Object.assign({}, prefs.pairs);
prefs.goal = Object.assign({ type: 'wpm', target: 40 }, prefs.goal);
prefs.goalsMet = Object.assign({}, prefs.goalsMet);
prefs.hiAssist = Object.assign({}, prefs.hiAssist);`);

// ---- the palette for colour-blind players (Okabe-Ito), and text size for the panels
rep(`*{box-sizing:border-box}`, `/* colour-blind-safe pens (Okabe-Ito): red, blue and green stay apart for every common colour-vision type */
:root[data-palette="cb"]{--pen-1:#C04A00;--pen-2:#0067A3;--pen-3:#00876A;--pen-4:#B07A00;--pen-5:#A64C88;--pen-6:#7A6A00}
:root[data-palette="cb"][data-theme="dark"]{--pen-1:#E8823A;--pen-2:#56B4E9;--pen-3:#2EC4A0;--pen-4:#E6A817;--pen-5:#CC79A7;--pen-6:#E6D84A}
:root[data-text="1.15"] .panel,:root[data-text="1.15"] .hud{zoom:1.08}
:root[data-text="1.3"] .panel,:root[data-text="1.3"] .hud{zoom:1.16}
*{box-sizing:border-box}`);
// words on the scope: larger, and optionally in a wider, easier-to-read face
rep("  S.font = `500 16px ${MONO}`; S.fontB = `600 20px ${MONO}`; S.fontSm = `500 9px ${MONO}`;",
    "  const ts = prefs.comfort.text, face = prefs.comfort.easy ? 'Verdana, Tahoma, sans-serif' : MONO;\n" +
    "  S.font = `500 ${Math.round(16 * ts)}px ${face}`; S.fontB = `600 ${Math.round(20 * ts)}px ${face}`; S.fontSm = `500 9px ${MONO}`;");
rep("  ctx.font = S.font; S.cw = ctx.measureText('m').width;", "  // each letter sits in its own cell; easy-read words get roomier cells\n  ctx.font = S.font; S.cw = ctx.measureText('m').width * (prefs.comfort.easy ? 1.12 : 1);");
rep(`  const chipW = Math.max(1, len) * cw + padX * 2, chipH = boss ? 34 : 26;`, `  const chipW = Math.max(1, len) * cw + padX * 2, chipH = Math.round((boss ? 34 : 26) * (legend ? 1 : prefs.comfort.text));`);
rep(`function applyTheme() {
  document.documentElement.dataset.theme = prefs.theme; readColors(); resize();`, `function applyTheme() {
  const de = document.documentElement;
  de.dataset.theme = prefs.theme; de.dataset.palette = prefs.comfort.palette; de.dataset.text = String(prefs.comfort.text);
  readColors(); resize();`);

// ---- the settings: one list, drawn on the title's Settings screen and in the pause menu
rep(`function syncToggles() {`, `const LAYOUTS = {
  qwerty: ['QWERTY', ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']],
  qwertz: ['QWERTZ', ['qwertzuiop', 'asdfghjkl', 'yxcvbnm']],
  azerty: ['AZERTY', ['azertyuiop', 'qsdfghjklm', 'wxcvbn']],
  dvorak: ['Dvorak', ['   pyfgcrl', 'aoeuidhtns', ' qjkxbmwvz']],
  colemak: ['Colemak', ['qwfpgjluy', 'arstdhneio', 'zxcvbkm']],
};
const COMFORT = [
  ['assist', 'Assist speed', () => prefs.comfort.assist === 1 ? 'off' : Math.round(prefs.comfort.assist * 100) + '%', [1, .9, .8, .7],
    'Contacts move slower. Records set this way are marked assisted.'],
  ['text', 'Text size', () => ({ 1: 'normal', 1.15: 'large', 1.3: 'larger' })[prefs.comfort.text], [1, 1.15, 1.3], 'Bigger words on the scope, and bigger panels.'],
  ['palette', 'Colours', () => prefs.comfort.palette === 'cb' ? 'colour-blind safe' : 'standard', ['standard', 'cb'],
    'A palette that keeps red, green and blue apart for colour-blind eyes.'],
  ['easy', 'Easy-read words', () => prefs.comfort.easy ? 'on' : 'off', [false, true], 'Verdana with wider spacing, the kind of face dyslexia guides suggest.'],
  ['warmup', 'Warm-up', () => prefs.comfort.warmup ? 'on' : 'off', [false, true], '30 s on your weak letters before Sector and Descent runs. Enter skips it.'],
  ['layout', 'Keyboard layout', () => LAYOUTS[prefs.comfort.layout][0], Object.keys(LAYOUTS), 'For the Logbook\\u2019s keyboard heatmap and finger map.'],
];
function comfortRows() {
  return COMFORT.map(([k, nm, val, , help]) => \`<button class="tog cft" data-cft="\${k}" title="\${help}"><span class="k">\${nm}</span><span class="val"><b>\${val()}</b></span></button>\`).join('');
}
function cycleComfort(k) {
  const row = COMFORT.find(r => r[0] === k), opts = row[3], i = opts.indexOf(prefs.comfort[k]);
  prefs.comfort[k] = opts[(i + 1) % opts.length]; savePrefs();
  if (k === 'text' || k === 'palette' || k === 'easy') applyTheme();
  renderComfort(); sfx.ui();
}
function renderComfort() {
  for (const el of document.querySelectorAll('.cftList')) el.innerHTML = comfortRows();
  document.querySelectorAll('[data-cft]').forEach(b => b.onclick = () => { ensureAudio(); cycleComfort(b.dataset.cft); });
  const help = $('#setHelp'); if (help) help.innerHTML = COMFORT.map(([, nm, , , h]) => \`<p><b>\${nm}</b> \${h}</p>\`).join('');
}
function openSettings() { ensureAudio(); setScreen('settings'); renderComfort(); syncToggles(); sfx.ui(); }
function syncToggles() {`);
rep(`            <button class="tog" id="togAdapt2"><span class="k">Adaptive words <kbd>A</kbd></span><span class="sw"></span></button>
          </div>`, `            <button class="tog" id="togAdapt2"><span class="k">Adaptive words <kbd>A</kbd></span><span class="sw"></span></button>
            <div class="cftList"></div>
          </div>`);
rep(`    <div class="overlay" id="ovPause">`, `    <div class="overlay" id="ovSet">
      <div class="unit panel rise" style="width:min(760px,100%)">
        <div class="th"><div><div class="no">SETTINGS</div><h1>Comfort <span>everything here is saved with your progress</span></h1></div></div>
        <div class="pgrid">
          <div>
            <div class="sech" style="margin-top:0"><span class="lbl">Sound and look</span></div>
            <button class="tog" data-set="sound"><span class="k">Sound <kbd>M</kbd></span><span class="sw"></span></button>
            <button class="tog" data-set="music"><span class="k">Music <kbd>U</kbd></span><span class="sw"></span></button>
            <button class="tog" data-set="theme"><span class="k">Theme <kbd>T</kbd></span><span class="val"></span></button>
            <button class="tog" data-set="shake"><span class="k">Screen shake</span><span class="sw"></span></button>
            <button class="tog" data-set="adaptive"><span class="k">Adaptive words</span><span class="sw"></span></button>
            <div class="sech"><span class="lbl">Comfort</span></div>
            <div class="cftList"></div>
          </div>
          <div class="sethelp" id="setHelp"></div>
        </div>
        <div class="foot"><button class="btn pri" id="btnSetBack">Back <kbd>Esc</kbd></button><span>click a row to change it</span></div>
      </div>
    </div>

    <div class="overlay" id="ovPause">`);
rep(`body[data-screen="log"] #ovLog{display:flex}`, `body[data-screen="log"] #ovLog{display:flex}
body[data-screen="settings"] #ovSet{display:flex}
.sethelp p{margin:0 0 10px;font-size:11.5px;line-height:1.5;color:var(--ink-3)}
.sethelp b{color:var(--ink-2);display:block;font-weight:600}`);
rep(`  $('#togAdapt2').classList.toggle('on', !!prefs.adaptive); $('#togAdaptive').classList.toggle('on', !!prefs.adaptive);`,
    `  $('#togAdapt2').classList.toggle('on', !!prefs.adaptive); $('#togAdaptive').classList.toggle('on', !!prefs.adaptive);
  const sv = { sound: prefs.sound, music: prefs.music, shake: prefs.shake, adaptive: !!prefs.adaptive };
  document.querySelectorAll('[data-set]').forEach(b => {
    const k = b.dataset.set;
    if (k === 'theme') b.querySelector('.val').innerHTML = prefs.theme === 'dark' ? '<b>backlit</b> · paper' : 'backlit · <b>paper</b>';
    else b.classList.toggle('on', !!sv[k]);
  });`);
rep(`<button class="btn" id="btnLog" style="margin-left:8px">Logbook <kbd>L</kbd></button>`, `<button class="btn" id="btnSet" style="margin-left:8px">Settings <kbd>O</kbd></button><button class="btn" id="btnLog">Logbook <kbd>L</kbd></button>`);
rep(`$('#btnDock').onclick = () => openDock();`, `$('#btnDock').onclick = () => openDock();
$('#btnSet').onclick = openSettings;
$('#btnSetBack').onclick = () => setScreen('title');
document.querySelectorAll('[data-set]').forEach(b => b.onclick = () => {
  ensureAudio();
  const k = b.dataset.set;
  if (k === 'sound') toggleSound(); else if (k === 'music') toggleMusic(); else if (k === 'theme') toggleTheme(); else if (k === 'shake') toggleShake(); else toggleAdaptive();
  syncToggles();
});`);
rep(`    else if (k === 'd') openDock();`, `    else if (k === 'd') openDock();
    else if (k === 'o') openSettings();`);
rep(`  } else if (screen === 'log') {`, `  } else if (screen === 'settings') {
    if (e.key === 'Escape' || k === 'o') setScreen('title');
  } else if (screen === 'log') {`);
rep(`function pause() { if (screen === 'play') { G.armHeld = false; setScreen('paused'); syncToggles();`, `function pause() { if (screen === 'play') { G.armHeld = false; setScreen('paused'); syncToggles(); renderComfort();`);
rep(`G.sim = s === 'title' || s === 'play' || s === 'dock' || (s === 'log' && G.mode === 'demo');`, `G.sim = s === 'title' || s === 'play' || s === 'dock' || s === 'settings' || (s === 'log' && G.mode === 'demo');`);
rep(`dock: ['DRY DOCK', 'var(--pen-4)'], log: ['LOGBOOK', 'var(--pen-3)'],`, `dock: ['DRY DOCK', 'var(--pen-4)'], log: ['LOGBOOK', 'var(--pen-3)'], settings: ['SETTINGS', 'var(--ink-2)'],`);
rep(`    title: 'standing by · choose a mode and difficulty', log:`, `    title: 'standing by · choose a mode and difficulty', settings: 'settings', log:`);
rep(`const inRun = screen !== 'title' && screen !== 'dock' && screen !== 'log';`, `const inRun = screen !== 'title' && screen !== 'dock' && screen !== 'log' && screen !== 'settings';`);

// ---- assist speed: contacts slower; records set with it are marked
rep(`  const pace = (G.press.deep ? 1.15 : 1)`, `  const pace = (G.mode === 'play' ? prefs.comfort.assist : 1) * (G.press.deep ? 1.15 : 1)`);
rep(`    if (G.points > 0 && (prevBest == null || G.points > prevBest)) { hi[G.diff] = G.points; isNew = true; }`,
    `    if (G.points > 0 && (prevBest == null || G.points > prevBest)) {
      hi[G.diff] = G.points; isNew = true;
      // a record set with assist on is kept, and marked
      const ak = G.game + ':' + G.diff;
      if (prefs.comfort.assist < 1) prefs.hiAssist[ak] = prefs.comfort.assist; else delete prefs.hiAssist[ak];
    }`);
rep(`  $('#dSub').textContent = \`\${daily ? 'daily dive ' + daily.key : G.game}`, `  $('#dSub').textContent = \`\${prefs.comfort.assist < 1 ? 'assisted ' + Math.round(prefs.comfort.assist * 100) + '% · ' : ''}\${daily ? 'daily dive ' + daily.key : G.game}`);
rep(`      hi[G.diff] = G.points; isNew = true;`, `      hi[G.diff] = G.points; isNew = true;`);
rep(`  const runWpm = wpm(), L = prefs.life;`, `  const runWpm = wpm(), L = prefs.life, assisted = prefs.comfort.assist < 1 ? prefs.comfort.assist : undefined;`);
rep(`    kills: G.kills, secs: Math.round(G.t), medal, kind, combo: G.bestCombo });`, `    kills: G.kills, secs: Math.round(G.t), medal, kind, combo: G.bestCombo, assist: assisted });`);
fs.writeFileSync(f, s); console.log('ok');
