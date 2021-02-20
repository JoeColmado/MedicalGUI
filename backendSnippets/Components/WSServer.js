let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
const port = 3000;

class WSServer{

    constructor(emitter) {
        this.eventEmitter = emitter;
        this.activateListeners();
        this.connectionActive = false;
        this.clientServerListeners();
    }
   activateListeners() {
//
       http.listen(port, () => {
        });

    //   Client Connected
        // console.log('user connected');
        io.on('connection', (socket) => {
            this.connectionActive = true;
            this.eventEmitter.emit('WSConnection', { active: true });
            this.eventEmitter.emit('setupMachine');
            //Create a local Event when  incoming from ClientRequest
            socket.on('ClientMessage', (data) => {
                console.log(data);
               this.eventEmitter.emit(data.event, data);

            })
            // Client Disconnect =>  Machine offline
            socket.on('disconnect', () => {
                this.connectionActive = false;
                // console.log('user disconnected');
                this.eventEmitter.emit("unSetupMachine");
                this.eventEmitter.emit('WSConnection', { active: false });
                this.eventEmitter.emit('resetTimer', {});
            });
            // Emit Message to Client
            this.eventEmitter.on('ServerMessage', (data) => {
                // console.log(data);
                socket.emit(data.event, data);
            })
        })
   }
    // Return Machine State
    getState() {
        return this.connectionActive;
    }


    // Combination of Events App RunTime User Security Events
    clientServerListeners() {
        this.eventEmitter.on('playEvent', () => {
            console.log('play');
            this.eventEmitter.emit('startMotor');
            this.eventEmitter.emit('startTimer');
        })
        this.eventEmitter.on('pauseEvent', () => {
            console.log('pause');
            this.eventEmitter.emit('stopMotor');
            this.eventEmitter.emit('pauseTimer');
        })

        this.eventEmitter.on('setScheduleData', () => {
            this.eventEmitter.emit('resetTimer');
        })

        this.eventEmitter.on('setMotorFrequency', (data) => {
            const newFreq = data.newFrequency;
            this.eventEmitter.emit('ServerMessage', {
                event: 'newFrequencySet',
                newFrequency: newFreq,
            })
        })

        // Receive Profile Data from Client
        this.eventEmitter.on('openControl', (data) => {
            this.eventEmitter.emit('stopMotor');
            this.eventEmitter.emit('resetTimer');

            // console.log(data.mode);
            const dbData = {
                time: new Date(),
                mode: data.mode,
                logData: []
            };
            this.eventEmitter.emit('startNewLog', JSON.stringify(dbData));
        })

        this.eventEmitter.on('closeControl', (data) => {
            this.eventEmitter.emit('stopMotor');
            this.eventEmitter.emit('resetTimer');

        })
    }
}

module.exports = WSServer