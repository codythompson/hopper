const ChunkFiller = require('../ChunkFiller');

class DbgChunkFiller extends ChunkFiller {

  fillChunk(chunk) {
    let rMag = (chunk.i + 1) % 2; // every other x chunk is red or yellow
    let gMag = chunk.j % 2; // every other y chunk is green or yellow
    let bMag = (1-rMag) * (1-gMag); // no red and no green
    for (let i = 0; i < chunk.width; i++) {
      for (let j = 0; j < chunk.height; j++) {
        let block = chunk.getBlock(i, j);
        let totBlocks = chunk.width + chunk.height;
        block.colorR = rMag * (i+j)/(totBlocks);
        block.colorG = gMag * (i+j)/(totBlocks);
        block.colorB = bMag * (i+j)/(totBlocks);
      }
    }
  }
}

module.exports = DbgChunkFiller;