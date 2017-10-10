class CameraController {
    constructor (args) {
        if (!args.camera) {
            throw '[hopper][CameraController][constructor] args.camera is a required arg';
        }
        this.camera = args.camera;
    }
    update() {
        throw '[hopper][CameraController][update] attempted to call abstract method.';
    }
}

module.exports = CameraController;