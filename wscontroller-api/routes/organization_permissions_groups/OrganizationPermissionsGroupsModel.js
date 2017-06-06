'use strict';

function OrganizationPermissionsModel() {}

OrganizationPermissionsModel.prototype.parseData = function (data) {

    var group           = {};
    group.id            = data.id;
    group.group_name    = data.group_name || null;    
    group.data          = data.data || null;
    group.created_date  = data.created_date || null;
    group.modified_date = data.modified_date || null;
    group.created_by    = data.user_id || null;
    group.modified_by   = data.user_id || null;
    group.deleted       = data.deleted || null;

    return group;
}

module.exports = new OrganizationPermissionsModel();