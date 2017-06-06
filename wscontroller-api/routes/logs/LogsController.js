'use strict';

function LogsController() {}

//create routes
LogsController.prototype.setRoutes = function (express) {
    var router = express.Router();

    router.route('/')
            .get(passport.authenticate('jwt', {session: false}), this.getLogs);
	router.route('/log_events/')
	        .get(passport.authenticate('jwt', {session: false}), this.getAllDevicesLogsEvents);
    router.route('/types')
            .get(passport.authenticate('jwt', {session: false}), this.getLogTypes);
    router.route('/consumptions')
            .get(passport.authenticate('jwt', {session: false}), this.getConsumptions);
    return router;
}

/**
 * @api {get} /api/logs/ Request all logs
 * @apiVersion 0.1.0
 * @apiName GetAllLogs
 * @apiGroup Logs
 *
 * @apiParam {UUID} device_id device unique UUID.
 * @apiParam {Timestamp} start_timestamp Start data timestamp.
 * @apiParam {Timestamp} end_timestamp End data timestamp.
 * @apiParam {String} type Logs type.
 * @apiParam {String} measure Measure type.
 * 
 * @apiExample Example usage
 * curl http://localhost/api/logs?device_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&type=xxxxx&start_timestamp=000000&end_timestamp=000000&measure=medium
 *  
 * @apiSuccess {Object[]} array An array of logs
 * @apiSuccess {Numeric} array.agregation_period Log agregation period
 * @apiSuccess {Numeric[]} array.measure Array of measures (could be medium, maximum, minimum or sum)
 * @apiSuccess {Timestamp} array.timestamp Log timestamp
 * @apiSuccess {String} array.type Log type
 * 
 */
LogsController.prototype.getLogs = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getLogs', 'inicio');
    var endTimestamp = new Date().getTime() / 1000;
    var startTimestamp = 0;

    if (req.query.end_timestamp !== undefined) {
        endTimestamp = req.query.end_timestamp;
    }

    if (req.query.start_timestamp !== undefined) {
        startTimestamp = req.query.start_timestamp;
    }

    Database.Logs.getLogsByDevice(req.query.device_id, req.query.type, startTimestamp, endTimestamp, req.query.measure).then(function (logs) {
        if (logs.length == 0) {
            res.status(204).end();
        } else {
            res.status(200).send(logs);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getLogs', e);
        res.status(500).send(e);
    });

}

/**
 * @api {get} /api/logs/consumptions Get all device modems consumptions
 * @apiVersion 0.1.0
 * @apiName GetAllConsumptions
 * @apiGroup Logs
 *
 * @apiParam {UUID} device_id device unique UUID.
 * @apiParam {Timestamp} timestamp Start data timestamp.
 * 
 * @apiExample Example usage
 * curl http://localhost/api/logs/consumptions?device_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&timestamp=000000
 *  
 * @apiSuccess {Object[]} array An array of modems consumptions
 * @apiSuccess {Object} array.ltex Modem consumptions
 * @apiSuccess {Object} array.ltex.perday Consumptions per day
 * @apiSuccess {Object} array.ltex.perhour Consumptions per hour
 * 
 */

LogsController.prototype.getConsumptions = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getConsumptions', 'inicio');
    var today = new Date(req.query.timestamp * 1000);
    var startTimestamp = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0).getTime() / 1000;
    var endTimestamp = new Date(today.getFullYear(), today.getMonth() + 1, 1, 0, 0, 0, 0).getTime() / 1000 - 1;

    Database.Logs.getLogTypesByDevice(req.query.device_id, startTimestamp, endTimestamp).then(function (types) {
        var allPromises = [];
        var resultData = {};
        if (types.length > 0) {
            for (var i = 0; i < types.length; i++) {

                if (types[i].type.indexOf('net.lte') !== -1) {
                    allPromises.push(Database.Logs.getLogsByDevice(req.query.device_id, types[i].type, startTimestamp, endTimestamp, 'medium').then(function (logs) {
                        if (logs.length > 0) {
                            var splitKey = logs[0].type.split('.');
                            resultData[splitKey[splitKey.length - 1]] = logs;
                        }
                    }).catch(function (e) {
                        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getConsumptions', e);
                        res.status(500).send(e);
                    }));
                }
            }
            Promise.all(allPromises).then(function () {
                var result = Controllers.Logs.processData(resultData, startTimestamp, endTimestamp);

                res.status(200).send(result);
            });
        } else {
            res.status(204).end();
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getConsumptions', e);
        res.status(500).send(e);
    });
}

