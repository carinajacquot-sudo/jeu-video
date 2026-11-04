// Execute in the Codespace: node /workspaces/jeu-video/tests/character_assets.test.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = '/workspaces/0ad/binaries/data/mods/public';
const art = path.join(root, 'art');
const file = relative => fs.readFileSync(path.join(art, relative), 'utf8');
const exists = relative => fs.existsSync(path.join(art, relative));

const actor = file('actors/units/astreval/hero_noir.xml');
const sword = file('actors/props/units/weapons/astreval/greatsword_back.xml');
const template = fs.readFileSync(path.join(root, 'simulation/templates/units/athen/hero_astreval.xml'), 'utf8');
const playground = fs.readFileSync(path.join(root, 'maps/scenarios/astreval_first_steps.xml'), 'utf8');
const landscape = fs.readFileSync(path.join(root, 'maps/scenarios/astreval_arcadia.xml'), 'utf8');

// The playable hero is an actual human-height, skinned 0 A.D. biped, with its
// stock armor, face, helm, native animations and animated black cape.
assert.match(actor, /<mesh>skeletal\/new\/m_armor_tunic_short\.dae<\/mesh>/);
for (const prop of [
  'props/units/heads/new/head_hele_b.xml',
  'props/units/helmets/hele_corinthian_i3.xml',
  'props/units/capes/cape_long_black.xml',
  'props/units/weapons/astreval/greatsword_back.xml'
]) {
  assert.ok(actor.includes(`actor="${prop}"`), `hero needs ${prop}`);
  assert.ok(exists('actors/' + prop), `missing native 0 A.D. prop: ${prop}`);
}
assert.match(actor, /cape_long_black\.xml" attachpoint="root"/);
assert.match(actor, /greatsword_back\.xml" attachpoint="root"/);
assert.match(actor, /linothorax_03_black_01\.png/);
assert.match(actor, /base_swordsman_2hand_relax\.xml/);
assert.match(actor, /death_cape_long\.xml/);
assert.match(template, /units\/astreval\/hero_noir\.xml/);
assert.match(template, /units\/theb\/champion_infantry_swordsman\.png/);
assert.ok(exists('textures/skins/props/cape_hd_black.png'));
assert.ok(exists('textures/ui/session/portraits/units/theb/champion_infantry_swordsman.png'));

// Original back-mounted sword: 3D mesh + UV palette are real assets, not a
// flat screenshot or a client-side placeholder.
assert.match(sword, /<mesh>props\/astreval\/greatsword_back\.dae<\/mesh>/);
assert.match(sword, /greatsword_palette\.png/);
const dae = file('meshes/props/astreval/greatsword_back.dae');
assert.match(dae, /<library_geometries>/);
assert.match(dae, /<triangles[^>]*count=/);
assert.match(dae, /semantic="TEXCOORD"/);
const palette = fs.readFileSync(path.join(art, 'textures/skins/props/astreval/greatsword_palette.png'));
assert.equal(palette.toString('hex', 0, 8), '89504e470d0a1a0a');
assert.equal(palette.readUInt32BE(16), 256);
assert.equal(palette.readUInt32BE(20), 256);

// Both native 0 A.D. scenarios spawn the new hero. The original Arcadia map
// stays untouched and is reproduced as an opt-in landscape showcase.
assert.match(playground, /<Template>units\/athen\/hero_astreval<\/Template>/);
assert.match(playground, /cape noire et grande épée dans le dos/);
assert.match(landscape, /<Template>units\/athen\/hero_astreval<\/Template>/);
assert.match(landscape, /Astreval — Gardien noir d’Arcadie/);
assert.equal(fs.statSync(path.join(root, 'maps/scenarios/astreval_arcadia.pmp')).size,
  fs.statSync(path.join(root, 'maps/scenarios/arcadia.pmp')).size);
assert.ok(!exists('actors/units/astreval/hero_kenney.xml'));
assert.ok(!exists('source/kenney/character-male-a.glb'));
console.log('PASS: playable human 0 A.D. rig, black cape, real greatsword, palette, portrait and two maps; toy model removed.');
