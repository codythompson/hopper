const _ = require('lodash');
const Shaders = require('./shaders/Shaders');
const Camera = require('./Camera');
const ColorBlockRenderer = require('./ColorBlockRenderer');

class Player {
  constructor (args) {
    args = _.defaults(args, {
      parent: null,
      autoUpdate: true,
      autoRender: true,
      cameraController: null
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

    this.shaders = new Shaders(gl);
    this.camera = new Camera({
      gl: gl,
      blocksWide: 128,
      blocksHigh: 64
    });
    if (args.cameraController) {
      this.cameraController = args.cameraController;
    }

    // TODO move this out to a chunk renderer
    this.blockRenderer = new ColorBlockRenderer({
      gl: gl,
      camera: this.camera,
      shader: this.shaders.colorBlock
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

  update () {
    if (this.kill) {
      return;
    }

    let now = Date.now();
    let dt = now - this.lastUpdate;

    if (this.cameraController) {
      this.cameraController.update(dt);
    }

    // TODO this shouldn't be here
    for (let i = 0; i < this.camera.blocksWide; i++) {
      for (let j = 0; j < this.camera.blocksHigh; j++) {
        this.blockRenderer.add({
          colorR: (i+j)/(this.camera.blocksWide+this.camera.blocksHigh),
          colorG: (i+j)/(this.camera.blocksWide+this.camera.blocksHigh),
          colorB: (i+j)/(this.camera.blocksWide+this.camera.blocksHigh),
          colorA: 1,
          i: i,
          j: j
        });
      }
    }
    // this.blockRenderer.add({
    //   colorR: 1,
    //   colorG: 1,
    //   colorB: 0,
    //   colorA: 1,
    //   i: 16,
    //   j: 16
    // });
    // this.blockRenderer.add({
    //   colorR: 0,
    //   colorG: 1,
    //   colorB: 1,
    //   colorA: 1,
    //   i: 0,
    //   j: 0
    // });
    // this.blockRenderer.add({
    //   colorR: 0,
    //   colorG: 1,
    //   colorB: 1,
    //   colorA: 1,
    //   i: 31,
    //   j: 31
    // });
    // this.blockRenderer.add({
    //   colorR: 0,
    //   colorG: 1,
    //   colorB: 0.5,
    //   colorA: 1,
    //   i: 15,
    //   j: 15
    // });
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
    this.blockRenderer.render();

    if (this.autoRender) {
      requestAnimationFrame(this.render);
    }
  } 
}

module.exports = Player;