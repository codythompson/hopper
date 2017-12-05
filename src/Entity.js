const _ = require('lodash');

class Entity {
  constructor (args) {
    args = _.defaults(args, {
      x: 0,
      y: 0
    });
    _.extend(this, args);
  }

  preUpdate (dt) {
    // this.getBody().position = [this.x, this.y];
  }

  update (dt) {
    let [interpX, interpY] = this.getBody().interpolatedPosition;
    this.x = interpX;
    this.y = interpY;
  }

  getBlocks (camera) {
    throw '[hopper][Entity][getBlocks] tried to call abstract method.';
  }

  getBody () {
    throw '[hopper][Entity][getBody] tried to call abstract method.';
  }
}

module.exports = Entity;