/*
Hopper - procedurally generated platformer game.
Copyright (C) 2017  Cody Thompson

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/*
 * dev overlay
 */
const Devbox = require('./debug/DevBox');
let dbox = new Devbox();
// dbox.watch('hopper.player.chunker.chunks.length');
// dbox.watch('hopper.player.chunker.startI');
// dbox.watch('hopper.player.chunker.startJ');
// dbox.watch('hopper.player.chunker.endI');
// dbox.watch('hopper.player.chunker.endJ');
dbox.watch(function () {
  if (!hopper) {
    return 'not initialized';
  }
  let chunker = hopper.player.chunker;
  let str = '';
  for (let chunkRow of chunker.chunks) {
    str += chunkRow[0].i+',';
  }
  return str;
}, window, 'chunkstateI');
dbox.watch(function () {
  if (!hopper) {
    return 'not initialized';
  }
  let chunker = hopper.player.chunker;
  let str = '';
  for (let j = 0; j < chunker.cacheHeight; j++) {
    str += chunker.chunks[0][j].j+',';
  }
  return str;
}, window, 'chunkstateJ');
dbox.watch(function () {
    let [chunkLeft, chunkBottom/*, chunkRight, chunkTop*/] = hopper.player.camera.getVisibleDimensions();
    chunkLeft = Math.round(chunkLeft);
    chunkBottom = Math.round(chunkBottom);
    // chunkRight = Math.round(chunkRight);
    // chunkTop = Math.round(chunkTop);
    // return `${chunkLeft} ${chunkBottom} ${chunkRight} ${chunkTop}`;
    return `${chunkLeft} ${chunkBottom}`;
}, window, 'visDims');
dbox.watch(function () {
    let [chunkLeft, chunkBottom, chunkRight, chunkTop] = hopper.player.camera.getVisibleBounds();
    chunkLeft = Math.round(chunkLeft);
    chunkBottom = Math.round(chunkBottom);
    chunkRight = Math.round(chunkRight);
    chunkTop = Math.round(chunkTop);
    return `${chunkLeft} ${chunkBottom} ${chunkRight} ${chunkTop}`;
}, window, 'visBnds');
dbox.watch(function () {
    let [chunkLeft, chunkBottom, chunkRight, chunkTop] = hopper.player.camera.getVisibleChunkBounds();
    chunkLeft = Math.round(chunkLeft);
    chunkBottom = Math.round(chunkBottom);
    chunkRight = Math.round(chunkRight);
    chunkTop = Math.round(chunkTop);
    return `${chunkLeft} ${chunkBottom} ${chunkRight} ${chunkTop}`;
}, window, 'visChunks');
dbox.watch(function () {
  let str = '';
  for (let rndrInfo of window.renderList) {
    str += `${rndrInfo.i},${rndrInfo.j} ${rndrInfo.cnt}<br/>`;
  }
  return str;
}, window, 'rndrList');
window.dbox = dbox;
/*
 * end dev overlay
 */

const p2 = require('p2');

require('../template/hopper.css');
require('../template/index.html');

const Player = require('./Player');
const config = require('../template/hopper.config.json');
const DbgCamController = require('./debug/DbgCamController');
const DbgChunkFiller = require('./debug/DbgChunkFiller');
const BlockEntity = require('./BlockEntity');

var hopper = {
  version: '0.0.0'
};

window.addEventListener('load', function () {
  hopper.player = new Player({
    chunkFiller: new DbgChunkFiller(),
    parent: document.getElementById(config.parentElId)
  });
  window.ctls = new DbgCamController({
    camera: hopper.player.camera
  });
  window.box1 = new BlockEntity({
    x: 64,
    y: 32,
    // mass: 1
  });
  window.box1.body.type = p2.Body.KINEMATIC;
  hopper.player.entityManager.add(window.box1);
  hopper.player.addEventListener('update', function () {
    window.ctls.update();
  });
});

console.log('%chopper ' + hopper.version, 'background-color: black; color: white;');

window.hopper = hopper;
window.glMat = require('gl-matrix');
window.mat4 = glMat.mat4;
