'use strict';

function InterfaceTypesModel() {}

InterfaceTypesModel.prototype.parseData = function (data) {

    var interfaceType  = {};
    interfaceType.id   = data.id;  
    interfaceType.data = data.data || null;
    interfaceType.name = data.name || null;  
    interfaceType.deleted = data.deleted || null;  

    return interfaceType;
}

module.exports = new InterfaceTypesModel();