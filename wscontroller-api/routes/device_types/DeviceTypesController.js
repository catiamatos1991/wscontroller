'use strict';

function DeviceTypesController() {}

//create routes
DeviceTypesController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .get(passport.authenticate('jwt', {session: false}), this.getAllDeviceTypes)
            .post(passport.authenticate('jwt', {session: false}), this.createDeviceType);
    router.route('/:uuid')
            .get(this.getDeviceType)
            .put(passport.authenticate('jwt', {session: false}), this.updateDeviceType)
            .delete(passport.authenticate('jwt', {session: false}), this.deleteDeviceType);

    return router;
}

/**
 * @api {get} /api/device_types/ Request all device types
 * @apiVersion 0.1.0
 * @apiName GetAllDeviceTypes
 * @apiGroup Device Types
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/device_types/
 * 
 * @apiSuccess {Object[]} array An array of device types
 * @apiSuccess {UUID} array.id Device Type id.
 * @apiSuccess {Object} array.data Device Type information.
 * @apiSuccess {String} array.manufacturer Device Type manufacturer.
 * @apiSuccess {String} array.model Device Type model.
 * 
 */
DeviceTypesController.prototype.getAllDeviceTypes = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDeviceTypes', 'inicio');
    Database.DeviceTypes.getDeviceTypes().then(function (deviceTypes) {
        if (deviceTypes.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(deviceTypes);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDeviceTypes', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/device_types/:id Request device type
 * @apiVersion 0.1.0
 * @apiName GetDeviceType
 * @apiGroup Device Types
 *
 * @apiParam {UUID} id Device type unique UUID.
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/device_types/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Device Type id.
 * @apiSuccess {Object} data Device Type information.
 * @apiSuccess {String} manufacturer Device Type manufacturer.
 * @apiSuccess {String} model Device Type model.
 * 
 * @apiError InvalidIdFormat Invalid Device Type Id Format.
 * 
 */
DeviceTypesController.prototype.getDeviceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceType', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.DeviceTypes.getDeviceTypeById(req.params.uuid).then(function (deviceTypes) {
        if (deviceTypes.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(deviceTypes[0]);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getDeviceType', e);
        res.status(500).send(e);
    });
}

/**
 * @api {post} /api/device_types/ Create new device type
 * @apiVersion 0.1.0
 * @apiName CreateDeviceType
 * @apiGroup Device Types
 *
 * @apiParam {Object} data Device Type information.
 * @apiParam {String} manufacturer Device Type manufacturer.
 * @apiParam {String} model Device Type model.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/device_types/
 * 
 * @apiSuccess {UUID} id Device Type id.
 * @apiSuccess {Object} data Device Type information.
 * @apiSuccess {String} manufacturer Device Type manufacturer.
 * @apiSuccess {String} model Device Type model.
 * 
 * @apiError emptyBody Empty POST body.
 * 
 */
DeviceTypesController.prototype.createDeviceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createDeviceType', 'inicio');
    var data = req.body;

    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    data.id = uuid.v4();
    var dataDb = Models.DeviceTypes.parseData(data);

    Database.DeviceTypes.addRow(dataDb).then(function (deviceType) {
        res.location('/device_types/' + deviceType.id);
        res.status(201).send(deviceType);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createDeviceType', e);
        res.status(500).send(e);
    });
}

/**
 * @api {put} /api/device_types/:id Update device type
 * @apiVersion 0.1.0
 * @apiName UpdateDeviceType
 * @apiGroup Device Types
 *
 * @apiParam {UUID} id Device type unique UUID.
 * 
 * @apiParam {Object} data Device Type information.
 * @apiParam {String} manufacturer Device Type manufacturer.
 * @apiParam {String} model Device Type model.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/device_types/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Device Type id.
 * @apiSuccess {Object} data Device Type information.
 * @apiSuccess {String} manufacturer Device Type manufacturer.
 * @apiSuccess {String} model Device Type model.
 * 
 * @apiError InvalidIdFormat Invalid Device Type Id Format.
 * @apiError emptyBody Empty POST body.
 * 
 */

DeviceTypesController.prototype.updateDeviceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateDeviceType', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    if (isEmptyObject(re.body)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    var dataDb = Models.DeviceTypes.parseData(req.body);

    Database.DeviceTypes.updateRow(req.params.uuid, dataDb).then(function (deviceType) {
        if (deviceType) {
            res.status(200).send(deviceType);
        } else {
            res.status(404).end();
        }

    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateDeviceType', e);
        res.status(500).send(e);
    });
}

/**
 * @api {delete} /api/device_types/:id Delete device type
 * @apiVersion 0.1.0
 * @apiName DeleteDeviceType
 * @apiGroup Device Types
 *
 * @apiParam {UUID} id Device type unique UUID.
 *
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/device_types/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *
 * @apiError InvalidIdFormat Invalid Device Type Id Format. 
 * 
 */
DeviceTypesController.prototype.deleteDeviceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceType', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.DeviceTypes.deleteDeviceTypeById(req.params.uuid).then(function (rowCount) {
        if (rowCount == 0) {
            res.status(404).end();
        } else {
            res.status(204).end();
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteDeviceType', e);
        res.status(500).send(e);
    });
}

module.exports = new DeviceTypesController();