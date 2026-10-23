// Smoke-test the packaged app on a throwaway profile (never the real save).
// usage: node tests/packaged.cjs [port]   (build first with npm run dist)
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const port = process.argv[2] || '9431';
const exe = path.join(__dirname, '..', 'dist', 'win-unpacked', 'Sonar Type.exe');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'sonar-app-'));
  const proc = spawn(exe, [`--remote-debugging-port=${port}`, `--user-data-dir=${prof}`], { stdio: 'ignore' });
  let t;
  for (let i = 0; i < 80 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(x => x.type === 'page'); } catch {} if (!t) await sleep(250); }
  if (!t) { console.log('no page'); proc.kill(); process.exit(1); }
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(), errors = [];
  ws.onmessage = m => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description); };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async e => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true }); return r.result?.exceptionDetails ? 'ERR ' + r.result.exceptionDetails.exception?.description : r.result?.result?.value; };
  await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await sleep(2500);
  console.log('boot:', await ev(`JSON.stringify({ v: VERSION, screen, shell: !!window.sonarShell, bank: BANK.size, relics: Object.keys(RELICS).length, commendations: COMMENDATIONS.length })`));
  console.log('logbook:', await ev(`{ const out = []; for (const [k] of LOG_TABS) { openLog(k); out.push(k + ':' + document.querySelector('#lgBody').textContent.length); closeLog(); } out.join(' ') }`));
  console.log('run:', await ev(`{ startRun(3, 'sector'); for (let i = 0; i < 600; i++) update(1 / 60); const w = G.words.find(x => x.kind === 'enemy'); if (w) for (const ch of w.text) press(ch); for (let i = 0; i < 120; i++) update(1 / 60); gameOver('hull'); 'debrief ' + screen + ', archive rows ' + document.querySelectorAll('#dArchive .row').length }`));
  console.log('errors:', errors.length ? errors : 'none');
  ev(`sonarShell.close()`).catch(() => {});
  await sleep(1500); try { proc.kill(); } catch {}
  setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 800);
})();
