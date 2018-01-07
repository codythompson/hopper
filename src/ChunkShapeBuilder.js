const ChunkBodyCache = require('./ChunkBodyCache');

let priv = null;

class ChunkBodyBuilder {
  /**
   * @constructor
   * @param {*} args the arguments object
   * @param {object} args.buildMap an object that maps a shapeId to an instance of BlockShapeBuilder
   * @param {number} [args.bodyCacheSize] the size of the cache that will store the bodys
   */
  constructor (args) {
    if (typeof args !== 'object') {
      throw '[hopper][ChunkBodyBuilder][constructor] an arguments object is required.';
    }
    if (!args.builderMap) {
      throw '[hopper][ChunkBodyBuilder][constructor] "builderMap" is a required arg.';
    }
    this.builderMap = args.builderMap;

    priv = {
      bodyCache: new ChunkBodyCache({
        size: args.bodyCacheSize
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

  buildBody (camera, chunkI, chunkJ) {
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
    for (let i = 0; i < blocks.length; i++) {
      let col = blocks[i];
      for (let j = 0; j < col.length; j++) {
        let block = col[j];
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