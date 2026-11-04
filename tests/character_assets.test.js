// Execute inside the Codespace: node /workspaces/jeu-video/tests/character_assets.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = '/workspaces/0ad/binaries/data/mods/public';
const art = path.join(root, 'art');
const get = relative => fs.readFileSync(path.join(art, relative), 'utf8');
const skeleton = get('skeletons/kenney_mini_character.xml');
const actor = get('actors/units/astreval/hero_kenney.xml');
const template = fs.readFileSync(path.join(root, 'simulation/templates/units/athen/hero_astreval.xml'), 'utf8');
const map = fs.readFileSync(path.join(root, 'maps/scenarios/astreval_first_steps.xml'), 'utf8');
const license = get('source/kenney/License.txt');
assert.match(license, /Kenney/);
assert.match(license, /Creative Commons Zero, CC0/);
assert.ok(fs.statSync(path.join(art, 'source/kenney/character-male-a.glb')).size > 200000);
assert.match(skeleton, /<standard_skeleton id="KenneyMiniCharacter"/);
for (const bone of ['root', 'leg-left', 'leg-right', 'torso', 'arm-left', 'arm-right', 'head']) {
  assert.match(skeleton, new RegExp(`<bone name="${bone}"`));
  assert.match(skeleton, new RegExp(`<target>${bone}</target>`));
}
assert.match(actor, /<material>default\.xml<\/material>/);
for (const [name, filename] of Object.entries({
  Idle: 'idle', Walk: 'walk', Run: 'run', attack_melee: 'attack', Death: 'death', Jump: 'jump'
})) {
  assert.match(actor, new RegExp(`name="${name}" file="astreval/character-male-a-${filename}\\.dae"`));
  const dae = get(`animation/astreval/character-male-a-${filename}.dae`);
  assert.match(dae, /<library_animations>/);
  assert.match(dae, /type="JOINT"/);
  assert.match(dae, /<float_array[^>]*-input-array"[^>]*count="[89]|<float_array[^>]*-input-array"[^>]*count="[1-9][0-9]/);
}
const mesh = get('meshes/skeletal/astreval/character-male-a.dae');
assert.match(mesh, /<library_controllers>/);
assert.match(mesh, /type="JOINT"/);
assert.match(mesh, /<instance_controller url=/);
assert.ok(fs.existsSync(path.join(art, 'textures/skins/skeletal/astreval/colormap.png')));
const portrait = fs.readFileSync(path.join(art, 'textures/ui/session/portraits/units/astreval/hero_kenney.png'));
assert.equal(portrait.readUInt32BE(16), 256);
assert.equal(portrait.readUInt32BE(20), 256);
assert.match(template, /units\/astreval\/hero_kenney\.xml/);
assert.match(template, /units\/astreval\/hero_kenney\.png/);
assert.match(map, /<Template>units\/athen\/hero_astreval<\/Template>/);
assert.match(map, /"VictoryConditions": \["conquest"\]/);
console.log('PASS: CC0 source, rig, skinned mesh, six COLLADA clips, native actor/template/map and portrait.');
