class Timer {
  constructor(emitter, scheduleEmitter) {
    this.eventEmitter = emitter;
    this.scheduleEmitter = scheduleEmitter;
    this.activateListeners();
    this.timerActive = false;
    this.timerTask;
    this.runTime = -1;

    this.logFreq = 5;
  }

  activateListeners() {
    this.eventEmitter.on("startTimer", () => {
      this.startTimer();
    });
    this.eventEmitter.on("pauseTimer", () => {
      this.pauseTimer();
    });
    this.eventEmitter.on("resetTimer", () => {
      this.resetTimer();
    });
    this.eventEmitter.on("setTimerReady", () => {
      this.setTimerReady();
    });
  }
  startTimer() {
    if (this.timerActive) {
      return;
    }
    this.timerActive = true;
    this.timerTask = setInterval(() => {
      this.timerEvent();
    }, 1000);
  }

  timerEvent() {
    this.runTime++;
    console.log(this.runTime);
    this.emitTimeValue();

    this.scheduleLog();
  }

  scheduleLog() {
    if (this.runTime % this.logFreq == 0) {
      console.log('write');
      this.eventEmitter.emit('writeLogTrigger');
    }
  }
  emitTimeValue() {
    const clientData = {
      event: "timerClick",
      timerValue: this.runTime,
    };
    this.eventEmitter.emit("ServerMessage", clientData);
    this.eventEmitter.emit(this.runTime);
    this.scheduleEmitter.emit(this.runTime);
  }
  pauseTimer() {
    if (!this.timerActive) {
      return;
    }
    this.timerActive = false;
    clearInterval(this.timerTask);
  }
  setTimerReady() {
    this.runTime = -1;
    this.timerActive = false;
    clearInterval(this.timerTask);
  }

  resetTimer() {
    this.pauseTimer();
    this.runTime = -1;
    this.emitTimeValue();
  }

  setRuntime(newTime) {
    this.runTime = newTime;
  }
  getRunTime() {
    return this.runTime;
  }
}
module.exports = Timer;