'use strict';


function ServicesDatabase() {}

ServicesDatabase.prototype.getServicesInterfaces = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getServicesInterfaces', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getServicesInterfaces', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM device_services', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getServicesInterfaces', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

ServicesDatabase.prototype.addRow = function (data, deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addRow','inicio');
	createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addRow','data', data);

    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addRow', err);
                reject(err);
                return
            }
			 client.query("INSERT INTO device_services  (id, data, device_id) VALUES ($1, $2, $3)RETURNING id, data, device_id", [data.id, data.data, deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addRow', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

ServicesDatabase.prototype.getDeviceServicesById = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceServicesById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceServicesById', err);
                reject(err);
                return
            }
            client.query('SELECT * from device_services WHERE device_id = $1 LIMIT 1', [deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getDeviceServicesById', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

ServicesDatabase.prototype.updateRow = function (data, deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateRow','inicio');

    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateRow', err);
                reject(err);
                return
            }
			 client.query("UPDATE device_services SET data=$1 where device_id=$2 ", [data.data, deviceId], function (err, result) {
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

ServicesDatabase.prototype.addMapInfo = function (data, deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','inicio');
	console.log('addMapInfo deviceId ', deviceId);
	createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','deviceId', deviceId);
	createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','data', data);

    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo', err);
                reject(err);
                return
            }
			createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','antes do client.query');
			client.query("UPDATE device_services SET data=jsonb_set(data::jsonb,'{map}',$1::jsonb,true), modified_date=NOW() WHERE device_id=$2", [data, deviceId], function (err, result) {
                done();
				createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','done');
				createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','result', result);
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo', err);
                    reject(err);
                } else {
					console.log('addMapInfo result.rowCount ', result.rowCount);
					if(result.rowCount>0){
						resolve(result.rowCount);
					}
                }
            });
        });
    });
	    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'addMapInfo','fim');
}

ServicesDatabase.prototype.getDeviceBySn = function (deviceSn) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceBySn', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceBySn', err);
                reject(err);
                return
            }
            client.query("SELECT * FROM devices WHERE data->>'sn' = $1", [deviceSn], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceBySn', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

ServicesDatabase.prototype.getDeviceServicesInterfacesById = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceServicesInterfacesById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceServicesInterfacesById', err);
                reject(err);
                return
            }
            client.query("SELECT data->>'interfaces' FROM device_services WHERE device_Id = $1", [deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceServicesInterfacesById', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}


ServicesDatabase.prototype.updateModemDeviceInterface = function (deviceId, ifname, status) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface','inicio');
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface','deviceId', deviceId);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface','ifname', ifname);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface','status', status);

    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface', err);
                reject(err);
                return
            }
            client.query("UPDATE device_services ds \
					SET data = jsonb_set(	\
						data,				\
						'{interfaces}',		\
						(					\
							SELECT	jsonb_agg(CASE WHEN j.value->>'ifname' = $1 THEN jsonb_set(j.value, '{enabled}', $2) ELSE j.value END) \
							FROM jsonb_array_elements(ds.data->'interfaces') AS j(value)										\
						)					\
				   ) WHERE ds.device_id=$3;", [ifname, status, deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface', err);
                    reject(err);
                } else {
                    if(result.rowCount>0){
						createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateModemDeviceInterface', "ok");
						resolve(result.rowCount);
					}
                }
            });
        });
    });
}

ServicesDatabase.prototype.updateWifiDeviceInterface = function (deviceId, ifname, status) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface','inicio');
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface','deviceId', deviceId);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface','ifname', ifname);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface','status', status);

    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface', err);
                reject(err);
                return
            }
            client.query("UPDATE device_services ds \
					SET data = jsonb_set(	\
						data,				\
						'{interfaces}',		\
						(					\
							SELECT	jsonb_agg(CASE WHEN j.value->>'ifname' = $1 THEN jsonb_set(j.value, '{disabled}', $2) ELSE j.value END) \
							FROM jsonb_array_elements(ds.data->'interfaces') AS j(value)										\
						)					\
				   ) WHERE ds.device_id=$3;", [ifname, status, deviceId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface', err);
                    reject(err);
                } else {
                    if(result.rowCount>0){
						createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'updateWifiDeviceInterface', "ok");
						resolve(result.rowCount);
					}
                }
            });
        });
    });
}

module.exports = new ServicesDatabase();