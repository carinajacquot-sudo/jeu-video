// Execute in the Codespace: node /workspaces/jeu-video/tests/character_controller.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const base = '/workspaces/0ad/binaries/data/mods/public/';
const commands = [];
const camera = [];
const down = new Set();
const hint = { hidden: true, caption: '' };
let tick = 1000, paused = false, followed = 0;
const states = {
  11: { player: 1, identity: { classes: ['Unit', 'Infantry'], controllable: true },
    unitAI: {}, position: {x: 10, y: 0, z: 20}, rotationY: 0 },
  12: { player: 1, identity: { classes: ['Unit', 'Hero', 'Infantry'], controllable: true },
    unitAI: {}, position: {x: 20, y: 0, z: 30}, rotationY: 0 },
  13: { player: 2, identity: { classes: ['Unit', 'Infantry'], controllable: true },
    unitAI: {}, position: {x: 0, y: 0, z: 0}, rotationY: 0 }
};
const selection = {
  ids: [], size() { return this.ids.length; }, getFirstSelected() { return this.ids[0]; },
  reset() { this.ids = []; }, addList(ids) { this.ids.push(...ids); }
};
const env = {
  Date: { now: () => tick },
  Engine: {
    PostNetworkCommand: cmd => commands.push(cmd),
    HotkeyIsPressed: id => down.has(id),
    GetPlayerID: () => 1,
    GetFollowedEntity: () => followed,
    CameraFollowThirdPerson: id => { camera.push(id); followed = id; },
    GetGUIObjectByName: () => hint,
    GuiInterfaceCall: name => name === 'GetPlayerEntities' ? [11, 12, 13] : [],
    IsPaused: () => paused
  },
  g_Selection: selection, g_Disconnected: false, g_ThirdPersonCameraEnabled: true,
  GetEntityState: id => states[id], hasClass: (state, cl) => state.identity.classes.includes(cl),
  controlsPlayer: player => player === 1,
  GetSimState: () => ({cinemaPlaying: false}), translate: str => str,
  updateThirdPersonCamera: () => {}, toggleThirdPersonCamera: () => {}
};
vm.createContext(env);
vm.runInContext(fs.readFileSync(base + 'gui/session/character_controller.js', 'utf8'), env);
const hero = vm.runInContext('new CharacterController()', env);
env.g_CharacterController = hero;
hero.update();
assert.equal(hint.hidden, true, 'no selected unit: no avatar');
selection.ids = [11];
hero.update();
assert.equal(hint.hidden, false);
assert.equal(camera.at(-1), 11, 'camera auto-recovers when interrupted');
down.add('character.forward'); hero.setKey('forward', true); hero.update();
assert.equal(commands.at(-1).type, 'character-move');
assert.equal(commands.at(-1).sprint, false);
assert.equal(commands.at(-1).x, 10);
assert.equal(commands.at(-1).z, 38, 'forward moves relative to yaw 0 (+Z)');
const initialCount = commands.length;
tick += 200; hero.update();
assert.equal(commands.length, initialCount, 'no new pathfinder order when the goal is still far');
hero.setKey('forward', false); down.delete('character.forward');
assert.equal(commands.at(-1).type, 'stop', 'release stops immediately');
assert.equal(commands.at(-1).entities[0], 11);

// Left direction is locked while held, so a turning avatar cannot spiral.
tick += 200; down.add('character.left'); hero.setKey('left', true); hero.update();
assert.equal(commands.at(-1).x, -8);
assert.equal(commands.at(-1).z, 20);
states[11].rotationY = Math.PI / 2;
states[11].position.x = -5; // within 5 units of the last destination
tick += 150; hero.update();
assert.equal(commands.at(-1).x, -23, 'same world-space bearing when held despite yaw change');
assert.equal(commands.at(-1).z, 20);
hero.setKey('left', false); down.delete('character.left');

// Diagonal normalized so two keys do not exceed walk speed.
states[11].rotationY = 0;
states[11].position.x = 10;
tick += 250;
down.add('character.forward'); down.add('character.right');
hero.setKey('forward', true); hero.setKey('right', true); hero.update();
const diagonal = commands.at(-1);
assert.ok(Math.abs(Math.hypot(diagonal.x - 10, diagonal.z - 20) - 18) < 0.02);

// Shift changes speed and sends a bounded update; letting go restores walking.
tick += 250; down.add('character.run'); hero.setKey('run', true); hero.update();
assert.equal(commands.at(-1).sprint, true);
assert.ok(Math.abs(Math.hypot(commands.at(-1).x - 10, commands.at(-1).z - 20) - 26) < 0.02);
tick += 250; down.delete('character.run'); hero.setKey('run', false); hero.update();
assert.equal(commands.at(-1).sprint, false);

// Focus change cancels the old character and never controls opponents.
selection.ids = [13]; hero.onSelectionChanged(); hero.update();
assert.equal(commands.at(-1).type, 'stop');
assert.equal(commands.at(-1).entities[0], 11);
assert.equal(hint.hidden, true);
const withoutEnemy = commands.length;
tick += 200; hero.update();
assert.equal(commands.length, withoutEnemy);

// Pausing must not keep an old movement command alive.
selection.ids = [11]; down.delete('character.right'); hero.setKey('right', false);
tick += 200; hero.update();
assert.equal(commands.at(-1).type, 'character-move');
paused = true; hero.update();
assert.equal(commands.at(-1).type, 'stop');
paused = false;

// F4 chooses an owned hero over infantry and ignores the opponent.
hero.onSelectionChanged(); selection.ids = [];
env.g_ThirdPersonCameraEnabled = false;
let activated = 0; env.toggleThirdPersonCamera = () => { env.g_ThirdPersonCameraEnabled = true; activated++; };
vm.runInContext('selectCharacter()', env);
assert.equal(selection.ids[0], 12);
assert.equal(activated, 1);
console.log('PASS: owner filtering, FPS follow, keyboard/yaw/diagonal, sprint, stop, pause, hero selection.');
