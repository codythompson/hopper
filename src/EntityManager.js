const _ = require('lodash');
const p2 = require('p2');

/*
 * private varaibles object
 */
let priv = {};

/**
 * @class EntityManager
 * @todo actually get entities from a chunk
 * @todo disable or remove bodies from p2 when not visible
*/
class EntityManager {
  constructor (args) {
    if (typeof args.camera !== 'object') {
      throw '[hopper][EntityManager][constructor] "camera" must exist in the args obj and be of type object.'
    }
    if (!args.world) {
      throw '[hopper][EntityManager][constructor] "world" is a required arg';
    }
    args = _.defaults(args, {
      chunkRenderer: null,
      update_margin: 2
    });

    /*
     * public fields
    */
    _.extend(this, {
      camera: args.camera,
      chunkRenderer: args.chunkRenderer,
      update_margin: args.update_margin,
      world: args.world
    });
    /*
     * private fields
     */
    _.extend (priv, {
      chunks: {}
    });
  }

  add (entity) {
    let [chunkI, chunkJ] = this.camera.worldToChunk(entity.x, entity.y);
    this.addToChunk(entity, chunkI, chunkJ);
    this.world.addBody(entity.getBody());
  }

  addToChunk (entity, chunkI, chunkJ) {
    if (!this.chunkExists(chunkI, chunkJ)) {
      if (!(chunkI in priv.chunks)) {
        priv.chunks[chunkI] = {};
      }
      if (!(chunkJ in priv.chunks[chunkI])) {
        priv.chunks[chunkI][chunkJ] = [];
      }
    }
    this.getChunk(chunkI, chunkJ).push(entity);
  }

  move (entityIx, oldChunkI, oldChunkJ, newChunkI, newChunkJ) {
    let oldChunk = this.getChunk(oldChunkI, oldChunkJ);

    if (!Array.isArray(oldChunk) || entityIx < 0 || entityIx >= oldChunk.length) {
      throw '[EntityManager][move] invalid chunk coords';
    }

    let [entity] = oldChunk.splice(entityIx, 1);
    this.addToChunk(entity, newChunkI, newChunkJ);
    console.log(`moved from ${oldChunkI},${oldChunkJ} to ${newChunkI},${newChunkJ}`);
  }

  chunkExists (chunkI, chunkJ) {
    return chunkI in priv.chunks && chunkJ in priv.chunks[chunkI];
  }

  getChunk (chunkI, chunkJ) {
    if (this.chunkExists(chunkI, chunkJ)) {
      return priv.chunks[chunkI][chunkJ];
    } else {
      return null;
    }
  }

  forEachInRange (minChunkI, minChunkJ, maxChunkI, maxChunkJ, iterFunc) {
    for (let i = minChunkI; i < maxChunkJ; i++) {
      for (let j = minChunkJ; j < maxChunkJ; j++) {
        iterFunc(this.getChunk(i, j), i, j);
      }
    }
  }

  forEachInVisibleRange (margin, iterFunc) {
    let [left, bottom, right, top] = this.camera.getRoundedVisibleChunkBounds(margin);
    this.forEachInRange(left, bottom, right, top, iterFunc);
  }

  update (dt) {
    this.forEachInVisibleRange(this.update_margin, (chunk)=>{
      if (Array.isArray(chunk)) {
        for (let entity of chunk) {
          entity.preUpdate(dt);
        }
      }
    });

    // TODO make this configurable
    const stepTime = 1/60;
    const maxSubSteps = 10;
    
    this.world.step(stepTime, dt, maxSubSteps);

    /*
     * for each entity in the visible chunk range
     * run their update function, which sets their new x and y
     * to match their physics body's x and y
     * and then figure out if they changed chunks
     */
    let toMove = [];
    this.forEachInVisibleRange(this.update_margin, (chunk, i, j)=>{
      if (Array.isArray(chunk)) {
        for (let entIx = 0; entIx < chunk.length; entIx++) {
          let entity = chunk[entIx];
          entity.update(dt);
          let [chunkI, chunkJ] = this.camera.worldToChunk(entity.x, entity.y);
          if (chunkI !== i || chunkJ !== j) {
            toMove.push({entIx, i, j, chunkI, chunkJ});
          }
        }
      }
    });

    /*
     * move all of the entities that changed chunks
     */
    for (let moveInfo of toMove) {
      // moveInfo.i is old chunkI
      // moveInfo.j is old chunkJ
      // moveInfo.chunkI is new chunkI
      // moveInfo.chunkJ is new chunkJ
      this.move(moveInfo.entIx, moveInfo.i, moveInfo.j, moveInfo.chunkI, moveInfo.chunkJ);
    }
  }

  render () { 
    if (!this.chunkRenderer) {
      return;
    }

    window.renderList = [];

    let [left, bottom, right, top] = this.camera.getRoundedVisibleChunkBounds(this.update_margin);
    for (let i = left; i <= right; i++) {
      for (let j = bottom; j <= top; j++) {
        let chunk = this.getChunk(i, j);
        if (Array.isArray(chunk)) {
          renderList.push({i, j, cnt: chunk.length});
          for (let entity of chunk) {
            this.chunkRenderer.addBlocks(entity.getBlocks(this.camera));
          }
          this.chunkRenderer.render(this.camera, i, j);
        }
      }
    }
  }
}

module.exports = EntityManager;