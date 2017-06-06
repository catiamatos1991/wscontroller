'use strict';

function InterfaceTypesDatabase() {}

InterfaceTypesDatabase.prototype.getInterfaceTypes = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypes', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypes', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM interface_types WHERE NOT deleted', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypes', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfaceTypesDatabase.prototype.getInterfaceTypeById = function (interfaceTypeId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypeById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypeById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM interface_types WHERE id = $1 AND NOT deleted', [interfaceTypeId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypeById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfaceTypesDatabase.prototype.getInterfaceTypeByName = function (interfaceTypeName) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypeByName', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypeByName', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM interface_types WHERE name = $1 AND NOT deleted', [interfaceTypeName], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getInterfaceTypeByName', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

InterfaceTypesDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query('INSERT INTO interface_types (id, name, data, deleted) \
                VALUES ($1, $2, $3, false) RETURNING id, name, data;',
                    [data.id, data.name, data.data], function (err, result) {
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

InterfaceTypesDatabase.prototype.updateRow = function (interfaceTypeId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                reject(err);
                return
            }

            client.query('UPDATE interface_types SET name = $1, data = $2 WHERE id = $3 AND NOT deleted\
                RETURNING id, name, data',
                    [data.name, data.data, interfaceTypeId], function (err, result) {
                done();
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

InterfaceTypesDatabase.prototype.deleteInterfaceTypeById = function (interfaceTypeId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteInterfaceTypeById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteInterfaceTypeById', err);
                reject(err);
                return
            }
            //  client.query('DELETE FROM interface_types WHERE id = $1',[interfaceTypeId],function (err, result) {
            client.query('UPDATE interface_types set deleted = true WHERE id = $1', [interfaceTypeId], function (err, result) {

                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteInterfaceTypeById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });
}

module.exports = new InterfaceTypesDatabase();