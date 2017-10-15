const _ = require('lodash');
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
    this.colMap = new Uint16Array(args.chunkCacheWidth);
    for (let i = 0; i < this.colMap.length; i++) {
      this.colMap[i] = i;
    }
    this.rowMap = new Uint16Array(args.chunkCacheHeight);
    for (let j = 0; j < this.rowMap.length; j++) {
      this.rowMap[j] = j;
    }
    this.chunkWidth = args.chunkWidth;
    this.chunkHeight = args.chunkHeight;
    this.chunks = this.buildChunkCache();
  }

  buildChunkCache () {
    let chunks = [];
    for (let i = 0; i < this.colMap.length; i++) {
      let col = [];
      for (let j = 0; j < this.rowMap.length; j++) {
        let chunk = new Chunk({
          i: i + startI,
          j: j + startJ,
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

  getChunk (chunkI, chunkJ) {
    let i = this.colMap[chunkI];
    let j = this.rowMap[chunkJ];
    return this.chunks[i][j];
  }

  shift (shiftI, shiftJ) {
    throw '[hopper][Chunker][shift] TODO';
  }

  inCache (chunkI, chunkJ) {
    return chunkI >= this.cacheStartI && chunkI <= this.cacheEndI &&
      chunkJ >= this.cacheStartJ && chunkJ <= this.cacheEndJ;
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