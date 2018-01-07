const _ = require('lodash');
const vec2 = require('gl-matrix').vec2;
const Chunk = require('./Chunk');

// private fields
var startI = 0;
var startJ = 0;

class Chunker {
  /**
   * @param {object} args 
   * @param {Camera} camera the world's camera to use when render is called
   * @param {ChunkRenderer} chunkRenderer the chunk renderer to use when render is called
   */
  constructor (args) {
    if (!args.camera) {
      throw '[hopper][Chunker][constructor] "camera" is a required arg';
    }
    if (!args.chunkRenderer) {
      throw '[hopper][Chunker][constructor] "chunkRenderer" is a required arg';
    }
    args = _.defaults(args, {
      chunkCacheWidth: 8,
      chunkCacheHeight: 8,
      startI: 0,
      startJ: 0,
    });
    this.chunkFiller = args.chunkFiller;
    startI = args.startI;
    startJ = args.startJ;
    this.startIPtr = 0;
    this.startJPtr = 0;
    this.chunkWidth = args.chunkWidth;
    this.chunkHeight = args.chunkHeight;
    this.chunks = this.buildChunkCache(this.startI, this.startJ, args.chunkCacheWidth, args.chunkCacheHeight);
    this.camera = args.camera;
    this.chunkRenderer = args.chunkRenderer;
  }

  buildChunkCache (leftChunk, bottomChunk, chunkCacheWidth, chunkCacheHeight) {
    let chunks = [];
    for (let i = 0; i < chunkCacheWidth; i++) {
      let col = [];
      for (let j = 0; j < chunkCacheHeight; j++) {
        let chunk = new Chunk({
          i: i + leftChunk,
          j: j + bottomChunk,
          width: this.chunkWidth,
          height: this.chunkHeight
        });
        this.chunkFiller.fillChunk(chunk);
        col.push(chunk);
      }
      chunks.push(col);
    }
    return chunks;
  }

  getCacheCoord (chunkI, chunkJ) {
    let relI = chunkI - this.startI;
    let relJ = chunkJ - this.startJ;
    if (relI < 0 || relI >= this.cacheWidth || relJ < 0 || relJ >= this.cacheHeight) {
      throw `[hopper][Chunker][getCacheCoord] (${chunkI}, ${chunkJ}) not in cache`;
    }

    let coord = vec2.create();
    coord[0] = (relI + this.startIPtr) % this.cacheWidth;
    coord[1] = (relJ + this.startJPtr) % this.cacheHeight;
    return coord;
  }

  getChunk (chunkI, chunkJ) {
    let [i,j] = this.getCacheCoord(chunkI, chunkJ);
    return this.chunks[i][j];
  }

  shiftRight (shiftBy) {
    if (Math.abs(shiftBy) >= this.cacheWidth) {
      throw '[hopper][Chunker][shiftRight] can\'t handle shifts larger than cache width yet';
    }
    if (shiftBy < 0) {
      return this.shiftLeft(-shiftBy);
    }

    /*
     * fill the columns from the current startIPtr to the next startIPtr
     * OR the end of the cache
     * start from the current right edge of the cache plus 1, and increase
     */
    for (let i = 0; i < shiftBy && i + this.startIPtr < this.cacheWidth; i++) {
      let chunkI = this.startI + this.cacheWidth + i;
      let colI = this.startIPtr + i;
      for (let j = 0; j < this.cacheHeight; j++) {
        let chunk = this.chunks[colI][j];
        chunk.i = chunkI;
        this.chunkFiller.fillChunk(chunk);
      }
    }
    /*
     * fill the columns from the left edge of the cache, if we haven't shifted
     * far enough yet.
     */
    let alreadyFilled = this.cacheWidth - this.startIPtr;
    for (let i = 0; i < shiftBy - alreadyFilled; i++) {
      let chunkI = this.startI + this.cacheWidth + alreadyFilled;
      for (let j = 0; j < this.cacheWidth; j++) {
        let chunk = this.chunks[i][j];
        chunk.i = chunkI;
        this.chunkFiller.fillChunk(chunk);
      }
    }

    startI = startI + shiftBy;
    this.startIPtr = (this.startIPtr + shiftBy) % this.cacheWidth;
  }

  shiftLeft (shiftBy) {
    if (Math.abs(shiftBy) >= this.cacheWidth) {
      throw '[hopper][Chunker][shiftLeft] can\'t handle shifts larger than cache width yet';
    }
    if (shiftBy < 0) {
      return this.shiftRight(-shiftBy);
    }

    /*
     * fill the columns from the current startIPtr to the next startIPtr
     * OR the end of the cache
     * start from the current left chunk coord of the cache minus 1, and decrease
     */
    for (let i = 1; i - 1 < shiftBy && this.startIPtr - i >= 0; i++) {
      let chunkI = this.startI - i;
      let colI = this.startIPtr - i;
      for (let j = 0; j < this.cacheHeight; j++) {
        let chunk = this.chunks[colI][j];
        chunk.i = chunkI;
        this.chunkFiller.fillChunk(chunk);
      }
    }
    /*
     * fill the columns from the right edge of the cache, if we haven't shifted
     * far enough yet.
     */
    let alreadyFilled = this.startIPtr;
    for (let i = 1; i - 1 < shiftBy - alreadyFilled; i++) {
      let chunkI = this.startI - this.startIPtr - i;
      let colI = this.cacheWidth - i;
      for (let j = 0; j < this.cacheHeight; j++) {
        let chunk = this.chunks[colI][j];
        chunk.i = chunkI;
        this.chunkFiller.fillChunk(chunk);
      }
    }

    startI = startI - shiftBy;
    let newPtr = this.startIPtr - shiftBy;
    if (newPtr < 0) {
      newPtr = (newPtr % this.cacheWidth) + this.cacheWidth;
    }
    this.startIPtr = newPtr;
  }

