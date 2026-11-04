// Execute in the Codespace: node /workspaces/jeu-video/tests/character_commands.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('/workspaces/0ad/binaries/data/mods/public/simulation/helpers/Commands.js', 'utf8');
const calls = [];
let position = {x: 3, y: 9};
const unitAI = {
  Walk: (...args) => calls.push(['walk', ...args]),
  SetSpeedMultiplier: value => calls.push(['speed', value]),
  GetRunMultiplier: () => 1.67
};
const components = {
  Identity: { HasClass: cl => cl === 'Unit' },
  Position: { IsInWorld: () => true, GetPosition2D: () => position },
  UnitMotion: { GetSpeed: () => 9 }
};
const env = {
  Engine: { QueryInterface: (_id, iid) => components[iid], RegisterGlobal: () => {} },
  IID_Identity: 'Identity', IID_Position: 'Position', IID_UnitMotion: 'UnitMotion',
  NULL_FORMATION: null,
  GetFormationUnitAIs: entities => entities.length === 1 ? [unitAI] : []
};
vm.createContext(env);
vm.runInContext(source, env);
// Commands.js also defines GetFormationUnitAIs; replace it with the focused stub.
env.GetFormationUnitAIs = entities => entities.length === 1 ? [unitAI] : [];
const move = env.g_Commands['character-move'];
assert.equal(typeof move, 'function');
const cmd = { x: 10, z: 20, sprint: false };
move(1, cmd, {entities: [11]});
assert.equal(calls.length, 2);
assert.deepEqual(calls[0], ['walk', 10, 20, false, false]);
assert.deepEqual(calls[1], ['speed', 1]);
move(1, { ...cmd, sprint: true }, {entities: [11]});
assert.deepEqual(calls.at(-1), ['speed', 1.67], 'sprint uses the unit template run multiplier');
function rejected(message, action) {
  const n = calls.length; action(); assert.equal(calls.length, n, message);
}
rejected('not owner-filtered', () => move(1, cmd, {entities: []}));
rejected('cannot issue group movement', () => move(1, cmd, {entities: [11, 12]}));
rejected('cannot send distant destination', () => move(1, { ...cmd, x: 500 }, {entities: [11]}));
rejected('cannot send non-finite destination', () => move(1, { ...cmd, x: NaN }, {entities: [11]}));
rejected('sprint must be boolean', () => move(1, { ...cmd, sprint: 'yes' }, {entities: [11]}));
components.Identity.HasClass = () => false;
rejected('only units can move', () => move(1, cmd, {entities: [11]}));
components.Identity.HasClass = cl => cl === 'Unit';
components.Position.IsInWorld = () => false;
rejected('garrisoned unit cannot move', () => move(1, cmd, {entities: [11]}));
console.log('PASS: simulation controls honor ownership filter, range/class validation and template sprint speed.');
