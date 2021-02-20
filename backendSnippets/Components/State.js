class State {
    constructor(emitter) {
        this.eventEmitter = emitter;
        this.state = 'ready';
        // this.setState('ready');
        this.activateListeners();

        this.actorState = false;
        this.sensorState = false;

    }

    setState(newState) {
        this.state = newState;
        const serverData = {
            event: "newMachineState",
            newState: this.state,
        };
        // console.log(serverData);
        this.eventEmitter.emit('ServerMessage', serverData);
        this.eventEmitter.emit('newMachineState', serverData);
    }

    activateListeners() {
        this.eventEmitter.on('startTimer', () => {
            // console.log('Timer Start');
            this.setState("running");
        });
        this.eventEmitter.on('pauseTimer', () => {
            this.setState("paused");
            // console.log('Timer Pause');
        });
        this.eventEmitter.on('resetTimer', () => {
            this.setState("finished");
            setTimeout(() => {
                this.setState('ready');
            },1000)

            // console.log('Timer Reset');
        });

        this.eventEmitter.on("BoardConnection", (data) => {
            console.log(data);
            const board = data.board;
            const state = data.state;

            switch (board) {
                case 'actorBoard':
                    this.actorState = state;
                    break;
                case 'sensorBoard':
                    this.sensorState = state;
                    break;
                default:
                    break;
            }

            if (this.actorState && this.sensorState) {
                this.setState('ready');
            }
            else {
                this.setState('loading');
            }
        });


    }

}
module.exports = State;