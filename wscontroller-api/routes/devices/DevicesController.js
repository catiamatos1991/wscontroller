'use strict';
var async = require("async");

function DevicesController() {
    DevicesController.prototype.setRoutes = function (express) {
        var router = express.Router();

        router.route('/')
                .get(passport.authenticate('jwt', {session: false}), this.getAllDevices)
                .post(passport.authenticate('jwt', {session: false}), this.createDevice);
		router.route('/stats')
                .get(this.getAllDevicesStats);
        router.route('/:uuid')
                .delete(passport.authenticate('jwt', {session: false}), this.deleteDevice)
                .put(passport.authenticate('jwt', {session: false}), this.updateDevice)
                .get(passport.authenticate('jwt', {session: false}), this.getDevice);
        router.route('/:uuid/interfaces')
                .get(this.getDeviceInterfaces);
        router.route('/setup')
                .post(this.setupDevice);
        router.route('/logevents')
                .post(this.logDevice);
        return router;
    };
}

/**
 * @api {post} /api/devices/logevents Log Device Events
 * @apiVersion 0.1.0
 * @apiName LogDeviceEvents
 * @apiGroup Devices
 *
 * @apiParam {Object} data Log event data.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/devices/logevents
 * 
 * @apiSuccess {String} status Setup status.
 * 
 * @apiError emptyBody Empty POST body.
 */
DevicesController.prototype.logDevice = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'logDevice', 'inicio');
    var data = req.body;

    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    fs.appendFile('/var/log/wscontroller_logevents.log', '[' + new Date() + '] ' + JSON.stringify(data) + '\n', (err) => {
        if (err) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'logDevice', err);
        }
		
    });
	
	/*var lineReader = require('line-reader');
	var regexTimestamp = /\w+\s\w+\s\d+\s\d+\s\d+:\d+:\d+\s\w+\+\d+\s\(\w+\)/;
	var regexData = /{.+}/;
	var path = '/var/log/wscontroller_logevents.log';
	var id = uuid.v4();
	// read all lines:
	lineReader.eachLine(path, function(line) {
		var resultDate = line.match(regexTimestamp);
		var resultData = line.match(regexData);
		if(resultDate[0]!=null && resultData[0]!=null){
			Database.Logs.addRow(id, resultData[0], resultDate[0]);
			console.log(line);
		}
	}).then(function (err) {
	  if (err) throw err;
	  console.log("I'm done!!");
	});*/

    if (data.serial !== undefined && data.serial !== "") {
        Database.Devices.getDeviceBySn(data.serial).then(function (devices) {

            if (devices.length > 0) {
                var alert = {};
                alert.id = uuid.v4();
                alert.type = "logevent";
                alert.data = data;
                alert.device_id = devices[0].id;
                alert.network_id = devices[0].network_id;
                alert.organization_id = devices[0].organization_id;

                var dataDb = Models.Alerts.parseData(alert);

                Database.Alerts.addRow(dataDb).then(function (result) {
                    res.status(200).send({'status': 'OK'});
                }).catch(function (e) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'logDevice', e);
                    res.status(500).send(e);
                });

            } else {
                res.status(400).send({error: "Invalid device"});
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'logDevice', 'Invalid device');
            }
        }).catch(function (e) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'logDevice', e);
            res.status(500).send(e);
        });
    } else {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'logDevice', 'Invalid serial number');
        res.status(400).send({error: "Invalid serial number"});
    }
}

/**
 * @api {get} /api/devices/ Request all devices
 * @apiVersion 0.1.0
 * @apiName GetAllDevices
 * @apiGroup Devices
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/devices/
 *  
 * @apiSuccess {Object[]} array An array of devices
 * @apiSuccess {UUID} array.id Device id
 * @apiSuccess {UUID} array.created_by Device created by
 * @apiSuccess {Date} array.created_date Device created date
 * @apiSuccess {Object} array.data Device data
 * @apiSuccess {Object} array.device_type_data Device type data
 * @apiSuccess {UUID} array.device_type_id Device type id
 * @apiSuccess {String} array.manufacturer Device manufacturer
 * @apiSuccess {String} array.model Device model
 * @apiSuccess {UUID} array.modified_by Device modified by
 * @apiSuccess {Date} array.modified_date Device modified date
 * @apiSuccess {UUID} array.network_id Device network id
 * @apiSuccess {Object} array.organization_data Device organization data
 * @apiSuccess {UUID} array.organization_id Device organization id
 * @apiSuccess {Object} array.vpn_configuration Device VPN configuration
 * 
 */
