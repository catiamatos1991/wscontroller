'use strict';

function InterfaceTypesController() {}

//create routes
InterfaceTypesController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .get(passport.authenticate('jwt', {session: false}), this.getAllInterfaceTypes)
            .post(passport.authenticate('jwt', {session: false}), this.createInterfaceType);
    router.route('/:uuid')
            .put(passport.authenticate('jwt', {session: false}), this.updateInterfaceType)
            .delete(passport.authenticate('jwt', {session: false}), this.deleteInterfaceType);

    return router;
}

/**
 * @api {get} /api/interface_types/ Request all interface types
 * @apiVersion 0.1.0
 * @apiName GetAllInterfaceTypes
 * @apiGroup Interface Types
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/interface_types/
 * 
 * @apiSuccess {Object[]} array An array of interface types
 * @apiSuccess {UUID} array.id Interface Type id.
 * @apiSuccess {Object} array.data Interface Type information.
 * @apiSuccess {String} array.name Interface Type name.
 * 
 */
InterfaceTypesController.prototype.getAllInterfaceTypes = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllInterfaceTypes', 'inicio');
    Database.InterfaceTypes.getInterfaceTypes().then(function (interfaceTypes) {
        if (interfaceTypes.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(interfaceTypes);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllInterfaceTypes', e);

        res.status(500).send(e);
    });
}

/**
 * @api {post} /api/interface_types/ Create new interface type
 * @apiVersion 0.1.0
 * @apiName CreateInterfaceType
 * @apiGroup Interface Types
 *
 * @apiParam {Object} data Interface Type information.
 * @apiParam {String} name Interface Type name.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/interface_types/
 * 
 * @apiSuccess {UUID} id Interface Type id.
 * @apiSuccess {Object} data Interface Type information.
 * @apiSuccess {String} name Interface Type name.
 * 
 * @apiError emptyBody Empty POST body.
 * 
 */
InterfaceTypesController.prototype.createInterfaceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createInterfaceType', 'inicio');
    var data = req.body;

    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    data.id = uuid.v4();
    var dataDb = Models.InterfaceTypes.parseData(data);

    Database.InterfaceTypes.addRow(dataDb).then(function (interfaceType) {
        res.location('/interface_types/' + interfaceType.id);
        res.status(201).send(interfaceType);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createInterfaceType', e);

        res.status(500).send(e);
    });
}

/**
 * @api {delete} /api/interface_types/:id Delete interface type
 * @apiVersion 0.1.0
 * @apiName DeleteInterfaceType
 * @apiGroup Interface Types
 *
 * @apiParam {UUID} id Interface type unique UUID.
 *
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/interface_types/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *
 * @apiError InvalidIdFormat Invalid Device Type Id Format. 
 * 
 */
InterfaceTypesController.prototype.deleteInterfaceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteInterfaceType', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.InterfaceTypes.deleteInterfaceTypeById(req.params.uuid).then(function (rowCount) {
        if (rowCount == 0) {
            res.status(404).end();
        } else {
            res.status(204).end();
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteInterfaceType', e);
        res.status(500).send(e);
    });
}

/**
 * @api {put} /api/interface_types/:id Update interface type
 * @apiVersion 0.1.0
 * @apiName UpdateInterfaceType
 * @apiGroup Interface Types
 *
 * @apiParam {UUID} id Interface type unique UUID.
 * 
 * @apiParam {Object} data Interface Type information.
 * @apiParam {String} name Interface Type name.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/interface_types/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Interface Type id.
 * @apiSuccess {Object} data Interface Type information.
 * @apiSuccess {String} name Interface Type name.
 * 
 * @apiError InvalidIdFormat Invalid Device Type Id Format.
 * @apiError emptyBody Empty POST body.
 * 
 */
InterfaceTypesController.prototype.updateInterfaceType = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateInterfaceType', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    if (isEmptyObject(req.body)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    var dataDb = Models.InterfaceTypes.parseData(req.body);

    Database.InterfaceTypes.updateRow(req.params.uuid, dataDb).then(function (interfaceType) {
        if (interfaceType) {
            res.status(200).send(interfaceType);
        } else {
            res.status(404).end();
        }

    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateInterfaceType', e);
        res.status(500).send(e);
    });
}

module.exports = new InterfaceTypesController();