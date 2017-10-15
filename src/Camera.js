const _ = require('lodash');
const glMat = require('gl-matrix');
const mat4 = glMat.mat4;
const vec2 = glMat.vec2;

class Camera {
  constructor (args) {
    args = _.defaults(args, {
      blocksWide: 32,
      blocksHigh: 32,
      x: 0,
      y: 0,
      rot: 0,
      scaleX: 1,
      scaleY: 1,
    });
    this.gl = args.gl;
    this.blocksWide = args.blocksWide;
    this.blocksHigh = args.blocksHigh;
    this.x = args.x;
    this.y = args.y;
    this.rot = args.rot;
    this.scaleX = args.scaleX;
    this.scaleY = args.scaleY;
    this.projMat = mat4.create();
    this.mVMat = mat4.create();

    this.updateProj();
    this.updateMV();
  }

  updateMV () {
    this.mVMat = mat4.create();
    mat4.translate(this.mVMat, this.mVMat, new Float32Array([-this.x, -this.y, 0]));
    mat4.rotateZ(this.mVMat, this.mVMat, -this.rot);
    mat4.scale(this.mVMat, this.mVMat, new Float32Array([this.scaleX, this.scaleY, 1]));
  }

  updateProj () {
    let blocksPerPixel = this.blocksHigh / this.gl.drawingBufferHeight;
    let scaledBlocksWide = blocksPerPixel * this.gl.drawingBufferWidth;

    let right = scaledBlocksWide/2;
    let left = -right;
    let top = this.blocksHigh/2;
    let bottom = -top;

    mat4.ortho(this.projMat, left, right, bottom, top, -1, 1);
  }

  getChunkMat (chunkI, chunkJ) {
    let mat = mat4.create();
    mat4.translate(mat, mat, [chunkI*this.blocksWide, chunkJ*this.blocksHigh, 0]);
    return mat;
  }

  get center () {
    let coord = vec2.create();
    coord[0] = this.blocksWide/2;
    coord[1] = this.blocksHigh/2;
    return coord;
  }
}

module.exports = Camera;