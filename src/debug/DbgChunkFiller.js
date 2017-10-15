const ChunkFiller = require('../ChunkFiller');

class DbgChunkFiller extends ChunkFiller {

  fillChunk(chunk) {
    for (let i = 0; i < chunk.width; i++) {
      for (let j = 0; j < chunk.height; j++) {
        let block = chunk.getBlock(i, j);
        let totBlocks = chunk.width + chunk.height;
        block.colorR = (i+j)/(totBlocks);
        block.colorG = (i+j)/(totBlocks);
        block.colorB = (i+j)/(totBlocks);
      }
    }
  }
}

module.exports = DbgChunkFiller;