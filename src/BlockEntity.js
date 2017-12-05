const _ = require('lodash');
const p2 = require('p2');

const Entity = require('./Entity');
const Block = require('./Block');

class BlockEntity extends Entity {
  constructor (args={}) {
    args = _.defaults(args, {
      mass: 0,
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
    let body = new p2.Body({
      position: [this.x, this.y],
      mass: args.mass
    });
    let shape = new p2.Box({width: 1, height: 1});
    body.addShape(shape);

    /*
     * public fields
     */
    _.extend(this, {
      block: block,
      body: body
    });
  }

  getBlocks (camera) {
    let [i, j] = camera.worldToLocalChunk(this.x, this.y);
    this.block.i = i;
    this.block.j = j;
    return [this.block];
  }

  getBody () {
    return this.body;
  }
}

module.exports = BlockEntity;