
const { EventEmitter } = require("events");
let five = require("johnny-five");
let board = new five.Board({
    port: "/dev/ttyUSB1",
    repl: false,
});


class Board1 {
    constructor(emitter) {
        this.eventEmitter = emitter;
        this.activateListeners();
        this.intervalTask = "";
        this.intervalFrequency = 1000;
        this.motorRun = false;
    }
    activateListeners() {

    }
}

// const testEmitter = new EventEmitter()
// const b1 = new Board1(testEmitter);
// testEmitter.emit("lightBrightness", 50);
module.exports = Board1;