DevicesController.prototype.getAllDevices = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevices', 'inicio');
    Database.Devices.getDevices().then(function (devices) {
        if (devices.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(devices);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevices', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/devices/:id Request Device information
 * @apiVersion 0.1.0
 * @apiName GetDevice
 * @apiGroup Devices
 *
 * @apiParam {UUID} id Devices unique UUID.
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/devices/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Device id.
 * @apiSuccess {Date} created_date  Device created date.
 * @apiSuccess {Date} modified_date  Device modified date.
 * @apiSuccess {UUID} created_by  Device created by.
 * @apiSuccess {UUID} created_by  Device modified by.
 * @apiSuccess {UUID} device_type_id  Device type.
 * @apiSuccess {UUID} organization_id  Device organization.
 * @apiSuccess {Object} data  Device data.
 * @apiSuccess {Object} vpn_configuration Device VPN Configuration.
 * 
 * @apiError InvalidIdFormat Invalid Device Id Format.
 */
DevicesController.prototype.getDevice = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevice', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Devices.getDeviceById(req.params.uuid).then(function (devices) {
        if (devices.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(devices[0]);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDevice', e);
        res.status(500).send(e);
    });
}

/**
 * @api {delete} /api/devices/:id Delete device
 * @apiVersion 0.1.0
 * @apiName DeleteDevice
 * @apiGroup Devices
 *
 * @apiParam {UUID} id Device unique UUID.
 *
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/devices/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *
 * @apiError InvalidIdFormat Invalid Device Type Id Format. 
 * 
 */
DevicesController.prototype.deleteDevice = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDevice', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var allPromises = [];
    allPromises.push(Database.Configurations.deleteConfigurationsByDeviceId(req.params.uuid));
    allPromises.push(Database.Interfaces.deleteInterfacesByDeviceId(req.params.uuid));

    Promise.all(allPromises).then(function () {
        Database.Devices.deleteDeviceById(req.params.uuid).then(function (rowCount) {
            if (rowCount == 0) {
                res.status(404).end();
            } else {
                res.status(204).end();
            }
        }).catch(function (e) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDevice', e);
            res.status(500).send(e);
        });
    });
}

/**
 * @api {put} /api/device_types/:id Update device 
 * @apiVersion 0.1.0
 * @apiName UpdateDevice
 * @apiGroup Devices
 *
 * @apiParam {UUID} id Device unique UUID.
 * 
 * @apiParam {Object} data Device information.
 * @apiParam {Object} vpn_configuration Device VPN configuration.
 * @apiParam {UUID} modified_by Device modified_by.
 * @apiParam {UUID} organization_id Device organization id.
 * @apiParam {UUID} device_type_id Device type id.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/devices/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Device id.
 * @apiSuccess {Date} created_date  Device created date.
 * @apiSuccess {Date} modified_date  Device modified date.
 * @apiSuccess {UUID} created_by  Device created by.
 * @apiSuccess {UUID} created_by  Device modified by.
 * @apiSuccess {UUID} device_type_id  Device type.
 * @apiSuccess {UUID} organization_id  Device organization.
 * @apiSuccess {Object} data  Device data.
 * @apiSuccess {String} data.name  Device name.
 * @apiSuccess {Object} vpn_configuration Device VPN Configuration..
 * 
 * @apiError InvalidIdFormat Invalid Device Type Id Format.
 * @apiError emptyBody Empty POST body.
 * 
 */

