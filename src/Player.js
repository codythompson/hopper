const _ = require('lodash');
const Shaders = require('./shaders/Shaders');
const Camera = require('./Camera');
const ChunkRenderer = require('./ChunkRenderer');
const ColorBlockRenderer = require('./ColorBlockRenderer');

class Player {
  constructor (args) {
    args = _.defaults(args, {
      parent: null,
      autoUpdate: true,
      autoRender: true,
    });

    var canvas = document.createElement('canvas');
    var parent = args.parent;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    parent.appendChild(canvas);
    var gl = canvas.getContext('webgl');

    /*
    * fields / instance vars
    */
    this.canvas = canvas;
    this.parent = parent;
    this.gl = gl;
    this.autoUpdate = args.autoUpdate;
    this.autoRender = args.autoRender;
    this.kill = false;
    this.lastUpdate = null;
    this.eventListeners = {
      update: []
    };

    this.shaders = new Shaders(gl);
    this.camera = new Camera({
      gl: gl,
      blocksWide: 128,
      blocksHigh: 64
    });

    this.chunkRenderer = new ChunkRenderer({
      rendererMap: {
        ColorBlock: new ColorBlockRenderer({
          gl: gl,
          shader: this.shaders.colorBlock
        })
      }
    });

    this.update = this.update.bind(this);
    this.render = this.render.bind(this);

    if (this.autoUpdate) {
      this.lastUpdate = Date.now();
      this.update();
    }
    if (this.autoRender) {
      this.lastRender = Date.now();
      this.render();
    }
  }

  addEventListener(eventName, callback) {
    if (eventName in this.eventListeners) {
      this.eventListeners[eventName].push(callback);
    } else {
      throw `[hopper][Player][addEventListener] unknown event "${eventName}"`;
    }
  }

  fireEvent(eventName) {
    if (eventName in this.eventListeners) {
      let args = [];
      for (let i = 1; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      for (let listener of this.eventListeners[eventName]) {
        listener.call(this, args);
      }
    } else {
      throw `[hopper][Player][fireEvent] unknown event "${eventName}"`;
    }
  }

  update () {
    if (this.kill) {
      return;
    }

    let now = Date.now();
    let dt = now - this.lastUpdate;

    this.fireEvent('update', dt);

    // TODO this shouldn't be here
    let blocks = [];
    for (let i = 0; i < this.camera.blocksWide; i++) {
      let col = [];
      for (let j = 0; j < this.camera.blocksHigh; j++) {
        col.push({
          rendererId: 'ColorBlock',
          colorR: (i+j)/(this.camera.blocksWide+this.camera.blocksHigh),
          colorG: (i+j)/(this.camera.blocksWide+this.camera.blocksHigh),
          colorB: (i+j)/(this.camera.blocksWide+this.camera.blocksHigh),
          colorA: 1,
          i: i,
          j: j
        });
      }
      blocks.push(col);
    }
    this.chunkRenderer.addBlocks(blocks);
    //

    if (this.autoUpdate) {
      requestAnimationFrame(this.update);
    }
  } 

  render () {
    if (this.kill) {
      return;
    }

    let gl = this.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.chunkRenderer.render(this.camera, 0, 0);

    if (this.autoRender) {
      requestAnimationFrame(this.render);
    }
  } 
}

module.exports = Player;