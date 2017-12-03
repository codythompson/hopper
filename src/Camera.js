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
    mat4.scale(this.mVMat, this.mVMat, new Float32Array([this.scaleX, this.scaleY, 1]));
    mat4.rotateZ(this.mVMat, this.mVMat, -this.rot);
    mat4.translate(this.mVMat, this.mVMat, new Float32Array([-this.x, -this.y, 0]));
  }

  updateProj () {
    let visDims = this.getVisibleDimensions();
    let right = visDims[Camera.ixWidth]/2;
    let top = visDims[Camera.ixHeight]/2;
    let left = -right;
    let bottom = -top;
    mat4.ortho(this.projMat, left, right, bottom, top, -1, 1);
  }

  getChunkMat (chunkI, chunkJ) {
    let mat = mat4.create();
    mat4.translate(mat, mat, [chunkI*this.blocksWide, chunkJ*this.blocksHigh, 0]);
    return mat;
  }

  /**
   * @returns 2 component Float32Array [width, height]
   */
  getVisibleDimensions () {
    // TODO this could probably be done with fewer steps
    let baseScale = this.blocksHigh / this.gl.drawingBufferHeight;
    let blocksPerPixelX = baseScale / this.scaleX;
    let blocksPerPixelY = baseScale / this.scaleY;
    let scaledBlocksWide = blocksPerPixelX * this.gl.drawingBufferWidth;
    let scaledBlocksHigh = blocksPerPixelY * this.gl.drawingBufferHeight;

    let visDims = new Float32Array(2);
    visDims[Camera.ixWidth] = scaledBlocksWide;
    visDims[Camera.ixHeight] = scaledBlocksHigh;
    return visDims;
  }

  /**
   * @returns 2 component Float32Array [left, bottom, right, top]
   */
  getVisibleBounds () {
    let visDims = this.getVisibleDimensions();
    let halfWidth = visDims[Camera.ixWidth]/2;
    let halfHeight = visDims[Camera.ixHeight]/2;
    let left = this.x - halfWidth;
    let bottom = this.y - halfHeight;
    let right = this.x + halfWidth;
    let top = this.y + halfHeight;

    let visBnds = new Float32Array(4);
    visBnds[Camera.ixLeft] = left;
    visBnds[Camera.ixBottom] = bottom;
    visBnds[Camera.ixRight] = right;
    visBnds[Camera.ixTop] = top;
    return visBnds;
  }

  getVisibleChunkBounds () {
    let visBnds = this.getVisibleBounds();
    let left = visBnds[Camera.ixLeft];
    let bottom = visBnds[Camera.ixBottom];
    let right = visBnds[Camera.ixRight];
    let top = visBnds[Camera.ixTop];

    left /= this.blocksWide;
    bottom /= this.blocksHigh;
    right /= this.blocksWide;
    top /= this.blocksHigh;

    let visChunks = new Float32Array(4);
    visChunks[Camera.ixLeft] = left;
    visChunks[Camera.ixBottom] = bottom;
    visChunks[Camera.ixRight] = right;
    visChunks[Camera.ixTop] = top;
    return visChunks;
  }

  worldToLocalChunk (x, y) {
    let i = x % this.blocksWide;
    let j = y % this.blocksHight;
    let locChunk = new Float32Array(2);
    locChunk[Camera.ixLeft] = i;
    locChunk[Camera.ixRight] = j;
    return locChunk;
  }

  worldToChunk (x, y) {
    let chunkI = Math.floor(x / this.blocksWide);
    let chunkJ = Math.floor(x / this.blocksHight);
    let chunkCoord = new Float32Array(2);
    chunkCoord[Camera.ixLeft] = chunkI;
    chunkCoord[Camera.ixRight] = chunkJ;
    return chunkCoord;
  }

  get center () {
    let coord = vec2.create();
    coord[0] = this.blocksWide/2;
    coord[1] = this.blocksHigh/2;
    return coord;
  }

  get scale () {
    return (this.scaleX + this.scaleY) / 2;
  }
  set scale (val) {
    this.scaleX = val;
    this.scaleY = val;
  }
}

Camera.ixWidth = 0;
Camera.ixHeight = 1;
Camera.ixLeft = 0;
Camera.ixBottom = 1;
Camera.ixRight = 2;
Camera.ixTop = 3;

module.exports = Camera;