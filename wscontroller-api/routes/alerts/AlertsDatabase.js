'use strict';

function AlertsDatabase() {}

AlertsDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query("INSERT INTO alerts  \
                (id, timestamp, type, data, device_id, item_id, network_id, organization_id) \
                VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)",
                    [data.id, data.type, data.data, data.device_id, data.item_id, data.network_id, data.organization_id], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

AlertsDatabase.prototype.updateAlertById = function (alertId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateAlertById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateAlertById', err);
                reject(err);
                return
            }
            client.query('UPDATE alerts SET data=$1 WHERE id = $2', [data.data, alertId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateAlertById', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

module.exports = new AlertsDatabase();