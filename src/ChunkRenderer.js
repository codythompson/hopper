const Block = require('./Block');

class ChunkRenderer {
  constructor (args) {
    this.rendererMap = args.rendererMap;
    this.renderersUsed = {};
  }

  addBlock (block) {
    let rendererId = block.rendererId;
    this.rendererMap[rendererId].add(block);
    this.renderersUsed[rendererId] = this.rendererMap[rendererId];
  }

  addBlocks (blocks) {
    for (let col of blocks) {
      if (Array.isArray(col)) {
        for (let block of col) {
          this.addBlock(block);
        }
      } else if (col instanceof Block) { // if 
        this.addBlock(col);
      } else {
        throw '[hopper][ChunkRenderer][addBlocks] array element isn\'t array or Block';
      }
    }
  }

  render (camera, chunkI, chunkJ) {
    let chunkMat = camera.getChunkMat(chunkI, chunkJ);
    for (let rendererId in this.renderersUsed) {
      this.rendererMap[rendererId].render(camera, chunkMat);
    }
    this.renderersUsed = {};
  }
}

module.exports = ChunkRenderer;