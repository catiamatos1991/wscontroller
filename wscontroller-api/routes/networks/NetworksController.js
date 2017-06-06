'use strict';

function NetworksController() {}

//create routes
NetworksController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .post(passport.authenticate('jwt', {session: false}), this.createNetwork);
    router.route('/:uuid')
            .put(passport.authenticate('jwt', {session: false}), this.updateNetwork)
            .delete(passport.authenticate('jwt', {session: false}), this.deleteNetwork);

    return router;
}

/**
 * @api {post} /api/networks/ Create new network
 * @apiVersion 0.1.0
 * @apiName CreateNetwork
 * @apiGroup Networks
 *
 * @apiParam {Object} data Network information.
 * @apiParam {UUID} created_by Network created by.
 * @apiParam {UUID} organization_id Network organization id.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/networks/
 * 
 * @apiSuccess {UUID} id Network id.
 * @apiSuccess {Date} created_date Network created date.
 * @apiSuccess {Date} modified_date Network modified date.
 * @apiSuccess {Object} data Network information.
 * @apiSuccess {UUID} created_by Network created by.
 * @apiSuccess {UUID} modified_by Network modified by.
 * @apiSuccess {UUID} organization_id Network organization id.
 * 
 * @apiError emptyBody Empty POST body.
 * 
 */
NetworksController.prototype.createNetwork = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createNetwork', 'inicio');
    var data = req.body;
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    data.id = uuid.v4();
    var dataDb = Models.Networks.parseData(data);

    Database.Networks.addRow(dataDb).then(function (network) {
        res.location('/networks/' + network.id);
        res.status(201).send(network);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createNetwork', e);
        res.status(500).send(e);
    });
}

/**
 * @api {delete} /api/networks/:id Delete network
 * @apiVersion 0.1.0
 * @apiName DeleteNetwork
 * @apiGroup Networks
 *
 * @apiParam {UUID} id Network unique UUID.
 *
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/networks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *
 * @apiError InvalidIdFormat Invalid Device Type Id Format. 
 * 
 */
NetworksController.prototype.deleteNetwork = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteNetwork', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Networks.deleteNetworkById(req.params.uuid).then(function (rowCount) {
        if (rowCount == 0) {
            res.status(404).end();
        } else {
            res.status(204).end();
        }
        res.end();
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteNetwork', e);
        res.status(500).send(e);
    });
}

/**
 * @api {put} /api/networks/:id Update network
 * @apiVersion 0.1.0
 * @apiName UpdateNetwork
 * @apiGroup Networks
 *
 * @apiParam {UUID} id Network id.
 * 
 * @apiParam {Object} data Network information.
 * @apiParam {UUID} modified_by Network created by.
 * @apiParam {UUID} organization_id Network organization id.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/networks/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Network id.
 * @apiSuccess {Date} created_date Network created date.
 * @apiSuccess {Date} modified_date Network modified date.
 * @apiSuccess {Object} data Network information.
 * @apiSuccess {UUID} created_by Network created by.
 * @apiSuccess {UUID} modified_by Network modified by.
 * @apiSuccess {UUID} organization_id Network organization id.
 * 
 * @apiError InvalidIdFormat Invalid Device Type Id Format.
 * 
 */
NetworksController.prototype.updateNetwork = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateNetwork', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var dataDb = Models.Networks.parseData(req.body);

    Database.Networks.updateRow(req.params.uuid, dataDb).then(function (network) {
        if (network) {
            res.status(200).send(network);
        } else {
            res.status(404).end();
        }

    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateNetwork', e);
        res.status(500).send(e);
    });
}

module.exports = new NetworksController();