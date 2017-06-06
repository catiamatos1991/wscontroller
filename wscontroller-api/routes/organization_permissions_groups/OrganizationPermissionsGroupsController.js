'use strict';

function OrganizationPermissionsGroupsController() {}

//create routes
OrganizationPermissionsGroupsController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .get(passport.authenticate('jwt', {session: false}), this.getAllOrganizationPermissionsGroups)
            .post(passport.authenticate('jwt', {session: false}), this.createOrganizationPermissionsGroup);

    router.route('/:uuid')
            .get(passport.authenticate('jwt', {session: false}), this.getOrganizationPermissionsGroup)
            .put(passport.authenticate('jwt', {session: false}), this.updateOrganizationPermissionsGroup)
            .delete(passport.authenticate('jwt', {session: false}), this.deleteOrganizationPermissionsGroup);

    return router;
}

/**
 * @api {get} /api/organization_permissions_groups/:id Request organization permissions group information
 * @apiVersion 0.1.0
 * @apiName GetOrganizationPermissionsGroup
 * @apiGroup Organization Permissions Groups
 *
 * @apiParam {UUID} id Organization Permissions Group id.
 * 
 * @apiExample Example usage
 * curl -i http://localhost/api/organization_permissions_groups/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Organization Permissions Group id.
 * @apiSuccess {Object} data Organization Permissions Group information.
 * @apiSuccess {String} group_name Organization Permissions Group group name.
 * @apiSuccess {Date} created_date Organization Permissions Group created date.
 * @apiSuccess {Date} modified_date Organization Permissions Group modified date.
 * @apiSuccess {UUID} created_by Organization Permissions Group created by.
 * @apiSuccess {UUID} modified_by Organization Permissions Group modified by.
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
OrganizationPermissionsGroupsController.prototype.getOrganizationPermissionsGroup = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissionsGroup', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.OrganizationPermissionsGroups.getOrganizationPermissionsGroupById(req.params.uuid).then(function (groups) {
        if (groups.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(groups[0]);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissionsGroup', e);
        res.status(500).send(e);
    });

}

/**
 * @api {put} /api/organization_permissions_groups/:id Update organization permissions group
 * @apiVersion 0.1.0
 * @apiName UpdateOrganizationPermissionsGroup
 * @apiGroup Organization Permissions Groups
 *
 * @apiParam {UUID} id Organization Permissions Group id.
 * @apiParam {Object} data Organization Permissions Group information.
 * @apiParam {String} group_name Organization Permissions Group group name.
 * @apiParam {UUID} modified_by Organization Permissions Group modified by.
 * 
 * @apiExample Example usage
 * curl -X PUT http://localhost/api/organization_permissions_groups/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 * 
 * @apiSuccess {UUID} id Organization Permissions Group id.
 * @apiSuccess {Object} data Organization Permissions Group information.
 * @apiSuccess {String} group_name Organization Permissions Group group name.
 * @apiSuccess {Date} created_date Organization Permissions Group created date.
 * @apiSuccess {Date} modified_date Organization Permissions Group modified date.
 * @apiSuccess {UUID} created_by Organization Permissions Group created by.
 * @apiSuccess {UUID} modified_by Organization Permissions Group modified by.
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * @apiError emptyBody Empty POST body.
 * 
 */
OrganizationPermissionsGroupsController.prototype.updateOrganizationPermissionsGroup = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateOrganizationPermissionsGroup', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    var data = req.body;
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    var dataDb = Models.OrganizationPermissionsGroups.parseData(data);

    Database.OrganizationPermissionsGroups.updateRow(req.params.uuid, dataDb).then(function (group) {
        if (group) {
            res.status(200).send(group);
        } else {
            res.status(404).end();
        }
    }).catch(function (e) {
       createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateOrganizationPermissionsGroup', e);
        res.status(500).send(e);
    });

}

