// Run from /workspaces/jeu-video: node tests/third_person_camera.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('/workspaces/0ad/binaries/data/mods/public/gui/session/third_person_camera.js', 'utf8');
const calls = [];
let selected;
const entities = { 101: { classes: ['Unit', 'Soldier'] }, 202: { classes: ['Structure'] } };
const env = {
  Engine: { CameraFollowThirdPerson: id => calls.push(id) },
  g_Selection: { getFirstSelected: () => selected },
  GetEntityState: id => entities[id],
  hasClass: (state, className) => state.classes.includes(className)
};
vm.createContext(env);
vm.runInContext(source, env);
assert.equal(env.g_ThirdPersonCameraEnabled, true);
selected = 101;
env.updateThirdPersonCamera();
assert.equal(calls.at(-1), 101, 'selecting a unit enables the low follow camera');
selected = 202;
env.updateThirdPersonCamera();
assert.equal(calls.at(-1), 0, 'selecting a building clears the character camera');
selected = 101;
env.toggleThirdPersonCamera();
assert.equal(env.g_ThirdPersonCameraEnabled, false);
assert.equal(calls.at(-1), 0, 'F switches back to the normal RTS camera');
const count = calls.length;
env.updateThirdPersonCamera();
assert.equal(calls.length, count, 'selection changes do not reenable a disabled mode');
env.toggleThirdPersonCamera();
assert.equal(calls.at(-1), 101, 'F enables follow again');
delete entities[101];
env.updateThirdPersonCamera();
assert.equal(calls.at(-1), 0, 'a missing/dead unit cannot remain the focus');
console.log('PASS: selection, building, F toggle, stale entity (native API mocked).');
