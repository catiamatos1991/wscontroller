'use strict';

function NetworksDatabase() {}

NetworksDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query('INSERT INTO networks (id, created_date, modified_date, data, created_by, modified_by, organization_id, deleted) \
                VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, false)   \
                RETURNING id, created_date, modified_date, data, created_by, modified_by, organization_id',
                    [data.id, data.data, data.created_by, data.modified_by, data.organization_id], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

NetworksDatabase.prototype.deleteNetworkById = function (networkId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteNetworkById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteNetworkById', err);
                reject(err);
                return
            }
            client.query('DELETE FROM networks WHERE id = $1 AND NOT deleted', [networkId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteNetworkById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });
}

NetworksDatabase.prototype.updateRow = function (networkId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                reject(err);
                return
            }

            client.query("UPDATE networks SET data=$1, modified_by=$2, modified_date=NOW() WHERE id = $3 AND NOT deleted \
            RETURNING id, created_date, modified_date, data, created_by, modified_by, organization_id",
                    [data.data, data.modified_by, networkId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

module.exports = new NetworksDatabase();