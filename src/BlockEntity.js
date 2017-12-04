const _ = require('lodash');

const Entity = require('./Entity');
const Block = require('./Block');

class BlockEntity extends Entity {
  constructor (args={}) {
    args = _.defaults(args, {
      blockArgs: _.defaults(args.blockArgs, {
        i: 0,
        j: 0,
        rendererId: 'ColorBlock',
        colorR: 1,
        colorG: 1,
        colorB: 1,
        colorA: 1
      })
    });
    super(args);

    let block = new Block(args.blockArgs);

    /*
     * public fields
     */
    _.extend(this, {
      block: block
    });
  }

  getBlocks (camera) {
    let [i, j] = camera.worldToLocalChunk(this.x, this.y);
    this.block.i = i;
    this.block.j = j;
    return [this.block];
  }
}

module.exports = BlockEntity;