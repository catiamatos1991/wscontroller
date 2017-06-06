'use strict';

function OrganizationsController() {}

//create routes
OrganizationsController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .get(passport.authenticate('jwt', {session: false}), this.getAllOrganizations)
            .post(passport.authenticate('jwt', {session: false}), this.createOrganization);
    router.route('/:uuid')
            .get(passport.authenticate('jwt', {session: false}), this.getOrganization)
            .put(passport.authenticate('jwt', {session: false}), this.updateOrganization)
            .delete(passport.authenticate('jwt', {session: false}), this.deleteOrganization);
    router.route('/:uuid/devices')
            .get(passport.authenticate('jwt', {session: false}), this.getOrganizationDevices);
    router.route('/:uuid/users')
            .get(passport.authenticate('jwt', {session: false}), this.getOrganizationUsers);
    router.route('/:uuid/networks')
            .get(passport.authenticate('jwt', {session: false}), this.getOrganizationNetworks);
    router.route('/:uuid/alerts')
            .get(passport.authenticate('jwt', {session: false}), this.getOrganizationAlerts);


    return router;
}

/**
 * @api {get} /api/organizations/:id Request organization information
 * @apiVersion 0.1.0
 * @apiName GetOrganization
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Organization id.
 * @apiSuccess {Object} data Organization information.
 * @apiSuccess {String} domain Organization domain.
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationsController.prototype.getOrganization = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganization', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Organizations.getOrganizationById(req.params.uuid).then(function (organizations) {
        if (organizations.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(organizations[0]);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganization', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/organizations/ Request all organizations
 * @apiVersion 0.1.0
 * @apiName GetAllOrganizations
 * @apiGroup Organizations
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/organizations/
 * 
 * @apiSuccess {Object[]} array An array of organizations
 * @apiSuccess {UUID} array.id Organization id.
 * @apiSuccess {Object} array.data Organization information.
 * @apiSuccess {String} array.domain Organization domain.
 * 
 */
OrganizationsController.prototype.getAllOrganizations = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllOrganizations', 'inicio');
    Database.Organizations.getOrganizations().then(function (organizations) {
        if (organizations.length == 0) {
            res.status(204).end();
        } else {
            res.status(200).send(organizations);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllOrganizations', e);
        res.status(500).send(e);
    });
}

/**
 * @api {post} /api/organizations/ Create new organization
 * @apiVersion 0.1.0
 * @apiName CreateOrganization
 * @apiGroup Organizations
 *
 * @apiParam {Object} data Organization information.
 * @apiParam {String} domain Organization domain.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Organization id.
 * @apiSuccess {Object} data Organization information.
 * @apiSuccess {String} domain Organization domain.
 * 
 * @apiError emptyBody Empty POST body.
 * 
 */
OrganizationsController.prototype.createOrganization = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createOrganization', 'inicio');
    var data = req.body;
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }
    if (data.domain === undefined) {
        res.status(400).send({error: errorMessage.invalidDomain});
        return;
    }

    data.id = uuid.v4();

    var dataDb = Models.Organizations.parseData(data);

    Database.Organizations.addRow(dataDb).then(function (organization) {
        res.location('/organizations/' + organization.id);
        res.status(201).send(organization);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createOrganization', e);
        res.status(500).send(e);
    });
}

/**
 * @api {put} /api/organizations/:id Update organization information
 * @apiVersion 0.1.0
 * @apiName UpdateOrganization
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * @apiParam {Object} data Organization information.
 * @apiParam {String} domain Organization domain.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Organization id.
 * @apiSuccess {Object} data Organization information.
 * @apiSuccess {String} domain Organization domain.
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationsController.prototype.updateOrganization = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateOrganization', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var dataDb = Models.Organizations.parseData(req.body);

    Database.Organizations.updateRow(req.params.uuid, dataDb).then(function (organization) {
        if (organization) {
            res.status(200).send(organization);
        } else {
            res.status(404).end();
        }

    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateOrganization', e);
        res.status(500).send(e);
    });
}

/**
 * @api {delete} /api/organizations/:id Delete organization
 * @apiVersion 0.1.0
 * @apiName DeleteOrganization
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * 
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *   
 * @apiError InvalidIdFormat Invalid Id Format. 
 * 
 */
