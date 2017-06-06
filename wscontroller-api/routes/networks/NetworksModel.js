'use strict';

function NetworksModel() {}

NetworksModel.prototype.parseData = function (data) {

    var network             = {};
    network.id              = data.id;
    network.created_by      = data.user_id || null;
    network.modified_by     = data.user_id || null;
    network.data            = data.data || null;
    network.created_date    = data.created_date || null;
    network.modified_date   = data.modified_date || null;
    network.organization_id = data.organization_id || null;
    network.deleted         = data.deleted || null;

    return network;
}

module.exports = new NetworksModel();