const p2 = require('p2');
const ChunkBodyCache = require('./ChunkBodyCache');

let priv = null;

class ChunkBodyBuilder {
  /**
   * @constructor
   * @param {*} args the arguments object
   * @param {object} args.builderMap an object that maps a shapeId to an instance of BlockShapeBuilder
   * @param {number} [args.bodyCacheSize] the size of the cache that will store the bodys
   * @param {p2.World} [args.world] the p2 World that will store the bodies
   */
  constructor (args) {
    if (typeof args !== 'object') {
      throw '[hopper][ChunkBodyBuilder][constructor] an arguments object is required.';
    }
    if (!args.builderMap) {
      throw '[hopper][ChunkBodyBuilder][constructor] "builderMap" is a required arg.';
    }
    if (!args.world) {
      throw '[hopper][ChunkBodyBuilder][constructor] "world" is a required arg.';
    }
    this.builderMap = args.builderMap;

    priv = {
      bodyCache: new ChunkBodyCache({
        size: args.bodyCacheSize,
        world: args.world
      })
    };
  }

  buildShape (block) {
    let shapeId = block.shapeId;
    if (shapeId === null) {
      return null;
    }
    return this.builderMap[shapeId].buildShape();
  }

  buildBody (camera, chunk) {
    let chunkI = chunk.i;
    let chunkJ = chunk.j;

    // if the body exists in the cache, return it
    if (priv.bodyCache.hasBody(chunkI, chunkJ)) {
      return priv.bodyCache.getBody(chunkI, chunkJ);
    }

    // if the body doesn't exist in the cache,
    // build it and add it to the cache
    let pos = camera.chunkToWorld (chunkI, chunkJ);
    let body = new p2.Body({
      mass: 0,
      position: pos
    })
    for (let i = 0; i < chunk.width; i++) {
      for (let j = 0; j < chunk.height; j++) {
        let block = chunk.getBlock(i, j);
        let shape = this.buildShape(block);
        if (shape !== null) { // maybe instance of p2.Shape instead?
          body.addShape(shape, [i, j]);
        }
      }
    }
    priv.bodyCache.addBody(body, chunkI, chunkJ);
    return body;
  }
}

module.exports = ChunkBodyBuilder;