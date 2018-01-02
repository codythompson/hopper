class ChunkBodyBuilder {
  constructor (args) {
    this.builderMap = args.builderMap;
  }

  buildShape (block) {
    let shapeId = block.shapeId;
    if (shapeId === null) {
      return null;
    }
    return this.builderMap[shapeId].buildShape();
  }

  buildBody (camera, chunkI, chunkJ) {
    let pos = camera.chunkToWorld (chunkI, chunkJ);
    let body = new p2.Body({
      mass: 0,
      position: pos
    })
    for (let i = 0; i < blocks.length; i++) {
      let col = blocks[i];
      for (let j = 0; j < col.length; j++) {
        let block = col[j];
        let shape = this.buildShape(block);
        if (shape !== null) { // maybe instance of p2.Shape instead?
          body.addShape(shape, [i, j]);
        }
      }
    }
  }
}