DevicesController.prototype.updateDevice = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateDevice', 'inicio');
    var device = req.body;

    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var dataDb = Models.Devices.parseData(device);

    if (dataDb.organization_id != null) {
        return Promise.all([
            Database.Interfaces.updateInterfacesOrganizationByDeviceId(req.params.uuid, dataDb.organization_id),
            Database.Configurations.updateConfigurationsOrganizationByDeviceId(req.params.uuid, dataDb.organization_id)
        ]).then(function () {
            return Database.Devices.updateDeviceById(req.params.uuid, dataDb);
        }).then(function (device) {
            if (device) {
                res.status(200).send(device);
            } else {
                res.status(404).end();
            }
        }).catch(function (e) {
            res.status(500).send(e);
        });
    } else {
        return Database.DeviceTypes.getDeviceTypeByManufacturerAndModel(device.manufacturer, device.model).then(function (types) {
            var dataDb = Models.Devices.parseData(device);
            return Database.Devices.updateDeviceById(device.id, dataDb).then(function (device) {
                createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'updateDevice', 'UpdateRow');
                createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'updateDevice', 'setupInterfaces 1');
                return Controllers.Devices.setupInterfaces('wireless', 'radio', 'radio_wavesys', 'Radio', device, types[0]).then(function () {
                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'updateDevice', 'setupInterfaces 2');
                    return Controllers.Devices.setupInterfaces('product', 'lte', 'modem_wavesys', 'Modem', device, types[0]);
                }).then(function () {
                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'updateDevice', 'setupEthInterfaces');
                    return Controllers.Devices.setupEthInterfaces(device, types[0]);
                }).then(function () {
                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'updateDevice', 'setupConfigFiles');
                    return Controllers.Devices.setupConfigFiles(device);
                });
            });
        }).then(function () {
            return Database.Devices.updateDeviceById(req.params.uuid, dataDb);
        }).then(function (device) {
            if (device) {
                res.status(200).send(device);
            } else {
                res.status(404).end();
            }
        }).catch(function (e) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateDevice', e);
            res.status(500).send(e);
        });
    }
}

/**
 * @api {post} /api/devices/setup Setup Device
 * @apiVersion 0.1.0
 * @apiName SetupDevice
 * @apiGroup Devices
 *
 * @apiParam {Object} product Device information.
 * @apiParam {Object} services Device Services Information.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/devices/setup
 * 
 * @apiSuccess {String} status Setup status.
 * 
 * @apiError emptyBody Empty POST body.
 */
