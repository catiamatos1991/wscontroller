'use strict';

function AlertsModel() {}

AlertsModel.prototype.parseData = function (data) {

    var alert             = {};
    alert.id              = data.id;  
    alert.timestamp       = data.timestamp || null;
    alert.type            = data.type || null;
    alert.data            = data.data || null;
    alert.device_id       = data.device_id || null;
    alert.item_id         = data.item_id || null;
    alert.network_id      = data.network_id || null;
    alert.organization_id = data.organization_id || null;
    alert.deleted         = data.deleted || null;

    return alert;
}

module.exports = new AlertsModel();