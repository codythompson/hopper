const _ = require('lodash');
const Keyboard = require('../Keyboard');
window.Keyboard = Keyboard;
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

        let scaleVel = 0;
        if (this.keyboard.isDown("ShiftLeft")) {
            scaleVel = 0.01;
        }
        if (this.keyboard.isDown(Keyboard.codes.Control)) {
            scaleVel = -0.01;
        }
        this.camera.scale += scaleVel;

        if (this.velX || this.velY || scaleVel) {
            return this.camera.updateMV();
        }

        if (this.keyboard.isDown(Keyboard.codes.r)) {
            this.camera.x = 0;
            this.camera.y = 0;
            this.velX = 0;
            this.velY = 0;
        }

        // debug box1
        let keyedY = false;
        if (this.keyboard.isDown(Keyboard.codes.s)) {
            window.box1.body.velocity[1] -= 0.1;
            keyedY = true;
        }
        if (this.keyboard.isDown(Keyboard.codes.w)) {
            window.box1.body.velocity[1] += 0.1;
            keyedY = true;
        }
        if (!keyedY) {
            window.box1.body.velocity[1] = 0;
        }
        let keyedX = false;
        if (this.keyboard.isDown(Keyboard.codes.a)) {
            window.box1.body.velocity[0] -= 0.1;
            keyedX = true;
        }
        if (this.keyboard.isDown(Keyboard.codes.d)) {
            window.box1.body.velocity[0] += 0.1;
            keyedX = true;
        }
        if (!keyedX) {
            window.box1.body.velocity[0] = 0;
        }
    }
}

module.exports = DbgCamController;