DevicesController.prototype.setupDevice = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'setupDevice', 'inicio');
    var data = req.body;
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    if (data.product.serial === undefined || data.product.serial === "") {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'setupDevice', 'Invalid serial number');
        res.status(400).send({error: "Invalid serial number"});
        return;
    }

    Database.Devices.getDeviceBySn(data.product.serial).then(function (devices) {
        if (devices.length == 0) {

            var device = {};
            device.id = uuid.v4();
            device.data = {};
            device.data.sn = data.product.serial;
            device.data.name = data.product.serial;
            /*for (var i = 0; i < data.services.length; i++) {
             if (data.services[i].api !== undefined) {
             device.vpn_configuration = data.services[i].api;
             break;
             }
             }*/
            var services = [];
			device.access = {};
			
            for (var i = 0; i < data.services.length; i++) {
                var serviceApi = data.services[i].api;
                if (serviceApi) {
				//	var name = serviceApi.name;
				//	device.access[name] = device.access[name] || [];
                 //   device.access[name].push({
					 services.push({
                       // "name": "wmscli",
                        "username": "root",
                        "password": "Wavec0m!",
                        "address": serviceApi.ip,
                        "port": serviceApi.port
                    });
                    device.vpn_configuration = serviceApi;
                }
            }

			device.access = { 'wmscli': services};
			device.access = { 'wmscli': services, 'reload':false};
			// device.access = services;
			
			createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', 'services',services);

            if (data.product.manufacturer !== undefined && data.product.model !== undefined) {

                return Database.DeviceTypes.getDeviceTypeByManufacturerAndModel(data.product.manufacturer, data.product.model).then(function (types) {
                    if (types.length > 0) {
                        device.device_type_id = types[0].id;
                        var dataDb = Models.Devices.parseData(device);

                        return Database.Devices.addRow(dataDb).then(function (device) {
                            return Promise.all([
                                Controllers.Devices.setupInterfaces('wireless', 'radio', 'radio_wavesys', 'Radio', device, types[0]),
                                Controllers.Devices.setupInterfaces('product', 'lte', 'modem_wavesys', 'Modem', device, types[0]),
                                Controllers.Devices.setupEthInterfaces(device, types[0]),
                                Controllers.Devices.setupConfigFiles(device)
                            ]);
                        }).then(function () {
                            res.status(200).send({"status": "OK"});
                        }).catch(function (e) {
                            res.status(500).send(e);
                        });
                    } else {
                        var dataDeviceType = {};
                        dataDeviceType.id = uuid.v4();
                        dataDeviceType.manufacturer = data.product.manufacturer;
                        dataDeviceType.model = data.product.model;
						dataDeviceType.data = data.product.data;
						
                        return Database.DeviceTypes.addRow(Models.DeviceTypes.parseData(dataDeviceType)).then(function (deviceType) {
                            device.device_type_id = deviceType.id;

                            var dataDb = Models.Devices.parseData(device);

                            return Database.Devices.addRow(dataDb).then(function (device) {
                                return Promise.all([
                                    Controllers.Devices.setupInterfaces('wireless', 'radio', 'radio_wavesys', 'Radio', device, deviceType),
                                    Controllers.Devices.setupInterfaces('product', 'lte', 'modem_wavesys', 'Modem', device, deviceType),
                                    Controllers.Devices.setupEthInterfaces(device, deviceType),
                                    Controllers.Devices.setupConfigFiles(device)
                                ]);
                            }).then(function () {
                                res.status(200).send({"status": "OK"});
                            }).catch(function (e) {
                                res.status(500).send(e);
                            });
                        }).catch(function (e) {
                            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', e);
                        });

                    }
                }).catch(function (e) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', e);
                    res.status(500).send(e);
                });
            } else {
                var dataDb = Models.Devices.parseData(device);

                return Database.Devices.addRow(dataDb).then(function (device) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', 'status: OK');
                    res.status(200).send({"status": "OK"});
                }).catch(function (e) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', e);
                    res.status(500).send(e);
                });
            }
        } else {
            /*var device = devices[0];
             for (var i = 0; i < data.services.length; i++) {
             if (data.services[i].api !== undefined) {
             device.vpn_configuration = data.services[i].api;
             break;
             }
             }*/
            var device = devices[0];
			var services = [];
			device.access = {};
			
            for (var i = 0; i < data.services.length; i++) {
                var serviceApi = data.services[i].api;
                if (serviceApi) {
				//	var name = serviceApi.name;
				//	device.access[name] = device.access[name] || [];
                 //   device.access[name].push({
					 services.push({
                       // "name": "wmscli",
                        "username": "root",
                        "password": "Wavec0m!",
                        "address": serviceApi.ip,
                        "port": serviceApi.port
                    });
                    device.vpn_configuration = serviceApi;
                }
            }

			device.access = { 'wmscli': services};
			// device.access = services;
            
			
			createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', 'services',services);

            device.user_id = device.modified_by;
            var dataDb = Models.Devices.parseData(device);

            return Database.Devices.updateDeviceById(device.id, dataDb).then(function (device) {
                if (device) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', 'status: OK');
                    res.status(200).send({"status": "OK"});
                } else {
                    res.status(404).end();
                }
            }).catch(function (e) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupDevice', e);
                res.status(500).send(e);
            });
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'setupDevice', e);
        res.status(500).send(e);
    });
}

/**
 * @api {post} /api/devices Create Device
 * @apiVersion 0.1.0
 * @apiName PostDevice
 * @apiGroup Devices
 *
 * @apiParam {Object} data Device information.
 * @apiParam {Object} vpn_configuration Device VPN configuration.
 * @apiParam {UUID} created_by Device created_by.
 * @apiParam {UUID} organization_id Device organization id.
 * @apiParam {UUID} device_type_id Device type id.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/devices/
 * 
 * @apiSuccess {UUID} id Device id.
 * @apiSuccess {Date} created_date Device created date.
 * @apiSuccess {Date} modified_date Device modified date.
 * @apiSuccess {Object} data Device data.
 * @apiSuccess {Object} vpn_configuration Device VPN configuration.
 * @apiSuccess {UUID} created_by Device created by.
 * @apiSuccess {UUID} modified_by Device modified by.
 * @apiSuccess {UUID} organization_id Device organization id.
 * @apiSuccess {UUID} device_type_id Device type id.
 * 
 * @apiError emptyBody Empty POST body.
 */
