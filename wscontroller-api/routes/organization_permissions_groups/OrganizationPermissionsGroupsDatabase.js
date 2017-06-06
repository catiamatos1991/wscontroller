'use strict';

function OrganizationPermissionsGroupsDatabase() {}

OrganizationPermissionsGroupsDatabase.prototype.getOrganizationPermissions = function () {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissions', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissions', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM organization_permissions_groups WHERE NOT deleted', [], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissions', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationPermissionsGroupsDatabase.prototype.getOrganizationPermissionsGroupById = function (organizationGroupId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissionsGroupById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissionsGroupById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM organization_permissions_groups WHERE id=$1 AND NOT deleted', [organizationGroupId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationPermissionsGroupById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationPermissionsGroupsDatabase.prototype.addRow = function (data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query("INSERT INTO organization_permissions_groups  \
                (id, group_name, created_date, modified_date, data, created_by, modified_by, deleted) \
                VALUES ($1, $2, NOW(), NOW(), $3, $4, $5, false)   \
                RETURNING id, group_name, created_date, modified_date, data, created_by, modified_by",
                    [data.id, data.group_name, data.data, data.created_by, data.modified_by], function (err, result) {
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

OrganizationPermissionsGroupsDatabase.prototype.deleteOrganizationPermissionsById = function (organizationGroupId) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationPermissionsById', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationPermissionsById', err);
                reject(err);
                return
            }
            //client.query('DELETE FROM organization_permissions_groups WHERE id = $1',[organizationGroupId],function (err, result) {
            client.query('UPDATE organization_permissions_groups SET deleted = true WHERE id = $1', [organizationGroupId], function (err, result) {

                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationPermissionsById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });
}

OrganizationPermissionsGroupsDatabase.prototype.updateRow = function (groupId, data) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', 'inicio');
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                reject(err);
                return
            }
            client.query("UPDATE organization_permissions_groups  \
                SET group_name=$1, modified_date=NOW(), data=$2, modified_by=$3 \
                WHERE id=$4 AND NOT deleted \
                RETURNING id, group_name, created_date, modified_date, data, created_by, modified_by",
                    [data.group_name, data.data, data.modified_by, groupId], function (err, result) {
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

module.exports = new OrganizationPermissionsGroupsDatabase();