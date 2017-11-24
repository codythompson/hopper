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
window.dbox = new Devbox();

require('../template/hopper.css');
require('../template/index.html');

const Player = require('./Player');
const config = require('../template/hopper.config.json');
const DbgCamController = require('./debug/DbgCamController');
const DbgChunkFiller = require('./debug/DbgChunkFiller');

var hopper = {
  version: '0.0.0'
};

window.addEventListener('load', function () {
  hopper.player = new Player({
    chunkFiller: new DbgChunkFiller(),
    parent: document.getElementById(config.parentElId)
  });
  // TODo THIS is broken
  window.ctls = new DbgCamController({
    camera: hopper.player.camera
  });
  hopper.player.addEventListener('update', function () {
    window.ctls.update();
  });
});

console.log('%chopper ' + hopper.version, 'background-color: black; color: white;');

window.hopper = hopper;
window.glMat = require('gl-matrix');
window.mat4 = glMat.mat4;
