'use strict';

function DevicesModel() {}

DevicesModel.prototype.parseData = function (data) {

    var device               = {};
    device.id                = data.id;  
    device.data              = data.data;
    device.vpn_configuration = data.vpn_configuration || null;
    device.created_by        = data.user_id || null;
    device.modified_by       = data.user_id || null;
    device.organization_id   = data.organization_id || null;
    device.device_type_id    = data.device_type_id || null;
    device.network_id        = data.network_id || null;
	device.access            = data.access;
    
    return device;
}

module.exports = new DevicesModel();