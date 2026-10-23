// Drives the game in headless Edge with a throwaway profile, so no real save is ever touched.
// usage: node tests/run.cjs <steps-file> [url] [outDir] [port]
//   The steps file exports [[name, js, waitMs], ...]. Each js runs in the page; a step with a name also saves a
//   1360x860 screenshot to outDir/<name>.png. Whatever the js returns is printed.
// Serve the game first, for example: python -m http.server 8420 --directory game
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const [stepsFile, url = 'http://localhost:8420/', outDir = path.join(os.tmpdir(), 'sonar-shots'), port = '9420'] = process.argv.slice(2);
const STEPS = require(path.resolve(stepsFile));
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'sonar-run-'));
  const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${port}`, '--window-size=1360,860', '--force-device-scale-factor=1',
    '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required', `--user-data-dir=${prof}`, url], { stdio: 'ignore' });
  let target;
  for (let i = 0; i < 80 && !target; i++) {
    try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(t => t.type === 'page'); } catch {}
    if (!target) await sleep(250);
  }
  if (!target) { console.error('no page target'); proc.kill(); process.exit(1); }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = new Map(), errors = [];
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async expr => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true }); return r.result?.exceptionDetails ? 'ERR ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text) : r.result?.result?.value; };
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 860, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.bringToFront');
  await sleep(2500);
  await evaluate(`window.removeEventListener('blur', pause); 'ok'`);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [name, js, wait] of STEPS) {
    const r = await evaluate(`{ ${js} }`);
    await sleep(wait || 300);
    if (name) {
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(outDir, name + '.png'), Buffer.from(shot.result.data, 'base64'));
    }
    console.log(name || '-', '|', typeof r === 'string' ? r.slice(0, 400) : JSON.stringify(r));
  }
  if (errors.length) console.log('PAGE ERRORS:', errors.slice(0, 8));
  ws.close(); proc.kill();
  setTimeout(() => { try { fs.rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(0); }, 600);
})();
