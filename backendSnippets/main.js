// ---------------------------------------------------------------------------
// Create Emitter that calls on nextTick
function MyEmitter() {
    let i = 0;
    EventEmitter.call(this);
    // use nextTick to emit the event once a handler is assigned
    process.nextTick(() => {
        this.emit('event');
    });
}

const mainEmitter = new MyEmitter();
mainEmitter.setMaxListeners(200);

const scheduleEmitter = new MyEmitter();
scheduleEmitter.setMaxListeners(200);

// ----------------------------------------------------------------------

// Internal Communication with mainEmitter
const util = require('util');
const fs = require('fs');
const EventEmitter = require('events');

const schedule = require('./Components/schedule');
const SocketServer = require('./Components/WSServer');
const DB = require('./Components/DB.js');
const Timer = require('./Components/Timer');
const State = require('./Components/State');
const logData = require('./Components/LogData');

const wsServer = new WSServer(mainEmitter);
const db = new DB(mainEmitter);
const timer = new Timer(mainEmitter, scheduleEmitter);
const state = new State(mainEmitter);
const sc = new schedule(mainEmitter, scheduleEmitter);
const ld = new logData(mainEmitter);


const sensorBoard = false;
const actorBoard = false;

if (sensorBoard) {
    const Sensor = require('./Components/Sensor');
    const sensor = new Sensor(mainEmitter);
}
if (actorBoard) {
    const Board1 = require('./Components/Board1');
    const b1 = new Board1(mainEmitter);
}


