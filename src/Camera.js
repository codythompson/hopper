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
    let visDims = this.getVisibleDimensions();
    let left = visDims[Camera.ixLeft];
    let bottom = visDims[Camera.ixBottom];
    let right = visDims[Camera.ixRight];
    let top = visDims[Camera.ixTop];
    mat4.ortho(this.projMat, left, right, bottom, top, -1, 1);
  }

  getChunkMat (chunkI, chunkJ) {
    let mat = mat4.create();
    mat4.translate(mat, mat, [chunkI*this.blocksWide, chunkJ*this.blocksHigh, 0]);
    return mat;
  }

  /**
   * @returns 4 component Float32Array [min x, min y, max x, max y]
   */
  getVisibleDimensions () {
    let blocksPerPixel = this.blocksHigh / this.gl.drawingBufferHeight;
    let scaledBlocksWide = blocksPerPixel * this.gl.drawingBufferWidth;

    let right = scaledBlocksWide/2;
    let left = -right;
    let top = this.blocksHigh/2;
    let bottom = -top;

    let visDims = new Float32Array(4);
    visDims[Camera.ixLeft] = left;
    visDims[Camera.ixBottom] = bottom;
    visDims[Camera.ixRight] = right;
    visDims[Camera.ixTop] = top;
    return visDims;
  }

  get center () {
    let coord = vec2.create();
    coord[0] = this.blocksWide/2;
    coord[1] = this.blocksHigh/2;
    return coord;
  }
}

Camera.ixLeft = 0;
Camera.ixBottom = 1;
Camera.ixRight = 2;
Camera.ixTop = 3;

module.exports = Camera;