const _ = require('lodash');

/*
 * private varaibles object
 */
let priv = {};

/**
 * @class EntityManager
 * @todo actually get entities from a chunk
*/
class EntityManager {
  constructor (args) {
    if (typeof args.camera !== 'object') {
      throw '[hopper][EntityManager][constructor] "camera" must exist in the args obj and be of type object.'
    }
    args = _.defaults(args, {
      chunkRenderer: null
    });

    /*
     * public fields
    */
    _.extend(this, {
      camera: args.camera,
      chunkRenderer: args.chunkRenderer,
      needsSort: true
    });
    /*
     * private fields
     */
    _.extend (priv, {
      chunks: {},
      // TODO don't just store this
      entities: []
    });
  }

  addEntity (entity) {
    priv.entities.push(entity);
    this.needsSort = true;
  }

  sort () {
    priv.chunks = {};
    for (let entity of priv.entities) {
      let [chunkI, chunkJ] = this.camera.worldToChunk(entity.x, entity.y);
      if (!(chunkI in priv.chunks)) {
        priv.chunks[chunkI] = {};
      }
      if (!(chunkJ in priv.chunks[chunkI])) {
        priv.chunks[chunkI][chunkJ] = [];
      }
      priv.chunks[chunkI][chunkJ].push(entity);
    }
  }

  entitiesIn (chunkI, chunkJ) {
    return chunkI in priv.chunks && chunkJ in priv.chunks[chunkI];
  }

  getEntities (chunkI, chunkJ) {
    if (this.entitiesIn(chunkI, chunkJ)) {
      return priv.chunks[chunkI][chunkJ];
    } else {
      return [];
    }
  }

  update (dt) {
    if (this.needsSort) {
      this.sort();
      this.needsSort = false;
    }
    // TODO update physics objects
  }

  render () { 
    if (!this.chunkRenderer) {
      return;
    }

    let chunkBnds = this.camera.getVisibleChunkBounds();
    for (let i = 0; i < chunkBnds.length; i++) {
      chunkBnds[i] = Math.round(chunkBnds[i]);
    }
    let [chunkLeft, chunkBottom, chunkRight, chunkTop] = chunkBnds;

    for (let i = chunkLeft; i <= chunkRight; i++) {
      for (let j = chunkBottom; j <= chunkTop; j++) {
        for (let entity of this.getEntities(i, j)) {
          this.chunkRenderer.addBlocks(entity.getBlocks(this.camera));
        }
        this.chunkRenderer.render(this.camera, i, j);
      }
    }
  }
}

module.exports = EntityManager;