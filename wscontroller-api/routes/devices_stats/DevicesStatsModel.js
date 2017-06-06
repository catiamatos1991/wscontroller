'use strict';

function DevicesStatsModel() {}

DevicesStatsModel.prototype.parseData = function (data) {

    var device               = {};
    device.id                = data.id;  
    device.data              = data.data;
    device.device_id    	 = data.device_id || null;
    
    return device;
}

module.exports = new DevicesStatsModel();