/**
 * @api {delete} /api/organization_permissions_groups/:id Delete organization permissions group
 * @apiVersion 0.1.0
 * @apiName DeleteOrganizationPermissionsGroup
 * @apiGroup Organization Permissions Groups
 *
 * @apiParam {UUID} id Organization Permissions Group id.
 * 
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/organization_permissions_groups/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *   
 * @apiError InvalidIdFormat Invalid Id Format. 
 * 
 */
OrganizationPermissionsGroupsController.prototype.deleteOrganizationPermissionsGroup = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationPermissionsGroup', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.OrganizationPermissionsGroups.deleteOrganizationPermissionsById(req.params.uuid).then(function (rowCount) {
        if (rowCount == 0) {
            res.status(404).end();
        } else {
            res.status(204).end();
        }
        res.end();
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationPermissionsGroup', e);

        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/organization_permissions_groups/ Request all organization permission groups
 * @apiVersion 0.1.0
 * @apiName GetAllOrganizationPermissionsGroups
 * @apiGroup Organization Permissions Groups
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/organization_permissions_groups/
 * 
 * @apiSuccess {Object[]} array An array of organization permissions groups
 * @apiSuccess {UUID} array.id Organization Permissions Group id.
 * @apiSuccess {Object} array.data Organization Permissions Group information.
 * @apiSuccess {String} array.group_name Organization Permissions Group group name.
 * @apiSuccess {Date} array.created_date Organization Permissions Group created date.
 * @apiSuccess {Date} array.modified_date Organization Permissions Group modified date.
 * @apiSuccess {UUID} array.created_by Organization Permissions Group created by.
 * @apiSuccess {UUID} array.modified_by Organization Permissions Group modified by.
 * 
 */
OrganizationPermissionsGroupsController.prototype.getAllOrganizationPermissionsGroups = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllOrganizationPermissionsGroups', 'inicio');
    Database.OrganizationPermissionsGroups.getOrganizationPermissions().then(function (groups) {
        if (groups.length == 0) {
            res.status(204).end();
        } else {
            res.status(200).send(groups);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllOrganizationPermissionsGroups', e);

        res.status(500).send(e);
    });

}

/**
 * @api {post} /api/organization_permissions_groups/ Create organization permissions group
 * @apiVersion 0.1.0
 * @apiName CreateOrganizationPermissionsGroup
 * @apiGroup Organization Permissions Groups
 *
 * @apiParam {Object} data Organization Permissions Group information.
 * @apiParam {String} group_name Organization Permissions Group group name.
 * @apiParam {UUID} created_by Organization Permissions Group created by.
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/organization_permissions_groups/
 * 
 * @apiSuccess {UUID} id Organization Permissions Group id.
 * @apiSuccess {Object} data Organization Permissions Group information.
 * @apiSuccess {String} group_name Organization Permissions Group group name.
 * @apiSuccess {Date} created_date Organization Permissions Group created date.
 * @apiSuccess {Date} modified_date Organization Permissions Group modified date.
 * @apiSuccess {UUID} created_by Organization Permissions Group created by.
 * @apiSuccess {UUID} modified_by Organization Permissions Group modified by.
 * 
 * @apiError emptyBody Empty POST body.
 * 
 */
OrganizationPermissionsGroupsController.prototype.createOrganizationPermissionsGroup = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createOrganizationPermissionsGroup', 'inicio');
    var data = req.body;
    if (isEmptyObject(data)) {
        res.status(400).send({error: errorMessage.emptyBody});
        return;
    }

    data.id = uuid.v4();

    var dataDb = Models.OrganizationPermissionsGroups.parseData(data);

    Database.OrganizationPermissionsGroups.addRow(dataDb).then(function (group) {
        res.location('/organization_permissions_groups/' + group.id);
        res.status(201).send(group);
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createOrganizationPermissionsGroup', e);
        res.status(500).send(e);
    });
}

module.exports = new OrganizationPermissionsGroupsController();