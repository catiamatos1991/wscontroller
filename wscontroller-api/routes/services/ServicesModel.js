'use strict';

function ServicesModel() {}

ServicesModel.prototype.parseData = function (data) {

    var service               = {};
    service.id                = data.id;  
    service.data              = data.data;
    service.device_id    	 = data.device_id || null;
    
    return service;
}

module.exports = new ServicesModel();