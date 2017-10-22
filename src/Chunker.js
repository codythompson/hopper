const _ = require('lodash');
const vec2 = require('gl-matrix').vec2;
const Chunk = require('./Chunk');

// private fields
var startI = 0;
var startJ = 0;

class Chunker {
  constructor (args) {
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

  shift (shiftI, shiftJ) {
    throw '[hopper][Chunker][shift] TODO';
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