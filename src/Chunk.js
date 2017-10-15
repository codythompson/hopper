const Block = require('./Block');

class Chunk {
  constructor (args) {
    this.i = args.i,
    this.j = args.j,
    this.width = args.width;
    this.height = args.height;
    this.blocks = this.buildBlocks();
  }

  buildBlocks () {
    let blocks = [];
    for (let i = 0; i < this.width; i++) {
      let col = [];
      for (let j = 0; j < this.height; j++) {
        col.push(new Block({
          i: i,
          j: j
        }))
      }
      blocks.push(col);
    }
    return blocks;
  }

  getBlock (i, j) {
    return this.blocks[i][j];
  }
}

module.exports = Chunk;