LogsController.prototype.processData = function (data, startTimestamp, endTimestamp) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'processData', 'inicio');
    var result = {};
    for (var modem in data) {

        var modemData = data[modem];
        var modemPerHour = [];
        var modemPerDay = [];
        var dataIndex = 0;
        var stopTimestamp = startTimestamp;
        var sumDown = 0;
        var sumUp = 0;
        var hoursCount = 0;
        var hourDown = 0;
        var hourUp = 0;

        while (endTimestamp > stopTimestamp) {
            stopTimestamp += 3600;
            sumDown = 0;
            sumUp = 0;

            for (var i = 0; i < modemData.length; i++) {
                if (modemData[i].timestamp < stopTimestamp && modemData[i].timestamp > stopTimestamp - 3600) {
                    sumDown += modemData[i].medium[0] * modemData[i].agregation_period;
                    sumUp += modemData[i].medium[1] * modemData[i].agregation_period;
                }/* else {
                 dataIndex = i;
                 break;
                 }*/
            }
            hourDown += sumDown;
            hourUp += sumUp;

            modemPerHour.push({timestamp: stopTimestamp - 3600, download: sumDown, upload: sumUp * (-1)});
            hoursCount++;

            if (hoursCount > 23) {
                modemPerDay.push({timestamp: stopTimestamp - (24 * 3600), download: hourDown, upload: hourUp * (-1)});
                hoursCount = 0;
                hourDown = 0;
                hourUp = 0;
            }
        }
        result[modem] = {};
        result[modem].perhour = modemPerHour;
        result[modem].perday = modemPerDay;
    }
    return result;
}

/**
 * @api {get} /api/logs/types Request all logs types
 * @apiVersion 0.1.0
 * @apiName GetAllLogsTypes
 * @apiGroup Logs
 *
 * @apiParam {UUID} device_id device unique UUID.
 * @apiParam {Timestamp} start_timestamp Start data timestamp.
 * @apiParam {Timestamp} end_timestamp End data timestamp.
 * 
 * @apiExample Example usage
 * curl http://localhost/api/logs/types?device_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&start_timestamp=000000&end_timestamp=000000
 *  
 * @apiSuccess {Object[]} array An array of logs types
 * @apiSuccess {String} array.type Log type
 * 
 */
LogsController.prototype.getLogTypes = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getLogTypes', 'inicio');
    var endTimestamp = new Date().getTime() / 1000;
    var startTimestamp = 0;

    if (req.query.end_timestamp !== undefined) {
        endTimestamp = req.query.end_timestamp;
    }

    if (req.query.start_timestamp !== undefined) {
        startTimestamp = req.query.start_timestamp;
    }

    Database.Logs.getLogTypesByDevice(req.query.device_id, startTimestamp, endTimestamp).then(function (types) {
        if (types.length == 0) {
            res.status(204).end();
        } else {
            res.status(200).send(types);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getLogTypes', e);
        res.status(500).send(e);
    });

}

LogsController.prototype.getAllDevicesLogsEvents = function (req, res, next) {
    createLog('info', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesLogsEvents', 'inicio');
    return Database.Logs.getDevicesLogEvents().then(function (devices) {
        if (devices.length == 0) {
            res.status(404).end();
        } else {
			createLog('debug', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesLogsEvents', 'devices');
            res.status(200).send(devices);
        }
    }).catch(function (e) {
        createLog('error', __dirname, __filename.slice(__dirname.length + 1, -3), null, 'getAllDevicesLogsEvents', e);
        res.status(500).send(e);
    });
}

module.exports = new LogsController();