  shiftUp (shiftBy) {
    if (Math.abs(shiftBy) >= this.cacheHeight) {
      throw '[hopper][Chunker][shiftUp] can\'t handle shifts larger than cache height yet';
    }
    if (shiftBy < 0) {
      return this.shiftDown(-shiftBy);
    }

    /*
     * fill the columns from the current startJPtr to the next startJPtr
     * OR the end of the cache
     * start from the current top edge of the cache plus 1, and increase
     */
    for (let j = 0; j < shiftBy && j + this.startJPtr < this.cacheHeight; j++) {
      let chunkJ = this.startJ + this.cacheHeight + j;
      let colJ = this.startJPtr + j;
      for (let i = 0; i < this.cacheWidth; i++) {
        let chunk = this.chunks[i][colJ];
        chunk.j = chunkJ;
        this.chunkFiller.fillChunk(chunk);
      }
    }
    /*
     * fill the columns from the left edge of the cache, if we haven't shifted
     * far enough yet.
     */
    let alreadyFilled = this.cacheHeight - this.startJPtr;
    for (let j = 0; j < shiftBy - alreadyFilled; j++) {
      let chunkJ = this.startJ + this.cacheHeight + alreadyFilled;
      for (let i = 0; i < this.cacheWidth; i++) {
        let chunk = this.chunks[i][j];
        chunk.j = chunkJ;
        this.chunkFiller.fillChunk(chunk);
      }
    }

    startJ = startJ + shiftBy;
    this.startJPtr = (this.startJPtr + shiftBy) % this.cacheHeight;
  }

  shiftDown (shiftBy) {
    if (Math.abs(shiftBy) >= this.cacheHeight) {
      throw '[hopper][Chunker][shiftDown] can\'t handle shifts larger than cache height yet';
    }
    if (shiftBy < 0) {
      return this.shiftUp(-shiftBy);
    }

    /*
     * fill the columns from the current startIPtr to the next startIPtr
     * OR the end of the cache
     * start from the current left chunk coord of the cache minus 1, and decrease
     */
    for (let j = 1; j - 1 < shiftBy && this.startJPtr - j >= 0; j++) {
      let chunkJ = this.startJ - j;
      let colJ = this.startJPtr - j;
      for (let i = 0; i < this.cacheWidth; i++) {
        let chunk = this.chunks[i][colJ];
        chunk.j = chunkJ;
        this.chunkFiller.fillChunk(chunk);
      }
    }
    /*
     * fill the columns from the right edge of the cache, if we haven't shifted
     * far enough yet.
     */
    let alreadyFilled = this.startJPtr;
    for (let j = 1; j - 1 < shiftBy - alreadyFilled; j++) {
      let chunkJ = this.startJ - this.startJPtr - j;
      let colJ = this.cacheHeight - j;
      for (let i = 0; i < this.cacheWidth; i++) {
        let chunk = this.chunks[i][colJ];
        chunk.j = chunkJ;
        this.chunkFiller.fillChunk(chunk);
      }
    }

    startJ = startJ - shiftBy;
    let newPtr = this.startJPtr - shiftBy;
    if (newPtr < 0) {
      newPtr = (newPtr % this.cacheHeight) + this.cacheHeight;
    }
    this.startJPtr = newPtr;
  }

  shiftI (deltaI) {
    if (deltaI !== 0) {
      this.shiftRight(deltaI);
    }
  }

  shiftJ (deltaJ) {
    if (deltaJ !== 0) {
      this.shiftUp(deltaJ);
    }
  }

  fillCache (leftMostChunk, bottomMostChunk) {
    let deltI = leftMostChunk - this.startI;
    this.shiftI(deltI);
    let deltJ = bottomMostChunk - this.startJ;
    this.shiftJ(deltJ);
  }

  update () {
    let [chunkLeft, chunkBottom] = this.camera.getVisibleChunkBounds();
    chunkLeft = Math.round(chunkLeft);
    chunkBottom = Math.round(chunkBottom);

    this.fillCache(chunkLeft, chunkBottom);
  }

  render () {
    let [chunkLeft, chunkBottom, chunkRight, chunkTop] = this.camera.getVisibleChunkBounds();
    chunkLeft = Math.round(chunkLeft);
    chunkBottom = Math.round(chunkBottom);
    chunkRight = Math.round(chunkRight);
    chunkTop = Math.round(chunkTop);

    for (let i = chunkLeft; i <= chunkRight; i++) {
      for (let j = chunkBottom; j <= chunkTop; j++) {
        try {
          let blocks = this.getChunk(i, j).blocks;
          this.chunkRenderer.addBlocks(blocks);
          this.chunkRenderer.render(this.camera, i, j);
        } catch (e) {
          console.warn(`[hopper][Chunker][render] chunk ${i},${j} not in cache`);
        }
      }
    }
  }

  get cacheWidth () {
    return this.chunks.length;
  }

  get cacheHeight () {
    return this.chunks[0].length;
  }

  get startI () {
    return startI;
  }
  get startJ () {
    return startJ;
  }

  get endI () {
    return startI + this.cacheWidth - 1;
  }
  get endJ () {
    return startJ + this.cacheHeight - 1;
  }
}

module.exports = Chunker;