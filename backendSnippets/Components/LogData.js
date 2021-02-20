const { EventEmitter } = require("events");
const { start } = require("repl");
const fs = require('fs');


const sendmail = require('sendmail')();


class logData {
    constructor(emitter) {
        this.eventEmitter = emitter;
        // this.setState('ready');
        this.activateListeners();
        this.lastId = -1;
        this.running = false;
        this.writing = false;
        this.motorFreq = -1;
        this.sensorValues = { values: 'empty' };
        this.motorRpm = -1;
        this.actual_click
    }

    activateListeners() {
        // this.eventEmitter.on
         this.eventEmitter.on('openControl', (data) => {
             console.log('open');
             setTimeout(() => {
                 this.getLastLogIndex();
             }, 50);

         })
         this.eventEmitter.on('closeControl', (data) => {
             console.log('close');
             this.lastId = -1;
         })
        this.eventEmitter.on('returnLastLogId', (data) => {
            // console.log(data);
            this.lastId = data.lastId
        })
        this.eventEmitter.on('newMachineState', (data) => {
            if (data.newState === 'running') {
                this.running = true;
                // console.log('ture');
            }
            else {
                this.running = false;
                // console.log('false');
            }
        });

        this.eventEmitter.on('setMotorFrequency', (data) => {
            this.motorFreq = data.newFrequency;
        })

        this.eventEmitter.on("setPressureOption", (data) => {
            this.motorRpm = data.newPressureOption;
        });

        this.eventEmitter.on('sensorValues', (data) => {
            this.sensorValues = data;
        })


        this.eventEmitter.on('writeLogTrigger', () => {
            this.startWriting();
        })

        this.eventEmitter.on('selectLogFile', (data) => {
            this.eventEmitter.emit('getSingleData', {
                tableName: 'Log',
                id: data.logId,
            })
        })

        this.eventEmitter.on('logDataResponse', (data) => {
           console.log(data);
        try {
            // fs.writeFileSync('log.json', JSON.stringify(data));
            // console.log("JSON data is saved.");

            sendmail({
            from: 'no-reply@seedworkerPump.com',
            to: 'wolfgang.werner@veosource.com',
            subject: 'logFile',
            html: JSON.stringify(data),
             }, function(err, reply) {
            console.log(err && err.stack);
            console.dir(reply);
            });

            } catch (error) {
            console.error(error);
        }
        })



    }

    startWriting() {
        if (this.lastId == -1) {
            return;
        }

        const logData = {
            sensorValues: this.sensorValues,
            motorFreq: this.motorFreq,
            motorRpm: this.motorRpm,

        }
        // console.log(logData);
        this.eventEmitter.emit('addDataToLog', {
            id: this.lastId,
            logData
        })

    }

    getLastLogIndex() {
        this.eventEmitter.emit('getLastLogId');

    }

}
module.exports = logData;
