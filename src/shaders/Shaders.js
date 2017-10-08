const srcs = {
  colorBlock: {
    vs: require('./VertSrc/colorBlock.js'),
    fs: require('./FragSrc/colorBlock.js'),
  }
};

class Shaders {
  constructor (gl) {
    this.colorBlock = this.compile(gl, srcs.colorBlock.vs, srcs.colorBlock.fs);
  }

  /**
   * @name compile
   * returns a compiled shader program from the given source
   * adapted from: https://github.com/codythompson/gowest/blob/master/src/shaders.js
   * @param gl {WebGLContext} WebGL context object
   * @param vertSrc {string} The vertex shader source code
   * @param fragSrc {string} The fragment shader source code
   */
  compile (gl, vertSrc, fragSrc) {
    let vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertSrc);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      let compInfo = gl.getShaderInfoLog(vs);
      throw `[hopper][shaders][compile_program] vert shader issue:\n${compInfo}`;
    }

    let fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw '[hopper][shaders][compile_program] vert shader issue:\n' + gl.getShaderInfoLog(fs);
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw '[hopper][shaders][compile_program] Can\'t link program';
    }

    console.log(gl.getAttribLocation(prog, 'aBlockCoord'));
    console.log(gl.getAttribLocation(prog, 'aBlockColor'));

    return prog;
  }
}

module.exports = Shaders;