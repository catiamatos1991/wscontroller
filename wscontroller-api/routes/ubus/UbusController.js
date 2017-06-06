'use strict';

function UbusController() {}

UbusController.prototype.setRoutes = function (express) {
    var router = express.Router();
    return router;
}

/**
 * 
 */
UbusController.prototype.getSessionToken = function (deviceId, access) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getSessionToken', 'inicio');

    return new Promise(function (resolve, reject) {
        var options = {
            host: access.address,
            port: access.port,
            path: '/ubus',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var callback = function (res) {
            var data = '';

            res.on('data', function (chunk) {
                if (chunk != null) {
                    data += chunk;
                }
            });

            res.on('end', function () {
                if (data != '') {
                    data = JSON.parse(data);

                    if (data.result[0] == 0) {
                        var now = new Date().getTime();
                        var timeout = data.result[1].timeout;
                        var expire = Math.round((now + timeout) * 0.9);

                        radioAccess[deviceId] = {
                            "token": data.result[1].ubus_rpc_session,
                            "timeout": timeout,
                            "expire": expire,
                            "access": access,
							"reload": false
                        };

                        return resolve(radioAccess[deviceId]);
                    }
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getSessionToken', 'NO TOKEN');
                    return reject(">> NO TOKEN");
                }
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getSessionToken', 'NO TOKEN');
                return reject(">> NO TOKEN")
            });

            res.on('error', function (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getSessionToken', err);
                reject(err);
            });
        }

        var sendData = {"jsonrpc": "2.0", "id": 1, "method": "call", "params": ["00000000000000000000000000000000", "session", "login", {"username": access.username, "password": access.password}]};
        var req = http.request(options, callback);

        req.write(JSON.stringify(sendData));

        req.on('error', function (err) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getSessionToken', err);
            reject(err);
        });

        req.setTimeout(10000, function () {
            req.abort();
            reject({error: "request timeout"});
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getSessionToken', 'request timeout');

        });

        req.end();
    });
}

/**
 * 
 */
UbusController.prototype.checkSession = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'checkSession', 'inicio');

    var access = radioAccess[deviceId] || {};
    var now = new Date().getTime();

    return !access.token && now >= access.expire;
}

/**
 * 
 */
UbusController.prototype.getSession = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'getSession', 'inicio');

    return new Promise(function (resolve, reject) {
        if (UbusController.prototype.checkSession(deviceId)) {
            return resolve(radioAccess[deviceId]);
        }

        return UbusController.prototype.createSession(deviceId).then(function (dataAuth) {
            return resolve(dataAuth);
        });
    });
}

/**
 * 
 */
UbusController.prototype.createSession = function (deviceId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'createSession', 'inicio');

    return Database.Devices.getDeviceServicesById(deviceId).then(function (services) {
        var access = services.access.wmscli;
		createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'createSession', 'access', access);
        return UbusController.prototype.getSessionToken(deviceId, access);
    });
}

UbusController.prototype.execCommand = function (deviceId, path, procedure, signature) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'inicio');
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'deviceId',deviceId );
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'path', path);
    createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'procedure', procedure);
    createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'signature', signature);

    return new Promise(function (resolve, reject) {
        var session = radioAccess[deviceId];
        var access = session.access;

        var options = {
            host: access.address,
            port: access.port,
            path: '/ubus',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var callback = function (res) {
            var data = '';

            res.on('data', function (chunk) {
                if (chunk != null)
                    data += chunk;
            });

            res.on('end', function () {
                if (data != '') {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', e);
                        reject(e);
                    }

                }
            });

            res.on('error', function (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', err);
                reject(err);
            });
        }
		    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'antes do if do !session.reload ');

		if(!session.reload){
			new Promise(function (resolve, reject) {
				Controllers.Ubus.fileExec(deviceId, "exec","/etc/init.d/rpcd", "reload").then(function (data) {
					createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'execCommand reload', 'reload data', data);
					if (data.result) {
						createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'depois do if do !data.result ');
						if (data.result[0] == 0) {
							createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'depois do if do data.result[0] == 0 ');
							radioAccess[deviceId].reload=true;
							resolve(data.result[1]);
						} else {
							resolve(null);
						}
					} else {
						resolve(null);
					}
				}).catch(function (e) {
					createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'execCommand reload', e);
				});
            }).catch(function (e) {
				createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'execCommand', e);
				reject(e);
			});	
		}
		
		
		createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'depois do if do !session.reload ');
		createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'radioAccess[deviceId].reload', radioAccess[deviceId].reload);


        var sendData = {"jsonrpc": "2.0", "id": 1, "method": "call", "params": [session.token, path, procedure, signature]};
        var req = http.request(options, callback);

        req.write(JSON.stringify(sendData));
        req.setTimeout(10000, function () {
            req.abort();
            reject({error: "request timeout"});
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'request timeout');
        });
        req.on('error', function (err) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', err);
            reject(err);
        });
        req.end();
		createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'execCommand', 'fim');
    });
}

UbusController.prototype.uciRequest = function (procedure, signature, device) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'inicio');
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'device id', device.id);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'procedure', procedure);
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'signature', signature);

    let promise = new Promise(function (resolve, reject) {
        Controllers.Ubus.getSession(device.id).then(function (dataAuth) {
			createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'dataAuth', dataAuth);
            if (dataAuth) {
                Controllers.Ubus.execCommand(device.id, "uci", procedure, signature).then(function (data) {
					createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'data', data);
					var res=data;
                    if (data.result) {
                        if (data.result[0] == 0) {
                        }
                    } else {
                        reject("no data");
                    }
                });
            } else {
                reject("no data auth");
			}
        }).catch(function (e) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', e);
            reject(e);
        });
	});
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'uciRequest', 'promise', promise);
	return promise;    
}

UbusController.prototype.fileExec = function (deviceId, procedure, path, params) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', 'inicio');
    return new Promise(function (resolve, reject) {
        var session = radioAccess[deviceId];
        var access = session.access;

        var options = {
            host: access.address,
            port: access.port,
            path: '/ubus',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var callback = function (res) {
            var data = '';

            res.on('data', function (chunk) {
                if (chunk != null)
                    data += chunk;
            });

            res.on('end', function () {
                if (data != '') {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', e);
                        reject(e);
                    }

                }
            });

            res.on('error', function (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', err);
                reject(err);
            });
        }
		
				
		if(params==undefined){
			var fileData = {"jsonrpc": "2.0", "id": 1, "method": "call", "params": [session.token, "file", procedure, "{ command :"+ path+"}"]};
		} else {
			var signature = { command : path, params: [params]};
			var fileData = {"jsonrpc": "2.0", "id": 1, "method": "call", "params": [session.token, "file", procedure, signature]};
		}
		createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', 'fileData', fileData);

	   
		var req = http.request(options, callback);

        req.write(JSON.stringify(fileData));
        req.setTimeout(5000, function () {
            req.abort();
            reject({error: "request timeout"});
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', 'request timeout');
        });
        req.on('error', function (err) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', err);
            reject(err);
        });
        req.end();
		createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), deviceId, 'fileExec', 'fim');
    });
}

module.exports = new UbusController();