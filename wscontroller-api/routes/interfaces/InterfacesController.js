'use strict';

function InterfacesController() {
    InterfacesController.prototype.setRoutes = function (express) {
        var router = express.Router();

        router.route('/:uuid')
                .get(this.getInterface)
                .put(this.updateInterface);

        router.route('/:uuid/configurations')
                .get(this.getInterfaceConfigurations)
                .put(this.updateInterfaceConfigurations);

        return router;
    };
}

/**
 * @api {get} /api/interfaces/:id Request Interface information
 * @apiVersion 0.1.0
 * @apiName GetInterface
 * @apiGroup Interfaces
 *
 * @apiParam {UUID} id Interfaces unique UUID.
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/interfaces/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Interface id.
 * @apiSuccess {Date} created_date  Interface created date.
 * @apiSuccess {Date} modified_date  Interface modified date.
 * @apiSuccess {UUID} created_by  Interface created by.
 * @apiSuccess {UUID} modified_by  Interface modified by.
 * @apiSuccess {UUID} device_id  Interface device.
 * @apiSuccess {UUID} interface_type_id  Interface type.
 * @apiSuccess {UUID} organization_id  Interface organization.
 * @apiSuccess {Object} data Interface data.
 * 
 * @apiError InvalidIdFormat Invalid Interface Id Format.
 * 
 */
InterfacesController.prototype.getInterface = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterface', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Interfaces.getInterfaceById(req.params.uuid).then(function (interfaces) {
        if (interfaces.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(interfaces[0]);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterface', e);
        res.send(e);
    });
}


/**
 * @api {put} /api/interfaces/:id Update interface 
 * @apiVersion 0.1.0
 * @apiName UpdateInterface
 * @apiGroup Interfaces
 *
 * @apiParam {UUID} id Interface unique UUID.
 * 
 * @apiParam {Object} data Interface information.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/interfaces/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Interface id.
 * @apiSuccess {Object} data Interface data.
 * 
 * @apiError InvalidIdFormat Invalid Device Type Id Format.
 * 
 */
InterfacesController.prototype.updateInterface = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateInterface', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var dataDb = Models.InterfaceTypes.parseData(req.body);

    Database.Interfaces.updateRow(req.params.uuid, dataDb).then(function (interfaceData) {
        if (interfaceData) {
            res.status(200).send(interfaceData);
        } else {
            res.status(404).end();
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateInterface', e);
        res.send(e);
    });
}

/**
 * @api {get} /api/interfaces/:id/configurations Request Interface configurations
 * @apiVersion 0.1.0
 * @apiName GetInterfaceConfigurations
 * @apiGroup Interfaces
 *
 * @apiParam {UUID} id Interfaces unique UUID.
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/interfaces/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/configurations
 * 
 * @apiSuccess {Object} object Object with interface configurations. Values are dependent of interface type.
 * 
 * @apiError InvalidIdFormat Invalid Interface Id Format.
 */
InterfacesController.prototype.getInterfaceConfigurations = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceConfigurations', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Interfaces.getInterfaceById(req.params.uuid).then(function (interfaces) {
        if (interfaces.length == 0) {
            res.status(404).end();
        } else {
            var deviceInterface = interfaces[0];
            var deviceId = deviceInterface.device_id;

            Database.InterfaceTypes.getInterfaceTypeById(deviceInterface.interface_type_id).then(function (interfaceTypes) {
                var interfaceType = interfaceTypes[0];
                var allPromises = [];
                var allResults = {};

                for (var i = 0; i < interfaceType.data.configs.length; i++) {
                    allPromises.push(Database.Configurations.getConfigurationByDeviceIdAndType(deviceId, interfaceType.data.configs[i]).then(function (configurations) {
                        if (configurations[0])
                            allResults[configurations[0].config_type] = configurations[0].data;
                    }));
                }
                Promise.all(allPromises).then(function () {
                    var returnConfigs = {};
                    switch (interfaceType.name) {
                        case "eth_wavesys":
                            returnConfigs = Controllers.Wavesys.parseEthConfigs(deviceInterface.data.ifname, allResults);
                            break;
                        case "modem_wavesys":
                            returnConfigs = Controllers.Wavesys.parseEthConfigs(deviceInterface.data.ifname, allResults);
                            break;
                        case "radio_wavesys":
                            returnConfigs = Controllers.Wavesys.parseRadioConfigs(deviceInterface.data.ifname, allResults);
                            break;
                        default:
                            break;
                    }
                    res.status(200).send(returnConfigs);
                });

            });
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceConfigurations', e);
        res.send(e);
    });
}

/**
 * @api {put} /api/interfaces/:id/configurations Update Interface configurations
 * @apiVersion 0.1.0
 * @apiName UpdateInterfaceConfigurations
 * @apiGroup Interfaces
 *
 * @apiParam {UUID} id Interfaces unique UUID.
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/interfaces/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/configurations
 * 
 * @apiSuccess {Object} object Object with interface configurations. Values are dependent of interface type.
 * 
 * @apiError InvalidIdFormat Invalid Interface Id Format.
 */
InterfacesController.prototype.updateInterfaceConfigurations = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateInterfaceConfigurations', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.InterfaceTypes.getInterfaceTypeById(req.body.interface_type_id).then(function (interfaceTypes) {
        var interfaceType = interfaceTypes[0];
        var allPromises = [];
        var allResults = {};

        for (var i = 0; i < interfaceType.data.configs.length; i++) {
            allPromises.push(Database.Configurations.getConfigurationByDeviceIdAndType(req.body.device_id, interfaceType.data.configs[i]).then(function (configurations) {
                allResults[configurations[0].config_type] = configurations[0].data;
            }));
        }
        Promise.all(allPromises).then(function () {
            var returnResult = {};
            switch (interfaceType.name) {
                case "eth_wavesys":
                    returnResult = Controllers.Wavesys.serializeEthConfigs(allResults, req.body);
                    break;
                case "radio_wavesys":
                    returnResult = Controllers.Wavesys.serializeRadioConfigs(allResults, req.body);
                    break;
                default:
                    break;
            }

            var allReturnPromises = [];
            for (var element in returnResult) {
                if (JSON.stringify(returnResult[element]) !== JSON.stringify(allResults[element])) {
                    allReturnPromises.push(Database.Configurations.updateConfigurationByDeviceIdAndType(req.body.device_id, element, returnResult[element]));
                }
            }
            Promise.all(allReturnPromises).then(function () {
                res.status(204).end();
            });
        });

    });

//  res.status(200).send();
}

module.exports = new InterfacesController();