'use strict';

function UsersDatabase() {}

UsersDatabase.prototype.getUsers = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUsers', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUsers', err);
                reject(err);
                return
            }
            client.query('SELECT users.id, users.username, users.created_date, users.modified_date, users.last_login_date, users.data, users.created_by, users.modified_by, users.organization_id, users.organization_permission_group_id, \
            organizations.data AS organization_data, organization_permissions_groups.group_name AS permission_group_name \
            FROM users LEFT JOIN organizations ON organizations.id = users.organization_id \
            LEFT JOIN organization_permissions_groups ON organization_permissions_groups.id = users.organization_permission_group_id WHERE NOT users.deleted AND NOT organizations.deleted', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUsers', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

UsersDatabase.prototype.getUserById = function (userId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM users WHERE id = $1 AND NOT deleted', [userId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserById', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

UsersDatabase.prototype.getUserByUsername = function (username) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserByUsername', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserByUsername', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM users WHERE username = $1 AND NOT deleted', [username], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getUserByUsername', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

UsersDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query('INSERT INTO users  \
                (id, username, password, created_date, modified_date, data, created_by, modified_by, organization_id, organization_permission_group_id, deleted) \
                VALUES ($1, $2, $3, NOW(), NOW(), $4, $5, $6, $7, $8, false))   \
                RETURNING id, username, created_date, modified_date, created_by, modified_by, organization_id, organization_permission_group_id, data',
                    [data.id, data.username, data.password, data.data, data.created_by, data.modified_by, data.organization_id, data.organization_permission_group_id],
                    function (err, result) {
                        done();
                        if (err) {
                            createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                            reject(err);
                        } else {
                            resolve(result.rows[0]);
                        }
                    });
        });
    });
}

UsersDatabase.prototype.updateRow = function (userId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                reject(err);
                return
            }

            client.query('UPDATE users  \
                SET modified_date=NOW(), modified_by=$1, organization_permission_group_id=$2, data=$3 WHERE id = $4 AND not deleted \
                RETURNING id, username, created_date, modified_date, created_by, modified_by, last_login_date, organization_id, organization_permission_group_id, data',
                    [data.modified_by, data.organization_permission_group_id, data.data, userId], function (err, result) {
                done();
				createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow','result', result);
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

UsersDatabase.prototype.updateUserLastLogin = function (userId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUserLastLogin', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUserLastLogin', err);
                reject(err);
                return
            }

            client.query('UPDATE users  \
                SET modified_date=NOW(), last_login_date=NOW() WHERE id = $1 AND not deleted \
                RETURNING id, username, created_date, modified_date, created_by, modified_by, last_login_date, organization_id, organization_permission_group_id, data',
                    [userId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUserLastLogin', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

UsersDatabase.prototype.updateUserLastLoginDate = function (userId, date) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUserLastLogin', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUserLastLogin', err);
                reject(err);
                return
            }

            client.query('UPDATE users  \
                SET modified_date=NOW(), last_login_date=$1 WHERE id = $2 AND not deleted \
                RETURNING id, username, created_date, modified_date, created_by, modified_by, last_login_date, organization_id, organization_permission_group_id, data',
                    [userId, date], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateUserLastLogin', err);
                    reject(err);
                } else {
                    resolve(result.rows[0]);
                }
            });
        });
    });
}

UsersDatabase.prototype.deleteUserById = function (userId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteUserById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                reateLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteUserById', err);
                reject(err);
                return
            }
            // client.query('DELETE FROM users WHERE id = $1',[userId],function (err, result) {
            client.query('UPDATE users SET deleted = true WHERE id = $1', [userId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteUserById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });

}

module.exports = new UsersDatabase();