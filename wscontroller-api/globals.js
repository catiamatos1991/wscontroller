//Require configs
global.configs      = require('../config.json');

//Global requires
global.express      = require('express');
global.http         = require('http');
global.bodyParser   = require('body-parser');
global.pg           = require('pg');
global.fs           = require('fs');
global.path         = require('path');
global.Promise      = require('bluebird');
global.validator    = require('validator');
global.crypto       = require('crypto');
global.uuid         = require('node-uuid');
global.passport     = require('passport');
global.jwtStrategy  = require('passport-jwt').Strategy;
global.extractJwt   = require('passport-jwt').ExtractJwt;
global.jwt          = require('jwt-simple');
global.bcrypt       = require('bcrypt');
global._           = require('lodash');
global.winston	   = require('winston');
global.moment      = require('moment');
global.winstonDailyRotateFile = require('winston-daily-rotate-file');

//Global modules
global.Models       = {};
global.Controllers  = {};
global.Database     = {};

//Global configs
global.routeDirectory            = '/opt/wscontroller/wscontroller-api/routes';
global.serverPort                = global.configs.servers.api.port;
global.dbConnectionString        = 'postgres://'+global.configs.config.databases.ws_controller.username+':'
                                    +global.configs.config.databases.ws_controller.password+'@'
                                    +global.configs.config.databases.ws_controller.server+':'
                                    +global.configs.config.databases.ws_controller.port+'/'
                                    +global.configs.config.databases.ws_controller.name;
global.dbStatsConnectionString   = 'postgres://'+global.configs.config.databases.ws_controller_stats.username+':'
                                    +global.configs.config.databases.ws_controller_stats.password+'@'
                                    +global.configs.config.databases.ws_controller_stats.server+':'
                                    +global.configs.config.databases.ws_controller_stats.port+'/'
                                    +global.configs.config.databases.ws_controller_stats.name;
global.dbHistConnectionString    = 'postgres://'+global.configs.config.databases.ws_controller_hist.username+':'
                                    +global.configs.config.databases.ws_controller_hist.password+'@'
                                    +global.configs.config.databases.ws_controller_hist.server+':'
                                    +global.configs.config.databases.ws_controller_hist.port+'/'
                                    +global.configs.config.databases.ws_controller_hist.name;
global.radioUsername             = global.configs.devices.wavesys.username;
global.radioPassword             = global.configs.devices.wavesys.password;
global.radioAccess               = {};

//endpoints
global.endpoints              = {};
global.endpoints.wsInterfaces = '/wavesys/status/interface';

//error messages
global.errorMessage = {};
global.errorMessage.invalidUuid             = 'InvalidIdFormat';
global.errorMessage.invalidUserId           = 'Invalid user id';
global.errorMessage.invalidOrganizationId   = 'Invalid organization id';
global.errorMessage.invalidPermissionsId    = 'Invalid permissions id';
global.errorMessage.emptyBody               = 'Request body is empty';
global.errorMessage.invalidUsername         = 'Username is not defined';
global.errorMessage.invalidPassword         = 'Password is not defined';
global.errorMessage.invalidDomain           = 'Domain is not defined';
global.errorMessage.invalidManufacturer     = 'Manufacturer is not defined';
global.errorMessage.invalidModel            = 'Model is not defined';

//global.router = express.Router();

/*** Global functions ***/
global.getDirectories = function (srcPath) {
    return fs.readdirSync(srcPath).filter(function (file) {
        return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
}

global.getFiles = function (srcPath) {
    return fs.readdirSync(srcPath).filter(function (file) {
        return fs.statSync(path.join(srcPath, file)).isFile();
    });
}

global.isEmptyObject = function (obj) {
    return !Object.keys(obj).length;
}


/*** winston ***/
winston.emitErrs = true;

var transport = new (winston.transports.Console)({
    level: 'debug',
    prettyPrint: true,
    colorize: true,
    silent: false,
	compress: true,
    timestamp: function () {
        return '[' + moment().format('YYYY-MM-DD HH:mm:ss.SSS') + ']';
    },
	max: '1g',
	keep: 31,
    formatter: function (options) {
        return options.timestamp() + ' - ' +
                winston.config.colorize(options.level, options.level) + ': ' +
                (options.message ? options.message : '') +
                (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
    }
});

global.logger = new (winston.Logger)({
    transports: [transport]
});

logger.add(winstonDailyRotateFile, {
    filename: 'log_wscontroller_api_',
    dirname: "/var/log/wscontroller",
    datePattern: "yyyyMMdd",
    prettyPrint: true,
    level: 'debug',
    colorize: false,
    silent: false,
    timestamp: true,
    json:false,
	compress:true,
	zippedArchive: true,
	maxFiles: 31,
    maxsize: 2097152
});


global.createLog = function (type, nodeApp, fileName, deviceId, functionName, message, value) {
	deviceId = deviceId || "NA";
    var fn = eval(`logger.${type}`);
    return fn(nodeApp, fileName, deviceId, functionName, message, JSON.stringify(value));
}

createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'Database WSController Running on ', global.configs.config.databases.ws_controller.port);

