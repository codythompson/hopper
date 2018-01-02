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
    let [visW, visH] = this.getVisibleDimensions();
    let right = visW/2;
    let top = visH/2;
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

    let visDims = new Float32Array([scaledBlocksWide, scaledBlocksHigh]);
    return visDims;
  }

  /**
   * @returns 2 component Float32Array [left, bottom, right, top]
   */
  getVisibleBounds () {
    let [visW, visH] = this.getVisibleDimensions();
    let halfWidth = visW/2;
    let halfHeight = visH/2;
    let left = this.x - halfWidth;
    let bottom = this.y - halfHeight;
    let right = this.x + halfWidth;
    let top = this.y + halfHeight;

    let visBnds = new Float32Array([
      left,
      bottom,
      right,
      top
    ]);
    return visBnds;
  }

  getVisibleChunkBounds () {
    let [visLeft, visBottom, visRight, visTop] = this.getVisibleBounds();
    let left = visLeft / this.blocksWide;
    let bottom = visBottom / this.blocksHigh;
    let right = visRight / this.blocksWide;
    let top = visTop / this.blocksHigh;

    let visChunks = new Float32Array([left, bottom, right, top]);
    return visChunks;
  }

  getRoundedVisibleChunkBounds(margin=0) {
    let bnds = this.getVisibleChunkBounds();
    for (let i = 0; i < bnds.length; i++) {
      bnds[i] = Math.round(bnds[i]);
    }
    bnds[0] -= margin;
    bnds[1] -= margin;
    bnds[2] += margin;
    bnds[3] += margin;
    return bnds;
  }

  worldToLocalChunk (x, y) {
    let i = x % this.blocksWide;
    if (i < 0) {
      i += this.blocksWide;
    }
    let j = y % this.blocksHigh;
    if (j < 0) {
      j += this.blocksHigh;
    }
    let locChunk = new Float32Array([i, j]);
    return locChunk;
  }

  worldToChunk (x, y) {
    let chunkI = Math.floor(x / this.blocksWide);
    let chunkJ = Math.floor(y / this.blocksHigh);
    let chunkCoord = new Float32Array([chunkI, chunkJ]);
    return chunkCoord;
  }

  chunkToWorld (i, j) {
    let x = i * chunkI;
    let y = j * chunkJ;
    let chunkCoord = new Float32Array([x, y]);
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

module.exports = Camera;