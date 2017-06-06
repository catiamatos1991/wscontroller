'use strict';

function ConfigurationsModel() {}

ConfigurationsModel.prototype.parseData = function (data) {

    var configuration             = {};
    configuration.id              = data.id;  
    configuration.data            = data.data;    
    configuration.created_by      = data.user_id || null;
    configuration.modified_by     = data.user_id || null;
    configuration.organization_id = data.organization_id || null;
    configuration.device_id       = data.device_id || null;
    configuration.config_type     = data.config_type || null;    
    configuration.deleted         = data.deleted || null;    

    return configuration;
}

module.exports = new ConfigurationsModel();