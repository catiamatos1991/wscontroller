'use strict';

function DeviceTypesModel() {}

DeviceTypesModel.prototype.parseData = function (data) {

    var deviceType          = {};
    deviceType.id           = data.id;  
    deviceType.data         = data.data || null;
    deviceType.manufacturer = data.manufacturer || null;
    deviceType.model        = data.model || null;    
    deviceType.deleted      = data.deleted || null;    

    return deviceType;
}

module.exports = new DeviceTypesModel();