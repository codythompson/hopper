let src = `

attribute vec2 aBlockCoord;
attribute vec4 aBlockColor;

uniform vec2 uCenterBlock;
uniform mat4 uProjMat;
uniform mat4 uMVMat;

varying lowp vec4 vBlockColor;

void main () {
  vBlockColor = vBlockColor;
  vec2 offsetBlockCoord = aBlockCoord - uCenterBlock;
  gl_Position = uProjMat * uMVMat * vec4(offsetBlockCoord, 1.0, 1.0);
}
`;


module.exports = {
  src: src
};