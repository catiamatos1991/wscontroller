'use strict';

function LogsDatabase() {}

LogsDatabase.prototype.getLogsByDevice = function (deviceId, type, startTimestamp, endTimestamp, measure) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getLogsByDevice', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbHistConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getLogsByDevice', err);
                reject(err);
                return
            }
            client.query("SELECT EXTRACT(EPOCH FROM timestamp) AS timestamp," + measure + ",type,agregation_period FROM default_dataset WHERE device_id = $1 AND type = $2 AND timestamp >= to_timestamp($3) AND timestamp <= to_timestamp($4) ORDER BY timestamp",
                    [deviceId, type, startTimestamp, endTimestamp], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getLogsByDevice', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

LogsDatabase.prototype.getLogTypesByDevice = function (deviceId, startTimestamp, endTimestamp) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getLogTypesByDevice', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbHistConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getLogTypesByDevice', err);
                reject(err);
                return
            }
            client.query("SELECT DISTINCT type FROM default_dataset WHERE device_id = $1 AND timestamp >= to_timestamp($2) AND timestamp <= to_timestamp($3)",
                    [deviceId, startTimestamp, endTimestamp], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getLogTypesByDevice', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

module.exports = new LogsDatabase();