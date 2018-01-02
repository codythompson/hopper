const p2 = require('p2');

class SquareShapeBuilder {
  buildShape () {
    return new p2.Box({width: 1, height: 1});
  }
}