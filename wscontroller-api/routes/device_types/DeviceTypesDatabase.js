'use strict';

function DeviceTypesDatabase() {}

DeviceTypesDatabase.prototype.getDeviceTypes = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypes', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypes', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM device_types WHERE NOT deleted', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypes', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

DeviceTypesDatabase.prototype.getDeviceTypeById = function (deviceTypeId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypeById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypeById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM device_types WHERE id = $1 AND NOT deleted', [deviceTypeId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypeById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

DeviceTypesDatabase.prototype.getDeviceTypeByManufacturerAndModel = function (deviceManufacturer, deviceModel) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypeByManufacturerAndModel', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypeByManufacturerAndModel', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM device_types WHERE LOWER(manufacturer) = LOWER($1) AND LOWER(model) = LOWER($2) AND NOT deleted', [deviceManufacturer, deviceModel], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceTypeByManufacturerAndModel', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

DeviceTypesDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
			
            client.query('INSERT INTO device_types (id, manufacturer, model, data, deleted) \
                VALUES ($1, $2, $3, $4, false) RETURNING id, manufacturer, model, data',
                    [data.id, data.manufacturer, data.model, data.data], function (err, result) {
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

DeviceTypesDatabase.prototype.updateRow = function (deviceTypeId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                reject(err);
                return
            }

            client.query('UPDATE device_types SET manufacturer = $1, model = $2, data = $3 WHERE id = $4 AND NOT deleted\
                RETURNING id, manufacturer, model, data',
                    [data.manufacturer, data.model, data.data, deviceTypeId], function (err, result) {
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

DeviceTypesDatabase.prototype.deleteDeviceTypeById = function (deviceTypeId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceTypeById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceTypeById', err);
                reject(err);
                return
            }
            //  client.query('DELETE FROM device_types WHERE id = $1',[deviceTypeId],function (err, result) {
            client.query('UPDATE device_types SET deleted = true WHERE id = $1', [deviceTypeId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceTypeById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });
}

module.exports = new DeviceTypesDatabase();