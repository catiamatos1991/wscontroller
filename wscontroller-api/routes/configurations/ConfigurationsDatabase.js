'use strict';

function ConfigurationsDatabase() {}

ConfigurationsDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query('INSERT INTO configurations  \
                (id, created_date, modified_date, created_by, modified_by, device_id, config_type, data, organization_id, deleted) \
                VALUES ($1, NOW(), NOW(), $2, $2, $3, $4, $5, $6, false) \
                RETURNING id, created_date, modified_date, created_by, modified_by, device_id, config_type, data, organization_id',
                    [data.id, data.created_by, data.device_id, data.config_type, data.data, data.organization_id], function (err, result) {
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

ConfigurationsDatabase.prototype.deleteConfigurationsByDeviceId = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'deleteConfigurationsByDeviceId', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'deleteConfigurationsByDeviceId', err);
                reject(err);
                return
            }
            //  client.query('DELETE FROM configurations WHERE device_id = $1',[deviceId],function (err, result) {
            client.query('UPDATE configurations SET deleted=true WHERE device_id = $1', [deviceId], function (err, result) {

                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'deleteConfigurationsByDeviceId', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

ConfigurationsDatabase.prototype.getConfigurationByDeviceIdAndType = function (deviceId, type) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getConfigurationByDeviceIdAndType', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getConfigurationByDeviceIdAndType', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM configurations WHERE device_id = $1 AND config_type = $2 AND NOT deleted', [deviceId, type], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getConfigurationByDeviceIdAndType', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

ConfigurationsDatabase.prototype.updateConfigurationsOrganizationByDeviceId = function (deviceId, organizationId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateConfigurationsOrganizationByDeviceId', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateConfigurationsOrganizationByDeviceId', err);
                reject(err);
                return
            }
            client.query('UPDATE configurations SET organization_id = $1 WHERE device_id = $2 AND NOT deleted', [organizationId, deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateConfigurationsOrganizationByDeviceId', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

ConfigurationsDatabase.prototype.updateConfigurationByDeviceIdAndType = function (deviceId, type, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateConfigurationByDeviceIdAndType', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateConfigurationByDeviceIdAndType', err);
                reject(err);
                return
            }
            client.query('UPDATE configurations SET data=$1, modified_date=NOW() WHERE device_id = $2 AND config_type = $3 AND NOT deleted', [data, deviceId, type], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateConfigurationByDeviceIdAndType', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

module.exports = new ConfigurationsDatabase();