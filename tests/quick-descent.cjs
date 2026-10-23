// a short subset: the Hadal leviathan, plus how deep simulated typists get in Descent
const { SIM } = require('./lib.cjs');
const all = require('./newwater.cjs');
module.exports = [
  all.find(s => /hadal leviathan/.test(s[1])),
  [null, SIM, 30],
  [null, `JSON.stringify(sim(2, 'descent', 35, {}, .03, 600))`, 30],
  [null, `JSON.stringify(sim(4, 'descent', 50, {}, .03, 600))`, 30],
  [null, `JSON.stringify(sim(6, 'descent', 75, {}, .03, 600))`, 30],
  [null, `JSON.stringify(sim(8, 'descent', 100, {}, .03, 600))`, 30],
];
