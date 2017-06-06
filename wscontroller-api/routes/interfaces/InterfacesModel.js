'use strict';

function InterfacesModel() {}

InterfacesModel.prototype.parseData = function (data) {

    var interfaceData               = {};
    interfaceData.id                = data.id;  
    interfaceData.created_date      = data.created_date || null;
    interfaceData.modified_date     = data.modified_date || null;
    interfaceData.created_by        = data.created_by || null;
    interfaceData.modified_by       = data.modified_by || null;
    interfaceData.device_id         = data.device_id || null;
    interfaceData.interface_type_id = data.interface_type_id || null;
    interfaceData.data              = data.data || null;
    interfaceData.organization_id   = data.organization_id || null;
    interfaceData.deleted           = data.deleted || null;

    return interfaceData;
}

module.exports = new InterfacesModel();