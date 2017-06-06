'use strict';

function InterfacesDatabase() {}

InterfacesDatabase.prototype.getInterfaceById = function (interfaceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM interfaces WHERE id = $1 AND NOT deleted', [interfaceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfacesDatabase.prototype.deleteInterfacesByDeviceId = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'deleteInterfacesByDeviceId', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'deleteInterfacesByDeviceId', err);
                reject(err);
                return
            }
            // client.query('DELETE FROM interfaces WHERE device_id = $1 AND NOT deleted',[deviceId],function (err, result) {
            client.query('UPDATE interfaces SET deleted = true WHERE device_id = $1', [deviceId], function (err, result) {

                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'deleteInterfacesByDeviceId', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfacesDatabase.prototype.updateInterfacesOrganizationByDeviceId = function (deviceId, organizationId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateInterfacesOrganizationByDeviceId', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateInterfacesOrganizationByDeviceId', err);
                reject(err);
                return
            }
            client.query('UPDATE interfaces SET organization_id = $1 WHERE device_id = $2 AND NOT deleted', [organizationId, deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateInterfacesOrganizationByDeviceId', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfacesDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addRow', err);
                reject(err);
                return
            }
            client.query('INSERT INTO interfaces  \
                (id, created_date, modified_date, created_by, modified_by, device_id, interface_type_id, data, organization_id, deleted) \
                VALUES ($1, NOW(), NOW(), $2, $2, $3, $4, $5, $6, false)   \
                RETURNING id, created_date, modified_date, created_by, modified_by, device_id, interface_type_id, data, organization_id',
                    [data.id, data.created_by, data.device_id, data.interface_type_id, data.data, data.organization_id], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addRow', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfacesDatabase.prototype.updateRow = function (interfaceId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateRow', err);
                reject(err);
                return
            }

            client.query('UPDATE interfaces SET data = $1 WHERE id = $2 AND NOT deleted \
                RETURNING id, data',
                    [data.data, interfaceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateRow', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

module.exports = new InterfacesDatabase();