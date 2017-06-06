'use strict';

function OrganizationsDatabase() {}

OrganizationsDatabase.prototype.getOrganizations = function () {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizations', err);
                reject(err);
                return
            }
            client.query("SELECT * FROM organizations WHERE NOT deleted", [], function (err, result) {
                done();
                if (err) {
                   createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizations', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationsDatabase.prototype.getOrganizationById = function (organizationId) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
               createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM organizations WHERE id = $1 AND NOT deleted', [organizationId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationsDatabase.prototype.addRow = function (data) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'addRow', err);
                reject(err);
                return
            }
            client.query("INSERT INTO organizations  \
                (id, domain, data, deleted) \
                VALUES ($1, $2, $3, false)   \
                RETURNING id, domain, data",
                    [data.id, data.domain, data.data], function (err, result) {
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

OrganizationsDatabase.prototype.updateRow = function (organizationId, data) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'updateRow', err);
                reject(err);
                return
            }

            client.query("UPDATE organizations SET domain=$1, data=$2 WHERE id = $3 AND NOT deleted RETURNING id, domain, data",
                    [data.domain, data.data, organizationId], function (err, result) {
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

OrganizationsDatabase.prototype.deleteOrganizationById = function (organizationId) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationById', err);
                reject(err);
                return
            }
            // client.query('DELETE FROM organizations WHERE id = $1 AND NOT deleted',[organizationId],function (err, result) {
            client.query('UPDATE organizations SET deleted = true WHERE id = $1 AND NOT deleted', [organizationId], function (err, result) {

                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'deleteOrganizationById', err);
                    reject(err);
                } else {
                    resolve(result.rowCount);
                }
            });
        });
    });
}

OrganizationsDatabase.prototype.getOrganizationDevicesById = function (organizationId) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationDevicesById', err);
                reject(err);
                return
            }
            client.query('SELECT devices.*, device_types.manufacturer AS manufacturer, device_types.model AS model, device_types.data AS device_types_data, networks.data AS network_data FROM devices \
            LEFT JOIN device_types ON devices.device_type_id = device_types.id \
            LEFT JOIN networks ON devices.network_id = networks.id  WHERE devices.organization_id = $1 AND NOT devices.deleted', [organizationId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationDevicesById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationsDatabase.prototype.getOrganizationUsersById = function (organizationId) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationUsersById', err);
                reject(err);
                return
            }
            client.query("SELECT users.id, users.username, users.data, users.organization_permission_group_id, organization_permissions_groups.group_name AS permission_group_name FROM users \
                LEFT JOIN organization_permissions_groups ON organization_permissions_groups.id = users.organization_permission_group_id \
                WHERE users.organization_id = $1 AND NOT users.deleted AND NOT organization_permissions_groups.deleted",
                    [organizationId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationUsersById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationsDatabase.prototype.getOrganizationNetworksById = function (organizationId) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationNetworksById', err);
                reject(err);
                return
            }
            client.query('SELECT * FROM networks WHERE organization_id = $1 AND NOT deleted', [organizationId], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationNetworksById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

OrganizationsDatabase.prototype.getOrganizationAlertsById = function (organizationId, type) {
    return new Promise(function (resolve, reject) {
        pg.connect(dbStatsConnectionString, function (err, client, done) {
            if (err) {
                createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationAlertsById', err);
                reject(err);
                return
            }
            var appendString = '';
            if (type != 'logevent') {
                appendString = " AND data->>'read' = 'false'";
            }
            client.query('SELECT * FROM alerts WHERE organization_id = $1 AND type = $2' + appendString + ' ORDER BY timestamp DESC', [organizationId, type], function (err, result) {
                done();
                if (err) {
                    createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getOrganizationAlertsById', err);
                    reject(err);
                } else {
                    resolve(result.rows);
                }
            });
        });
    });
}

module.exports = new OrganizationsDatabase();