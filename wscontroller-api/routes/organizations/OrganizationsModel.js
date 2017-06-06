'use strict';

function OrganizationsModel() {}

OrganizationsModel.prototype.parseData = function (data) {

    var organization        = {};
    organization.id         = data.id;
    organization.domain     = data.domain;    
    organization.data       = data.data || null;
    organization.deleted    = data.deleted || null;

    return organization;
}

module.exports = new OrganizationsModel();
