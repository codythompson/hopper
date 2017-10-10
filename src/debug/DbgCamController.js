const _ = require('lodash');
const Keyboard = require('../Keyboard');
const CameraController = require('../CameraController');

class DbgCamController extends CameraController {
    constructor (args) {
        super(args);
        args = _.defaults(args, {
            keyboard: null,
            accelX: 0.1,
            accelY: 0.1,
        });
        if (!args.keyboard) {
            args.keyboard = new Keyboard();
        }
        _.extend(this, args);
        this.velX = 0;
        this.velY = 0;
    }

    update () {
        if (this.keyboard.isDown(Keyboard.codes.ArrowUp)) {
            this.velY += this.accelY;
        } else if (this.keyboard.isDown(Keyboard.codes.ArrowDown)) {
            this.velY -= this.accelY;
        } else {
            this.velY = 0;
        }
        if (this.keyboard.isDown(Keyboard.codes.ArrowRight)) {
            this.velX += this.accelX;
        } else if (this.keyboard.isDown(Keyboard.codes.ArrowLeft)) {
            this.velX -= this.accelX;
        } else {
            this.velX = 0;
        }

        this.camera.x += this.velX;
        this.camera.y += this.velY;

        if (this.keyboard.isDown(Keyboard.codes.r)) {
            this.camera.x = 0;
            this.camera.y = 0;
            this.velX = 0;
            this.velY = 0;
        }
    }
}

module.exports = DbgCamController;