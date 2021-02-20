
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const port = new SerialPort("/dev/ttyUSB0", { baudRate: 230400 });
const parser = port.pipe(new Readline({ delimiter: "\n" })); // Read the port data

class Sensor {
  constructor(emitter) {
    this.eventEmitter = emitter;
    this.activateListeners();
  }
  activateListeners() {
    port.on("open", () => {
        console.log("serial port open");
        this.sendBoardReady();
    });
    port.on("close", () => {
        console.log("serial port close");
        this.sendBoardClose();
    });
    parser.on("data", (data) => {
      let arduinoData = data.toString("utf-8");
      //
      // console.log(arduinoData);
      if (data != null && data !== "") {

        // const sensorData;
        try {
          const clientData = {
            event: "sensorValues",
            data: JSON.parse(arduinoData),
          };
          this.eventEmitter.emit("ServerMessage", clientData);
          this.eventEmitter.emit("sensorValues", clientData);


        } catch (error) {
          // console.log(error);
        }
      }
    });
  }

  sendBoardReady() {

    const serverData = {
      board: "sensorBoard",
      state: true,
    };
    this.eventEmitter.emit("BoardConnection", serverData);
  }
  sendBoardClose() {

    const serverData = {
      board: "sensorBoard",
      state: false,
    };
    this.eventEmitter.emit("BoardConnection", serverData);
  }
}

module.exports = Sensor