DevicesController.prototype.createDevice = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createDevice', 'inicio');
    var data = req.body;

    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    data.id = uuid.v4();
    var dataDb = Models.Devices.parseData(data);

    Database.Devices.getDeviceBySn(data.data.sn).then(function (devices) {
        if (devices.length == 0) {
            Database.Devices.addRow(dataDb).then(function (device) {
                res.location('/devices/' + device.id);
                res.status(201).send(device);
            }).catch(function (e) {
                res.status(500).send(e);
            });
        } else {
            res.status(409).end();
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createDevice', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/devices/:id/interfaces Request Device Interfaces
 * @apiVersion 0.1.0
 * @apiName GetDeviceInterfaces
 * @apiGroup Devices
 *
 * @apiParam {UUID} id Device unique UUID.
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/devices/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/interfaces
 * 
 * @apiSuccess {Object[]} array An array of device interfaces
 * @apiSuccess {UUID} id Interface id.
 * @apiSuccess {UUID} device_id Interface device id.
 * @apiSuccess {Object} data  Interface data.
 * @apiSuccess {Object} interface_type_data  Interface type data.
 * 
 * @apiError InvalidIdFormat Invalid Device Id Format.
 * 
 */
DevicesController.prototype.getDeviceInterfaces = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceInterfaces', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    return Database.Devices.getDeviceInterfacesById(req.params.uuid).then(function (deviceInterfaces) {
        if (deviceInterfaces.length == 0) {
            res.status(204).end();
        } else {
            res.status(200).send(deviceInterfaces);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceInterfaces', e);
        res.status(500).send(e);
    });
}

DevicesController.prototype.setupInterfaces = function (config, keyPrefix, interfaceTypeName, prefixLabel, device, deviceType) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupInterfaces', 'inicio');
    return Controllers.Devices.getRadioInfo('uci', 'get', {"config": config}, device).then(function (data) {

        if (data != null) {
            var patt = new RegExp(keyPrefix + "[0-9]");

            return new Promise(function (resolve, reject) {
                var values = data.values;
                var keys = _.keys(values);

                async.eachSeries(keys, function (key, callback) {

                    if (patt.test(key)) {
                        return Database.InterfaceTypes.getInterfaceTypeByName(interfaceTypeName).then(function (interfaceTypes) {

                            if (interfaceTypes.length > 0) {
                                var interfaceType = interfaceTypes[0];
                                var interfaceData = {};
                                interfaceData.id = uuid.v4();
                                interfaceData.device_id = device.id;
                                interfaceData.interface_type_id = interfaceType.id;
                                interfaceData.organization_id = device.organization_id;
                                interfaceData.data = {"ifname": key, "label": prefixLabel + ' ' + key.substr(keyPrefix.length)};

                                if (keyPrefix == 'radio') {
                                    var freqsList = [];
                                    var txpowerList = [];
                                    var countryList = [];
                                    var hwmodes = [];
                                    var allReturnPromises = [];
                                    var deviceObj = {"device": key};

                                    allReturnPromises.push(Controllers.Devices.getRadioInfo('iwinfo', 'freqlist', deviceObj, device));
                                    allReturnPromises.push(Controllers.Devices.getRadioInfo('iwinfo', 'countrylist', deviceObj, device));
                                    allReturnPromises.push(Controllers.Devices.getRadioInfo('iwinfo', 'txpowerlist', deviceObj, device));
                                    allReturnPromises.push(Controllers.Devices.getRadioInfo('iwinfo', 'info', deviceObj, device));

                                    return Promise.all(allReturnPromises).spread(function (resFreqsList, resCountryList, resTxpowerList, resHwmodes) {

                                        interfaceData.data.freqslist = resFreqsList.results || interfaceData.data.freqslist;
                                        interfaceData.data.txpowerlist = resTxpowerList.results || interfaceData.data.txpowerlist;
                                        interfaceData.data.countrylist = resCountryList.results || interfaceData.data.countrylist;
                                        interfaceData.data.hwmodes = resHwmodes.results || interfaceData.data.hwmodes;

                                        var dataDb = Models.Interfaces.parseData(interfaceData);

                                        return Database.Devices.getDeviceInterfacesById(interfaceData.device_id, key).then(function (result) {
                                            if (result.length > 0) {
                                                createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupInterfaces', 'updateRow');
                                                return Database.Interfaces.updateRow(interfaceData.device_id, dataDb);
                                            }
                                            createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupInterfaces', 'addRow');
                                            return Database.Interfaces.addRow(dataDb);
                                        });
                                    });
                                }

                                var dataDb = Models.Interfaces.parseData(interfaceData);

                                return Database.Devices.getDeviceInterfacesById(interfaceData.device_id, key).then(function (result) {
                                    if (result.length > 0) {
                                        createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupInterfaces', 'updateRow');
                                        return Database.Interfaces.updateRow(interfaceData.device_id, dataDb);
                                    }
                                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupInterfaces', 'addRow');
                                    return Database.Interfaces.addRow(dataDb);
                                });
                            }

                            return;
                        }).then(function () {
                            return callback();
                        });
                    }
                    return callback();
                }, function (err) {
                    if (err) {
                        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupInterfaces', err);
                        return reject(err);
                    }
                    return resolve();
                });
            });
        }

        return;
    });
}

