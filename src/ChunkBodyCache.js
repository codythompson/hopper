let priv = null;

/**
 * ChunkBodyCache
 * Stores a limited amount of chunks' p2 bodies in memory
 */
class ChunkBodyCache {
  /**
   * @constructor
   * @param {*} args the arguments object
   * @param {p2.World} args.world the p2.World instance that all of the entitys exist in
   * @param {number} [args.size=256] the maximum number of bodies to store
   */
  constructor (args) {
    if (typeof args !== 'object') {
      throw '[hopper][ChunkBodyCache][constructor] an arguments object is required.';
    }
    if (!args.world) {
      throw '[hopper][ChunkBodyCache][constructor] "world" is a required arg.';
    }
    args = _.defaults(args, {
      size: 16*16
    });

    let cache = [];
    for (let i = 0; i < args.size; i++) {
      cache.push({
        body: null,
        i: null,
        j: null
      });
    }

    priv = {
      cache: cache,
      cachePtr: 0,
      cacheMap: {},
      world: args.world
    };
  }

  /**
   * @method deleteCacheMapEntry
   * Removes entries from the internal cache map
   * 
   * @param {number} i chunk column index
   * @param {number} j chunk row index
   */
  deleteCacheMapEntry (i, j) {
    if (this.hasBody(i, j)) {
      let rowMap = priv.cacheMap[i];
      delete rowMap[j];
      if (Object.keys(rowMap) === 0) {
        delete priv.cacheMap[i];
      }
    }
  }


  /**
   * @method addCacheMapEntry
   * Removes entries from the internal cache map
   * 
   * @param {number} i chunk column index
   * @param {number} j chunk row index
   * @param {number} ix the internal cache pointer
   */
  addCacheMapEntry (i, j, ptr) {
    if (!(i in priv.cacheMap)) {
      priv.cacheMap[i] = {};
    }
    if (!(j in priv.cacheMap[i])) {
      priv.cacheMap[i][j] = ptr;
    }
  }

  hasBody (i, j) {
    return i in priv.cacheMap && j in priv.cacheMap[i];
  }

  getBody (i, j) {
    if (this.hasBody(i,j)) {
      let ix = priv.cacheMap[i, j];
      return priv.cache[ix];
    } else {
      return null;
    }
  }

  addBody (body, i, j) {
    // if we already have an entry for i, j
    // replace the body if it's different
    if (this.hasBody(i,j)) {
      let ix = priv.cacheMap[i,j];
      let oldBody = priv.cache[ix].body;
      if (oldBody !== body) {
        priv.world.removeBody(oldBody);
        priv.world.addBody(body);
        priv.cache[ix].body = body;
      }
    } else {
      let cache = priv.cache[priv.cachePtr];

      if (this.hasBody(cache.i, cache.j)) {
        // if we are overwriting an existing entry
        // lets clear it out of the cachemap
        // and remove it from the world
        this.deleteCacheMapEntry(cache.i, cache.j);
        priv.world.removeBody(cache.body);
      }

      // reset the cache entry
      priv.world.addBody(body);
      cache.i = i;
      cache.j = j;
      cache.body = body;
      this.addCacheMapEntry(i, j, priv.cachePtr);

      // increment the cache pointer and rollover if necessary
      priv.cachePtr++;
      if (priv.cachePtr === priv.cache.length) {
        priv.cachePtr = 0;
      }
    }
  }

  get size () {
    return priv.cache.length;
  }
}

module.exports = ChunkBodyCache;