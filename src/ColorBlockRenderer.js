const glMat = require('gl-matrix');
const mat4 = glMat.mat4;
const vec2 = glMat.vec2;
const BlockRenderer = require('./BlockRenderer');

const vertComps = 2;
const vertsPerBlock = 6;
const colorComps = 4;

class ColorBlockRenderer extends BlockRenderer {
  constructor (args) {
    super(args);
    args = _.defaults(args, {
    });
    this.shader = args.shader;
    this.viewport = args.viewport;

    const blockCnt = this.viewport.blocksWide * this.viewport.blocksHigh;

    let gl = this.gl;
    this.blockCoordBuffer = gl.createBuffer();
    this.blockCoordArray = new Float32Array(blockCnt*vertsPerBlock*vertComps);
    this.blockCoordAtt = gl.getAttribLocation(this.shader, 'aBlockCoord');

    this.blockColorBuffer = gl.createBuffer();
    this.blockColorArray = new Float32Array(blockCnt*vertsPerBlock*colorComps);
    this.blockColorAtt = gl.getAttribLocation(this.shader, 'aBlockColor');

    this.centerBlockUni = gl.getUniformLocation(this.shader, 'uCenterBlock');

    this.projMatUni = gl.getUniformLocation(this.shader, 'uProjMat');

    this.mVMatUni = gl.getUniformLocation(this.shader, 'uMVMat');
    this.mVMatArray = mat4.create();

    this.currBlockIndex = 0;
  }

  bufferData () {
    let gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blockCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.blockCoordArray, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blockColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.blockColorArray, gl.STATIC_DRAW);
  }

  enableAttribs () {
    let gl = this.gl;
    gl.enableVertexAttribArray(this.blockCoordAtt);
    gl.enableVertexAttribArray(this.blockColorAtt);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.blockCoordBuffer);
    gl.vertexAttribPointer(this.blockCoordAtt, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.blockColorBuffer);
    gl.vertexAttribPointer(this.blockColorAtt, 4, gl.FLOAT, false, 0, 0);
  }

  disableAttribs () {
    let gl = this.gl;
    gl.disableVertexAttribArray(this.blockCoordAtt);
    gl.disableVertexAttribArray(this.blockColorAtt);
  }

  uniformData () {
    let gl = this.gl;
    gl.uniform2fv(this.centerBlockUni, this.viewport.center);
    gl.uniformMatrix4fv(this.projMatUni, false, this.viewport.projMat);
    gl.uniformMatrix4fv(this.mVMatUni, false, this.mVMatArray);
  }

  add (block) {
    let bcArr = this.blockCoordArray;
    let vcIx = this.currBlockIndex*vertsPerBlock*vertComps;
    let left = block.i;
    let right = block.i+1;
    let top = block.j+1;
    let bottom = block.j;

    // top left
    bcArr[vcIx++] = left;
    bcArr[vcIx++] = top;
    // bottom left
    bcArr[vcIx++] = left;
    bcArr[vcIx++] = bottom;
    // bottom right 
    bcArr[vcIx++] = right;
    bcArr[vcIx++] = bottom;

    // bottom right 
    bcArr[vcIx++] = right;
    bcArr[vcIx++] = bottom;
    // top right 
    bcArr[vcIx++] = right;
    bcArr[vcIx++] = top;
    // top left
    bcArr[vcIx++] = left;
    bcArr[vcIx++] = top;

    let colArr = this.blockColorArray;
    let colIx = this.currBlockIndex*vertsPerBlock*colorComps;
    let maxIx = (this.currBlockIndex+1)*vertsPerBlock*colorComps;
    while (colIx < maxIx) {
      colArr[colIx++] = block.colorR;
      colArr[colIx++] = block.colorG;
      colArr[colIx++] = block.colorB;
      colArr[colIx++] = block.colorA;
    }

    this.currBlockIndex++;
  }

  render () {
    this.bufferData();

    let gl = this.gl;
    gl.useProgram(this.shader);
    this.enableAttribs();
    this.uniformData();
    let vertCnt = this.currBlockIndex*vertsPerBlock;
    gl.drawArrays(gl.TRIANGLES, 0, vertCnt);
    this.disableAttribs();
    this.currBlockIndex = 0;
  }
};

module.exports = ColorBlockRenderer;