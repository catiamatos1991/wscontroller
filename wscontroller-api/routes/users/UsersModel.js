'use strict';

function UsersModel() {}

UsersModel.prototype.parseData = function (data) {

    var user                              = {};
    user.id                               = data.id;
    user.username                         = data.username;  
    user.password                         = data.password;
    user.created_by                       = data.user_id || null;
    user.modified_by                      = data.user_id || null;
    user.data                             = data.data || null;
    user.created_date                     = data.created_date || null;
    user.modified_date                    = data.modified_date || null;
    user.organization_id                  = data.organization_id || null;
    user.organization_permission_group_id = data.organization_permission_group_id || null;
    user.deleted                          = data.deleted || null;
	user.last_login_date				  = data.last_login_date || null;
	
    return user;
}

module.exports = new UsersModel();