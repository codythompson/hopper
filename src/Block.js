const _ = require('lodash');

class Block {
  constructor (args) {
    if (typeof args.i !== 'number' || typeof args.j !== 'number') {
      throw '[hopper][Block][constructor] args i and j must exist and be of type "Number"';
    }
    args = _.defaults(args, {
      rendererId: 'ColorBlock',
      colorR: 1,
      colorG: 1,
      colorB: 1,
      colorA: 1
    });
    _.extend(this, args);
  }
}

module.exports = Block;