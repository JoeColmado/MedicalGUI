
const { ESTALE } = require("constants");

class Schedule {
    constructor(emitter, scheduleEmitter) {
        this.eventEmitter = emitter;
        this.scheduleEmitter = scheduleEmitter;
        this.activateListeners();
        this.scheduledTasks = [];
        this.eventListeners = [];
        this.timings = [];
    }
    activateListeners() {
        this.eventEmitter.on("setScheduleData", (data) => {

            this.scheduleEmitter.removeAllListeners();
            const rawData = JSON.parse(data.data);
            this.scheduledTasks = [];
            let offset = 0;
            rawData.forEach((element) => {
                const module = element.rawData;
                this.scheduledTasks.push({ t: offset, f: parseInt(module.f1), task: "setFreq" });
                offset += module.t1;
                this.scheduledTasks.push({ t: offset, f:  parseInt(module.f2), task: "setFreq" });
                offset += module.t2;
            });
            console.log(this.scheduledTasks);

            //   this.eventEmitter.emit("setTimerReady");

            //   this.eventListeners = [];

            this.scheduledTasks.forEach((task, index) => {
                this.scheduleEmitter.on(task.t, (e) => {
                    console.log("new frequency");
                    // console.log(task.f);
                    const serverData = {
                      event: "newFrequencySet",
                      newFrequency: task.f,
                    };
                    this.eventEmitter.emit("ServerMessage", serverData);

                    this.eventEmitter.emit("setMotorFrequency", {
                        newFrequency: task.f
                    });
                });
            });

            //   Timer Ende
            this.eventEmitter.emit('ServerMessage', {
                    event: 'programDuration',
                    duration: offset
                });
                this.eventEmitter.on(offset, (e) => {
                this.eventEmitter.emit("resetTimer");
                this.eventEmitter.emit("stopMotor");
                // console.log("finished");
            });
        });
    }
}

module.exports = Schedule;

