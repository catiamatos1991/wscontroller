'use strict';

function UsersController() {}

//create routes
UsersController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .get(passport.authenticate('jwt', {session: false}), this.getAllUsers)
            .post(passport.authenticate('jwt', {session: false}), this.createUser);
    router.route('/:uuid')
            .get(this.getUser)
            .put(passport.authenticate('jwt', {session: false}), this.updateUser)
            .delete(passport.authenticate('jwt', {session: false}), this.deleteUser);
    router.post('/authenticate', this.authenticate);

    return router;
}

/**
 * @api {get} /api/users/ Request all users
 * @apiVersion 0.1.0
 * @apiName GetAllUsers
 * @apiGroup Users
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/users/
 *  
 * @apiSuccess {Object[]} array An array of users
 * @apiSuccess {UUID} array.id User id
 * @apiSuccess {UUID} array.created_by User created by
 * @apiSuccess {Date} array.created_date User created date
 * @apiSuccess {Object} array.data User data
 * @apiSuccess {String} array.permission_group_name User permissions group name
 * @apiSuccess {UUID} array.organization_permission_group_id User permissions group id
 * @apiSuccess {UUID} array.modified_by User modified by
 * @apiSuccess {Date} array.modified_date User modified date
 * @apiSuccess {Object} array.organization_data User organization data
 * @apiSuccess {UUID} array.organization_id User organization id
 * @apiSuccess {String} array.username User username
 * 
 */
UsersController.prototype.getAllUsers = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllUsers', 'inicio');
    Database.Users.getUsers().then(function (users) {
        if (users.length == 0) {
            res.status(204).end();
        } else {
            res.status(200).send(users);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllUsers', e);
        res.status(500).send(e);
    });
}

/**
 * @api {get} /api/users/:id Request user information
 * @apiVersion 0.1.0
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiExample Example usage
 * curl -i http://localhost/api/users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *  
 * @apiSuccess {UUID} id User id
 * @apiSuccess {UUID} created_by User created by
 * @apiSuccess {Date} created_date User created date
 * @apiSuccess {Object} data User data
 * @apiSuccess {UUID} organization_permission_group_id User permissions group id
 * @apiSuccess {UUID} modified_by User modified by
 * @apiSuccess {Date} modified_date User modified date
 * @apiSuccess {UUID} organization_id User organization id
 * @apiSuccess {String} username User username
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
UsersController.prototype.getUser = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUser', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Users.getUserById(req.params.uuid).then(function (users) {
        if (users.length == 0) {
            res.status(404).end();
        } else {
            res.status(200).send(users[0]);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUser', e);
        res.status(500).send(e);
    });
}

/**
 * @api {post} /api/users/ Create new user
 * @apiVersion 0.1.0
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiParam {UUID} created_by User created by 
 * @apiParam {Object} data User data
 * @apiParam {UUID} organization_permission_group_id User permissions group id
 * @apiParam {UUID} organization_id User organization id
 * @apiParam {String} username User username
 * @apiParam {String} password User password
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/users/
 *  
 * @apiSuccess {UUID} id User id
 * @apiSuccess {UUID} created_by User created by
 * @apiSuccess {Date} created_date User created date
 * @apiSuccess {Object} data User data
 * @apiSuccess {UUID} organization_permission_group_id User permissions group id
 * @apiSuccess {UUID} modified_by User modified by
 * @apiSuccess {Date} modified_date User modified date
 * @apiSuccess {UUID} organization_id User organization id
 * @apiSuccess {String} username User username
 * 
 * @apiError emptyBody Empty POST body.
 * 
 */
UsersController.prototype.createUser = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createUser', 'inicio');
    Controllers.Users.validateAuthentication(req.headers).then(function (message) {
		console.log('req.headers >>>>>>>', req.headers);
        var data = req.body;

        if (isEmptyObject(data)) {
            res.status(400).send({error: errorMessage.emptyBody});
            return;
        }
        if (data.username === undefined) {
            res.status(400).send({error: errorMessage.invalidUsername});
            return;
        }
        if (data.password === undefined) {
            res.status(400).send({error: errorMessage.invalidPassword});
            return;
        }

        Database.Users.getUserByUsername(req.body.username).then(function (user) {
            if (!user) {
                data.id = uuid.v4();
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createUser', 'getUserByUsername', err);
                        res.status(500).send(err);
                    }
                    bcrypt.hash(data.password, salt, function (err, hash) {
                        if (err) {
                            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createUser', 'getUserByUsername', err);
                            res.status(500).send(err);
                        }
                        data.password = hash;
                        var dataDb = Models.Users.parseData(data);

                        Database.Users.addRow(dataDb).then(function (user) {
                            res.location('/users/' + user.id);
                            res.status(201).send(user);
                        }).catch(function (e) {
                            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'createUser', 'addRow', e);
                            res.status(500).send(e);
                        });

                    });
                });
            } else {
                res.status(409).end();
            }
        });

    }).catch(function (e) {
        res.status(500).send(e);
    });

}

/**
 * @api {post} /api/users/:id Update user
 * @apiVersion 0.1.0
 * @apiName UpdateUser
 * @apiGroup Users
 *
 * @apiParam {UUID} id User id 
 * 
 * @apiParam {UUID} modified_by User modified by 
 * @apiParam {Object} data User data
 * @apiParam {UUID} organization_permission_group_id User permissions group id
 * @apiParam {UUID} organization_id User organization id
 * @apiParam {String} password User password
 * 
 * @apiExample Example usage
 * curl -X PUTT http://localhost/api/users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *  
 * @apiSuccess {UUID} id User id
 * @apiSuccess {UUID} created_by User created by
 * @apiSuccess {Date} created_date User created date
 * @apiSuccess {Object} data User data
 * @apiSuccess {UUID} organization_permission_group_id User permissions group id
 * @apiSuccess {UUID} modified_by User modified by
 * @apiSuccess {Date} modified_date User modified date
 * @apiSuccess {UUID} organization_id User organization id
 * @apiSuccess {String} username User username
 * 
 * @apiError InvalidIdFormat Invalid Id Format.
 * 
 */