OrganizationsController.prototype.deleteOrganization = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganization', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Organizations.deleteOrganizationById(req.params.uuid).then(function (rowCount) {
        if (rowCount == 0) {
            res.status(404).end();
        } else {
            res.status(204).end();
        }
        res.end();
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganization', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/organizations/:id/devices/ Request all organization devices
 * @apiVersion 0.1.0
 * @apiName GetAllOrganizationDevices
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/devices/
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
 * @apiSuccess {UUID} array.network_data Device network data
 * @apiSuccess {Object} array.organization_data Device organization data
 * @apiSuccess {UUID} array.organization_id Device organization id
 * @apiSuccess {Object} array.vpn_configuration Device VPN configuration
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationsController.prototype.getOrganizationDevices = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationDevices', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Organizations.getOrganizationDevicesById(req.params.uuid).then(function (organizationDevices) {
        res.status(200).send(organizationDevices);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationDevices', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/organizations/:id/users/ Request all organization users
 * @apiVersion 0.1.0
 * @apiName GetAllOrganizationUsers
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/users/
 *  
 * @apiSuccess {Object[]} array An array of users
 * @apiSuccess {UUID} array.id User id
 * @apiSuccess {UUID} array.organization_permission_group_id User organization permissions group id
 * @apiSuccess {String} array.permission_group_name User permissions group name
 * @apiSuccess {String} array.username User username
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationsController.prototype.getOrganizationUsers = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationUsers', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Organizations.getOrganizationUsersById(req.params.uuid).then(function (organizationUsers) {
        res.status(200).send(organizationUsers);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationUsers', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/organizations/:id/networks/ Request all organization networks
 * @apiVersion 0.1.0
 * @apiName GetAllOrganizationNetworks
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/networks/
 *  
 * @apiSuccess {Object[]} array An array of networks
 * @apiSuccess {UUID} array.id Network id.
 * @apiSuccess {Date} array.created_date Network created date.
 * @apiSuccess {Date} array.modified_date Network modified date.
 * @apiSuccess {Object} array.data Network information.
 * @apiSuccess {UUID} array.created_by Network created by.
 * @apiSuccess {UUID} array.modified_by Network modified by.
 * @apiSuccess {UUID} array.organization_id Network organization id.
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationsController.prototype.getOrganizationNetworks = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationNetworks', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Organizations.getOrganizationNetworksById(req.params.uuid).then(function (organizationNetworks) {
        res.status(200).send(organizationNetworks);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationNetworks', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/organizations/:id/alerts/ Request all organization alerts
 * @apiVersion 0.1.0
 * @apiName GetAllOrganizationAlerts
 * @apiGroup Organizations
 *
 * @apiParam {UUID} id Organization id.
 * @apiParam {String} type Alert type.
 * 
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/organizations/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/alerts?type=warning
 *  
 * @apiSuccess {Object[]} array An array of alerts
 * @apiSuccess {UUID} array.id Alert id.
 * @apiSuccess {Timestamp} array.timestamp Alert timestamp.
 * @apiSuccess {UUID} array.device_id Alert device id.
 * @apiSuccess {UUID} array.item_id Alert item id.
 * @apiSuccess {UUID} array.organization_id Network organization id.
 * @apiSuccess {Object} array.data Alert data
 * @apiSuccess {String} array.type Alert type.
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationsController.prototype.getOrganizationAlerts = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationAlerts', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var type = req.query.type;

    Database.Organizations.getOrganizationAlertsById(req.params.uuid, type).then(function (organizationAlerts) {
        res.status(200).send(organizationAlerts);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationAlerts', e);
        res.status(500).send(e);
    });

}

module.exports = new OrganizationsController();