const _ = require('lodash');
const p2 = require('p2');
const Shaders = require('./shaders/Shaders');
const Camera = require('./Camera');
const ChunkRenderer = require('./ChunkRenderer');
const ColorBlockRenderer = require('./ColorBlockRenderer');
const ChunkBodyBuilder = require('./ChunkBodyBuilder');
const SquareShapeBuilder = require('./SquareShapeBuilder');
const Chunker = require('./Chunker');
const EntityManager = require('./EntityManager');

class Player {
  constructor (args) {
    args = _.defaults(args, {
      parent: null,
      autoUpdate: true,
      autoRender: true,
      physicsArgs: {
        gravity: [0, -1]
      },
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

    this.p2World = new p2.World(args.physicsArgs);

    this.chunkRenderer = new ChunkRenderer({
      rendererMap: {
        ColorBlock: new ColorBlockRenderer({
          gl: gl,
          shader: this.shaders.colorBlock
        })
      }
    });

    this.chunkBodyBuilder = new ChunkBodyBuilder({
      world: this.p2World,
      builderMap: {
        square: new SquareShapeBuilder()
      }
    });

    this.chunker = new Chunker({
      camera: this.camera,
      chunkRenderer: this.chunkRenderer,
      chunkWidth: this.camera.blocksWide,
      chunkHeight: this.camera.blocksHigh,
      chunkFiller: args.chunkFiller,
      chunkBodyBuilder: this.chunkBodyBuilder
    });

    this.entityManager = new EntityManager({
      camera: this.camera,
      chunkRenderer: this.chunkRenderer,
      world: this.p2World
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

    this.chunker.update();
    this.entityManager.update(dt);

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

    let [chunkLeft, chunkBottom, chunkRight, chunkTop] = this.camera.getVisibleChunkBounds();
    chunkLeft = Math.round(chunkLeft);
    chunkBottom = Math.round(chunkBottom);
    chunkRight = Math.round(chunkRight);
    chunkTop = Math.round(chunkTop);

    this.chunker.render();
    this.entityManager.render();

    if (this.autoRender) {
      requestAnimationFrame(this.render);
    }
  } 
}

module.exports = Player;