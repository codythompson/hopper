module.exports = `

attribute vec2 aBlockCoord;
attribute vec4 aBlockColor;

uniform vec2 uCenterBlock;
uniform mat4 uProjMat;
uniform mat4 uMVMat;
uniform mat4 uChunkMat;

varying lowp vec4 vBlockColor;

void main () {
  vBlockColor = aBlockColor;
  vec2 offsetBlockCoord = aBlockCoord - uCenterBlock;
  gl_Position = uProjMat * uMVMat * uChunkMat * vec4(offsetBlockCoord, 1.0, 1.0);
}

`;