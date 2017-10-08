class BlockRenderer {
  constructor (args) {
    if (!args.gl) {
      throw '[hopper][BlockRenderer][constructor] args.gl is a required arg';
    }
    this.gl = args.gl;
  }

  add (block) {
    throw '[hopper][BlockRenderer][add] attempted to call abstract method.';
  }
  render () {
    throw '[hopper][BlockRenderer][render] attempted to call abstract method.';
  }
}

module.exports = BlockRenderer;