UsersController.prototype.updateUser = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUser', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }
    var data = req.body;
    if (data.password !== undefined) {
        data.password = hash.update(data.password).digest('hex');
    }
    if (data.user_id === undefined || !validator.isUUID(data.user_id)) {
        res.status(400).send({error: errorMessage.invalidUserId});
        return;
    }

    if (data.permissions_id !== undefined) {
        if (!validator.isUUID(data.permissions_id)) {
            res.status(400).send({error: errorMessage.invalidPermissionsId});
            return;
        }
    }

    Database.Users.updateRow(req.params.uuid, data).then(function (user) {
        if (user) {
            res.status(200).send(user);
        } else {
            res.status(404).end();
        }

    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUser', 'error', e);
        res.status(500).send(e);
    });
}

/**
 * @api {delete} /api/users/:id Delete user
 * @apiVersion 0.1.0
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiParam {UUID} id User id.
 * 
 * @apiExample Example usage
 * curl -X DELETE http://localhost/api/users/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
 *   
 * @apiError InvalidIdFormat Invalid Id Format. 
 * 
 */
UsersController.prototype.deleteUser = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteUser', 'inicio');
    if (!validator.isUUID(req.params.uuid)) {
        res.status(400).send({error: errorMessage.invalidUuid});
        return;
    }

    Database.Users.deleteUserById(req.params.uuid).then(function (rowCount) {
        if (rowCount == 0) {
            res.status(404).end();
        } else {
            res.status(204).end();
        }
        res.end();
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteUser','error', e);
        res.status(500).send(e);
    });
}

UsersController.prototype.comparePassword = function (password, passwordDb, callback) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'comparePassword', 'inicio');
    bcrypt.compare(password, passwordDb, function (err, isMatch) {
        if (err) {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'comparePassword', 'error', err);
            return callback(err);
        }
        return callback(null, isMatch);
    });
}

/**
 * @api {post} /api/users/authenticate Authenticate user
 * @apiVersion 0.1.0
 * @apiName AuthenticateUser
 * @apiGroup Users
 *
 * @apiParam {String} username User username
 * @apiParam {String} password User password
 * 
 * @apiExample Example usage
 * curl -X POST http://localhost/api/users/authenticate
 *  
 * @apiSuccess {Boolean} success Authentication success
 * @apiSuccess {String} token Authentication token
 * @apiSuccess {Object} user User information
 * @apiSuccess {UUID} user.id User id
 * @apiSuccess {UUID} user.created_by User created by
 * @apiSuccess {Date} user.created_date User created date
 * @apiSuccess {Object} user.data User data
 * @apiSuccess {UUID} user.organization_permission_group_id User permissions group id
 * @apiSuccess {UUID} user.modified_by User modified by
 * @apiSuccess {Date} user.modified_date User modified date
 * @apiSuccess {UUID} user.organization_id User organization id
 * @apiSuccess {String} user.username User username
 * 
 * @apiError invalidUsername Username is not defined.
 * @apiError invalidPassword Password is not defined.
 * 
 */
UsersController.prototype.authenticate = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'authenticate', 'inicio');
    if (req.body.username === undefined) {
        res.status(400).send({error: errorMessage.invalidUsername});
        return;
    }

    if (req.body.password === undefined) {
        res.status(400).send({error: errorMessage.invalidPassword});
        return;
    }
	
	return Database.Users.getUserByUsername(req.body.username).then(function (user) {
        if (!user) {
            res.status(200).send({success: false, msg: 'Authentication failed'});
        } else {
            return Controllers.Users.comparePassword(req.body.password, user.password, function (err, isMatch) {
                if (isMatch && !err) {
                    var token = jwt.encode(user, 'Wav3sy5!');
					createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'validateAuthentication', 'token', jwt.decode(token, 'Wav3sy5!'));
                    delete user.password;
                    res.status(200).send({success: true, token: 'JWT ' + token, user: user});
					Database.Users.updateUserLastLogin(user.id);
					//var decoded = jwt.decode(token, 'Wav3sy5!');
					//Database.Users.updateUserLastLoginDate(user.id, decoded.last_login_date);
                } else {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'authenticate', 'Authentication failed');
                    res.status(200).send({success: false, msg: 'Authentication failed'});
                }
            });
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'authenticate', e);
        res.status(500).send(e);
    });
}

UsersController.prototype.validateAuthentication = function (headers) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'validateAuthentication', 'inicio');
    return new Promise(function (resolve, reject) {
        var token = Controllers.Users.getUserToken(headers);

        if (token) {
            var decoded = jwt.decode(token, 'Wav3sy5!');
            Database.Users.getUserByUsername(decoded.username).then(function (user) {
                if (!user) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'validateAuthentication','Authentication failed');
                    reject({status: 403, message: 'Authentication failed'});
                } else {
                    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'validateAuthentication','Authenticated');
                    resolve({status: 200, message: 'Authenticated'});
					Database.Users.updateUserLastLoginDate(user.id, decoded.last_login_date);
                }
            }).catch(function (e) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'validateAuthentication', 'error', e);
                reject(e);
            });
        } else {
            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'validateAuthentication','No token provided');
            reject({status: 403, message: 'No token provided'});
        }
    });
}

UsersController.prototype.getUserToken = function (headers) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserToken', 'inicio');
	createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserToken', 'headers', headers);
	
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

module.exports = new UsersController();
