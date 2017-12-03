const _ = require('lodash');

class Entity {
  constructor (args) {
    args = _.defaults(args, {
      x: 0,
      y: 0
    });
    _.extend(this, args);
  }

  getBlocks () {
    throw '[hopper][Entity][getBlocks] tried to call abstract method.';
  }
}