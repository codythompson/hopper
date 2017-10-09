const _ = require('lodash');
const glMat = require('gl-matrix');
const mat4 = glMat.mat4;
const vec2 = glMat.vec2;

class Viewport {
  constructor (args) {
    args = _.defaults(args, {
      blocksWide: 32,
      blocksHigh: 32
    });
    this.gl = args.gl;
    this.projMat = mat4.create();
    this.blocksWide = args.blocksWide;
    this.blocksHigh = args.blocksHigh;

    this.resize();
  }

  resize () {
    let blocksPerPixel = this.blocksHigh / this.gl.drawingBufferHeight;
    let scaledBlocksWide = blocksPerPixel * this.gl.drawingBufferWidth;

    let right = scaledBlocksWide/2;
    let left = -right;
    let top = this.blocksHigh/2;
    let bottom = -top;

    mat4.ortho(this.projMat, left, right, bottom, top, -1, 1);
  }

  get center () {
    let coord = vec2.create();
    coord[0] = this.blocksWide/2;
    coord[1] = this.blocksHigh/2;
    return coord;
  }
}

module.exports = Viewport;