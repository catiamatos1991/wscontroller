'use strict';


function DevicesDatabase() {}

DevicesDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow ', 'data', data);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'data.access', JSON.stringify(data.access));

    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
			
            client.query("INSERT INTO devices  \
                (id, created_date, modified_date,data, vpn_configuration, created_by, modified_by, organization_id, device_type_id, deleted, access) \
                VALUES ($1, NOW(), NOW(), $2, $3, $4, $4, $5, $6, false, $7)   \
                RETURNING id, created_date, modified_date, data, vpn_configuration, created_by, modified_by, organization_id, device_type_id, access",
                    [data.id, data.data, data.vpn_configuration, data.created_by, data.organization_id, data.device_type_id, JSON.stringify(data.access)], function (err, result) {
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

DevicesDatabase.prototype.getDevices = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevices', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevices', err);
                reject(err);
                return
            }
            client.query('SELECT devices.*, device_types.manufacturer, device_types.model, device_types.data AS device_type_data, organizations.data AS organization_data \
                FROM devices LEFT JOIN device_types ON devices.device_type_id = device_types.id \
                LEFT JOIN organizations ON devices.organization_id = organizations.id WHERE NOT devices.deleted AND NOT device_types.deleted', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevices', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

DevicesDatabase.prototype.getDeviceById = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM devices WHERE id = $1 AND NOT deleted', [deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

DevicesDatabase.prototype.getDeviceServicesById = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceServicesById', 'inicio');

    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceServicesById', err);
                reject(err);
                return
            }
            client.query('SELECT access FROM devices WHERE id = $1 AND NOT deleted', [deviceId], function (err, result) {
                done();
                if (err) { //result.rowCount == 0
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceServicesById', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}


DevicesDatabase.prototype.deleteDeviceById = function (interfaceTypeId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceById', err);
                reject(err);
                return
            }
            client.query('UPDATE devices set deleted = true WHERE id = $1', [interfaceTypeId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });
}

/*DevicesDatabase.prototype.deleteDeviceById = function (deviceId) {
 return new Promise(function (resolve, reject) {
 pg.connect(dbConnectionString, function (err, client, done) {
 if (err) {
 reject(err);
 return
 }
 
 var queries = [function (cb) { client.query('BEGIN', cb); }];
 
 queries.push(function(cb) {
 client.query('DELETE FROM configurations_history WHERE device_id = $1', [deviceId], cb);
 });
 queries.push(function(cb) {
 client.query('DELETE FROM configurations WHERE device_id = $1', [deviceId], cb);
 });       
 queries.push(function(cb) {
 client.query('DELETE FROM services WHERE device_id = $1', [deviceId], cb);
 });
 queries.push(function(cb) {
 client.query('DELETE FROM interfaces WHERE device_id = $1', [deviceId], cb);
 });
 queries.push(function(cb) {
 client.query('DELETE FROM devices WHERE id = $1', [deviceId], cb);
 });
 
 async.series(queries, function(err) {
 if(err) {
 console.log(err)
 client.query('ROLLBACK', function() {
 done();
 reject(err);
 });
 return;
 }
 
 //disconnect after successful commit
 client.query('COMMIT', function() {
 done();
 resolve();
 });
 })
 });
 });    
 }*/

DevicesDatabase.prototype.updateDeviceById = function (deviceId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateDeviceById', 'inicio');
	createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateDeviceById', 'data',data);
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateDeviceById', err);
                reject(err);
                return
            }
            client.query('UPDATE devices SET modified_date=NOW(), data=$1, vpn_configuration=$2, modified_by=$3, organization_id=$4, device_type_id=$5, network_id=$6 \
                WHERE id = $7 AND NOT deleted RETURNING id, created_date, modified_date, data, vpn_configuration, created_by, modified_by, organization_id, device_type_id, network_id',
                    [data.data, data.vpn_configuration, data.modified_by, data.organization_id, data.device_type_id, data.network_id, deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateDeviceById', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

DevicesDatabase.prototype.getDeviceBySn = function (deviceSn) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceBySn', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceBySn', err);
                reject(err);
                return
            }
            client.query("SELECT * FROM devices WHERE data->>'sn' = $1 AND NOT deleted", [deviceSn], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceBySn', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

DevicesDatabase.prototype.getDeviceInterfacesById = function (deviceId, ifName) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceInterfacesById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceInterfacesById', err);
                reject(err);
                return
            }

            var query = "AND 1=1";
            var params = [deviceId];
            if (ifName) {
                query = "AND interfaces.data->>'ifname' = $2";
                params.push(ifName);
            }

            client.query(
                    "SELECT interfaces.id, interfaces.data, interfaces.device_id, interface_types.data AS interface_type_data \
				FROM interfaces \
                INNER JOIN interface_types ON interfaces.interface_type_id = interface_types.id \
                WHERE device_id = $1 AND NOT interfaces.deleted " + query,
                    params, function (err, result) {
                        done();
                        if (err) {
                            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceInterfacesById', err);
                            reject(err);
                        } else {
                            resolve(result.rows);
                        }
                    });
        });
    });
}

DevicesDatabase.prototype.getDevicesStats = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevicesStats', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevicesStats', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM devices', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevicesStats', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}


module.exports = new DevicesDatabase();