

const { Client } = require('pg');
const app = require('express')();
const http = require('http').createServer(app);

class DB{
    constructor(emitter) {
        this.eventEmitter = emitter;
        this.activateListeners();
        this.client = new Client(credentials);
        // console.log(this.client);
        this.client.connect();
    }
    async executeQuery(query) {
        try {
            const res = await this.client.query(query);
        } catch (err) {
            console.log(err.stack);
        } finally {
            // this.client.end();
        }
    }
    createTable(tableName) {
        const createTableQuery = `
        CREATE TABLE ${tableName} (
        ID SERIAL PRIMARY KEY,
        DATA jsonb
    );
    `;
    this.executeQuery(createTableQuery);
    }
    deleteTable(tableName) {
        const query = `
        DROP TABLE ${tableName};
        `
        this.executeQuery(query);
    }
    insertData(tableName, data) {
        let query = `
        INSERT INTO ${tableName} (DATA)
        VALUES('${data}')
        ;
        `
        this.executeQuery(query);
    }
    getData(tableName) {
        const query = `
        SELECT * FROM ${tableName}
        ORDER BY ID DESC
        ;
        `;
        this.client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            this.emitDBData(tableName, res.rows);

        });
    }

    getSingleData(tableName, id) {
        const query = `
        SELECT * FROM ${tableName}
        WHERE ID = ${id}
        ;
        `;
        this.client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            this.eventEmitter.emit('logDataResponse', res.rows[0]);
            // console.log('what');
        });

    }
    emitDBData(tableName, data) {
        const serverData = {
            event: `${tableName}DBData`,
            data: data,
        }
        console.log(serverData);
        this.eventEmitter.emit('ServerMessage', serverData);
    }

    updateData(tableName,data,id) {
        const query = `
        UPDATE ${tableName}
        SET DATA = '${data}'
        WHERE ID = ${id};
        `
        // console.log(query);
        this.executeQuery(query);
    }
    deleteData(tableName, id){
        const query = `
        DELETE FROM ${tableName}
        WHERE ID = ${id};
        `;
        // console.log(query);
        this.executeQuery(query);
    }

     deleteAllLogData(){
        const query = `
        DELETE  FROM LOG;

        `;
        // console.log(query);

        this.client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            this.eventEmitter.emit('getAllLogs');

        });
    }

    getLastLogID() {
         const query = `
             SELECT MAX(id) FROM Log;
        `;
         this.client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(res.rows[0].max)
             this.eventEmitter.emit('returnLastLogId', {
                lastId: res.rows[0].max,
            })

        });
    }
    addDataToLog(id, newData) {
        console.log('addtoLogDB');
        const query = `
             SELECT  *  FROM Log WHERE ID = ${id};
        `;

          this.client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                return;
            }
              let actualData = res.rows[0].data;
            //   console.log(actualData);
              actualData.logData.push(newData);
            //   actualData.logData = updateData;
              console.log(actualData);
              this.updateData('Log', JSON.stringify(actualData), id);


        });
    }


    activateListeners() {
        this.eventEmitter.on('saveNewProfile', (data) => {
            this.insertData('Profiles', JSON.stringify(data));
        })
        this.eventEmitter.on('getAllProfiles', (data) => {
            this.getData('Profiles');
        })
        this.eventEmitter.on('deleteProfile', (data) => {
            this.deleteData('Profiles', data.id);
            this.getData('Profiles');
        })


        this.eventEmitter.on('startNewLog', (data) => {
            console.log(data);
            this.insertData('Log', data);
        })
        this.eventEmitter.on('getAllLogs', (data) => {
            this.getData('Log');
        })
        this.eventEmitter.on('getLastLogId', (data) => {
            this.getLastLogID();
        })
        this.eventEmitter.on('addDataToLog', (data) => {
            this.addDataToLog(data.id, data.logData);
        })
        this.eventEmitter.on('getSingleData', (data) => {
            this.getSingleData(data.tableName, data.id);
        })

        this.eventEmitter.on('deleteAllLog', (data) => {
            this.deleteAllLogData();
        })


    }
}

module.exports = DB;