DevicesController.prototype.setupEthInterfaces = function (device, deviceType) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupEthInterfaces', 'inicio');
    return Controllers.Devices.getRadioInfo('platform.network', 'list', {}, device).then(function (data) {
        if (data != null) {
            var list = data.list;
            for (var i = 0; i < list.length; i++) {
                var patt = new RegExp("eth[0-9]");
                if (patt.test(list[i])) {
                    (function (key, keyPrefix, prefixLabel, device, interfaceTypeName) {
                        return Database.InterfaceTypes.getInterfaceTypeByName(interfaceTypeName).then(function (interfaceTypes) {
                            if (interfaceTypes.length > 0) {

                                var interfaceType = interfaceTypes[0];
                                var interfaceData = {};
                                interfaceData.id = uuid.v4();
                                interfaceData.device_id = device.id;
                                interfaceData.interface_type_id = interfaceType.id;
                                interfaceData.organization_id = device.organization_id;
                                interfaceData.data = {ifname: key, label: prefixLabel + ' ' + key.substr(keyPrefix.length)};

                                var dataDb = Models.Interfaces.parseData(interfaceData);

                                return Database.Devices.getDeviceInterfacesById(interfaceData.device_id, key).then(function (result) {
                                    if (result.length > 0) {
                                        createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupEthInterfaces', 'updateRow');
                                        return Database.Interfaces.updateRow(interfaceData.device_id, dataDb);
                                    }
                                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupEthInterfaces', 'addRow');
                                    return Database.Interfaces.addRow(dataDb);
                                });
                            }
                        }).catch(function (e) {
                            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupEthInterfaces', e);
                        });
                    })(list[i], 'eth', 'Ethernet', device, 'eth_wavesys');
                }
            }
        }
    });
}

DevicesController.prototype.setupConfigFiles = function (device) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupConfigFiles', 'inicio');
    return Controllers.Devices.getRadioInfo('uci', 'configs', {}, device).then(function (data) {
        if (data != null) {
            for (var i = 0; i < data.configs.length; i++) {
                (function (config) {
                    return Controllers.Devices.getRadioInfo('uci', 'get', {"config": config}, device).then(function (data) {
                        if (data != null) {
                            var configData = {};
                            configData.id = uuid.v4()
                            configData.data = data.values;
                            configData.config_type = config + '_wavesys';
                            configData.device_id = device.id;
                            var dataDb = Models.Configurations.parseData(configData);
                            return Database.Configurations.getConfigurationByDeviceId(configData.device_id, configData.config_type).then(function (result) {
                                if (result.length > 0) {
                                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupConfigFiles', 'updateRow');
                                    return Database.Configurations.updateConfigurationByDeviceIdAndType(configData.device_id, configData.config_type);
                                }
                                createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'setupConfigFiles', 'addRow');
                                return Database.Configurations.addRow(dataDb);
                            });
                        }
                    });
                });
            }
        }
    });
}


DevicesController.prototype.getAllDevicesStats = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesStats', 'inicio');
    return Database.Devices.getDevicesStats().then(function (devices) {
        if (devices.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(devices);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesStats', e);
        res.status(500).send(e);
    });
}

DevicesController.prototype.getRadioInfo = function (path, procedure, signature, device) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getRadioInfo', 'inicio');
    return new Promise(function (resolve, reject) {
        return Controllers.Ubus.getSession(device.id).then(function (dataAuth) {

            if (dataAuth) {
                return Controllers.Ubus.execCommand(device.id, path, procedure, signature).then(function (data) {
					createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getRadioInfo', 'data', data);
                    if (data.result) {
                        if (data.result[0] == 0) {
                            resolve(data.result[1]);
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                })
            }
        }).catch(function (e) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), device.id, 'getRadioInfo', e);
            reject(e);
        });
    });
}

module.exports = new DevicesController();
